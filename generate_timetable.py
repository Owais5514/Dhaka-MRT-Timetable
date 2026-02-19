#!/usr/bin/env python3
"""
Dhaka MRT-6 Timetable Generator
Generates train timetables for weekdays, Friday, and Saturday schedules.

Uses inter-station journey times (MM:SS) + station wait/dwell times.
Rush headway alternates between 6:00 and 5:30 for consecutive trains.
"""

import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Tuple


def parse_duration(dur_str: str) -> int:
    """Parse a MM:SS or M:SS duration string to total seconds."""
    parts = dur_str.strip().split(':')
    return int(parts[0]) * 60 + int(parts[1])


# ── Inter-station journey times (travel time from the PREVIOUS station) ──
# Edit these values to match actual travel times between consecutive stations.
# Format: (station_name, "M:SS")  — time it takes to reach this station from the one above it.

JOURNEY_TIMES_TO_MOTIJHEEL = [
    ("Uttara North",            "0:00"),   # Starting station
    ("Uttara Center",           "1:40"),   # from Uttara North
    ("Uttara South",            "1:50"),   # from Uttara Center
    ("Pallabi",                 "2:50"),   # from Uttara South
    ("Mirpur 11",               "1:10"),   # from Pallabi
    ("Mirpur 10",               "1:30"),   # from Mirpur 11
    ("Kazipara",                "1:20"),   # from Mirpur 10
    ("Sewrapara",               "1:20"),   # from Kazipara
    ("Agargoan",                "1:40"),   # from Sewrapara
    ("Bijoy Sarani",            "1:50"),   # from Agargoan
    ("Farmgate",                "1:50"),   # from Bijoy Sarani
    ("Karwan Bazar",            "1:50"),   # from Farmgate
    ("Shahbag",                 "2:00"),   # from Karwan Bazar
    ("Dhaka University",        "2:00"),   # from Shahbag
    ("Bangladesh Secretariat",  "3:00"),   # from Dhaka University
    ("Motijheel",               "3:00"),   # from Bangladesh Secretariat
]

JOURNEY_TIMES_TO_UTTARA = [
    ("Motijheel",               "0:00"),   # Starting station
    ("Bangladesh Secretariat",  "3:00"),   # from Motijheel
    ("Dhaka University",        "3:00"),   # from Bangladesh Secretariat
    ("Shahbag",                 "2:00"),   # from Dhaka University
    ("Karwan Bazar",            "2:00"),   # from Shahbag
    ("Farmgate",                "1:50"),   # from Karwan Bazar
    ("Bijoy Sarani",            "1:50"),   # from Farmgate
    ("Agargoan",                "1:50"),   # from Bijoy Sarani
    ("Sewrapara",               "1:40"),   # from Agargoan
    ("Kazipara",                "1:20"),   # from Sewrapara
    ("Mirpur 10",               "1:20"),   # from Kazipara
    ("Mirpur 11",               "1:30"),   # from Mirpur 10
    ("Pallabi",                 "1:10"),   # from Mirpur 11
    ("Uttara South",            "2:50"),   # from Pallabi
    ("Uttara Center",           "1:50"),   # from Uttara South
    ("Uttara North",            "1:40"),   # from Uttara Center
]

# ── Station wait / dwell time categories (seconds) ──
WAIT_CATEGORIES = {
    "low":    30,   # 0:30 — quick stop
    "medium": 45,   # 0:45 — standard stop
    "high":   60,   # 1:00 — long stop
}

DEFAULT_WAIT = "medium"

# Per-station wait time overrides (applies to all periods unless overridden below)
# Set to a category name ("low"/"medium"/"high") or an integer (seconds).
STATION_WAIT_OVERRIDES: Dict[str, any] = {
    # Stations not listed here use DEFAULT_WAIT ("medium" = 45s)
}

# Per-period, per-station wait time overrides
# Format: { "rush": {"Farmgate": "low"}, "offpeak": {}, "custom": {} }
PERIOD_WAIT_OVERRIDES: Dict[str, Dict[str, any]] = {
    "rush": {
        "Kazipara":      "high",
        "Sewrapara":     "high",
        "Agargoan":      "high",
    },
    "offpeak": {
        "Uttara Center": "low",
        "Uttara South":  "low",
        "Mirpur 11":     "low",
        "Mirpur 10":     "medium",
        "Kazipara":      "low",
        "Sewrapara":     "low",
    },
    "custom": {
        "Uttara Center": "low",
        "Uttara South":  "low",
        "Mirpur 11":     "low",
        "Mirpur 10":     "low",
        "Kazipara":      "low",
        "Sewrapara":     "low",
    },
}

# ── Headway configuration ──
# "rush" alternates between 6:00 (360s) and 5:30 (330s).
# "offpeak" is a fixed 8:00 (480s).
RUSH_HEADWAYS = (360, 330)   # alternating: 6:00, 5:30, 6:00, 5:30, …
OFFPEAK_HEADWAY = 480        # 8:00


def get_wait_time(station: str, period_type: str) -> int:
    """Get the dwell/wait time in seconds for a station during a given period.
    
    Checks (in order): period-specific override → station override → default.
    """
    # 1. Period-specific override
    period_overrides = PERIOD_WAIT_OVERRIDES.get(period_type, {})
    if station in period_overrides:
        val = period_overrides[station]
        return WAIT_CATEGORIES[val] if isinstance(val, str) else int(val)

    # 2. Station-level override (all periods)
    if station in STATION_WAIT_OVERRIDES:
        val = STATION_WAIT_OVERRIDES[station]
        return WAIT_CATEGORIES[val] if isinstance(val, str) else int(val)

    # 3. Default
    return WAIT_CATEGORIES[DEFAULT_WAIT]


def compute_station_offsets(journey_times: List[Tuple[str, str]], period_type: str) -> Dict[str, int]:
    """Compute cumulative arrival offset (seconds) for each station.

    offset[0] = 0  (origin — departure time)
    offset[i] = Σ journey[1..i] + Σ wait[1..i-1]

    Wait/dwell is added at every intermediate station (not at origin or terminal).
    """
    offsets: Dict[str, int] = {}
    cumulative = 0

    for i, (station, dur_str) in enumerate(journey_times):
        journey_sec = parse_duration(dur_str)
        cumulative += journey_sec
        offsets[station] = cumulative

        # Add dwell time at intermediate stations (not first, not last)
        if 0 < i < len(journey_times) - 1:
            cumulative += get_wait_time(station, period_type)

    return offsets


def parse_time(time_str: str) -> datetime:
    """Parse time string in format HH:MM or HHMM (12 or 24 hour)"""
    time_str = time_str.strip()
    
    # If no colon present, add it (e.g., 730 -> 7:30, 0730 -> 07:30)
    if ':' not in time_str:
        # Check if AM/PM is present
        if 'AM' in time_str.upper() or 'PM' in time_str.upper():
            # Split the AM/PM part
            time_part = time_str.split()[0]
            am_pm = time_str.split()[1]
            # Add colon to time part
            if len(time_part) == 3:  # e.g., 730
                time_str = f"{time_part[0]}:{time_part[1:]} {am_pm}"
            elif len(time_part) == 4:  # e.g., 0730
                time_str = f"{time_part[:2]}:{time_part[2:]} {am_pm}"
        else:
            # No AM/PM, just add colon
            if len(time_str) == 3:  # e.g., 730
                time_str = f"{time_str[0]}:{time_str[1:]}"
            elif len(time_str) == 4:  # e.g., 0730
                time_str = f"{time_str[:2]}:{time_str[2:]}"
    
    try:
        # Try parsing HH:MM:SS format first
        return datetime.strptime(time_str, "%H:%M:%S")
    except ValueError:
        pass
    
    try:
        # Try parsing 24-hour HH:MM format
        return datetime.strptime(time_str, "%H:%M")
    except ValueError:
        try:
            # Try 12-hour format with AM/PM
            return datetime.strptime(time_str, "%I:%M %p")
        except ValueError:
            raise ValueError(f"Invalid time format: {time_str}. Use HH:MM, HH:MM:SS, HHMM, or HH:MM AM/PM")


def format_time(dt: datetime) -> str:
    """Format datetime to HH:MM string"""
    return dt.strftime("%H:%M:%S")


def parse_headway(headway_str: str):
    """Parse headway string.

    Accepts:
    - 'rush'    → returns the string "rush" (alternating 6:00 / 5:30)
    - 'offpeak' → returns 480 (8:00)
    - MM:SS     → returns total seconds  (e.g. '5:30' → 330)
    - Plain min → returns total seconds  (e.g. '10'   → 600)

    Returns int (seconds) for fixed headways, or the string "rush".
    """
    headway_str = headway_str.strip().lower()

    if headway_str == "rush":
        return "rush"

    if headway_str == "offpeak":
        return OFFPEAK_HEADWAY

    if ':' in headway_str:
        parts = headway_str.split(':')
        return int(parts[0]) * 60 + int(parts[1])

    return int(headway_str) * 60


def generate_train_times(start_time: str, end_time: str, headway) -> List[str]:
    """Generate train departure times based on start, end time and headway.

    headway — int (fixed seconds) or "rush" (alternates 6:00 / 5:30).

    Note: Generates trains from start_time up to (but NOT including) end_time.
    This allows consecutive time slots without duplication.
    For example: 7:10-7:30 with 10:00 headway generates [7:10:00, 7:20:00]
    Then 7:30-8:00 with 10:00 headway generates [7:30:00, 7:40:00, 7:50:00]

    Special case: If start_time == end_time, generates exactly one train at that time.
    """
    start_dt = parse_time(start_time)
    end_dt = parse_time(end_time)

    # Special case: same start and end time means one train at that exact time
    if start_dt == end_dt:
        return [format_time(start_dt)]

    # Handle times crossing midnight
    if end_dt <= start_dt:
        end_dt += timedelta(days=1)

    train_times = []
    current_time = start_dt
    rush_toggle = 0  # index into RUSH_HEADWAYS

    # Use < instead of <= to exclude the end time
    while current_time < end_dt:
        train_times.append(format_time(current_time))
        if headway == "rush":
            interval = RUSH_HEADWAYS[rush_toggle]
            rush_toggle = 1 - rush_toggle
        else:
            interval = headway
        current_time += timedelta(seconds=interval)

    return train_times


def parse_slots(section_text: str) -> List[tuple]:
    """Parse timing slots from config section.
    
    Returns list of (start_time, end_time, headway, period_type) tuples.
    headway is int (seconds) for fixed, or "rush" for alternating.
    period_type is "rush", "offpeak", or "custom".
    """
    slots = []
    lines = section_text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        # Skip empty lines, comments, and code block markers
        if not line or line.startswith('#') or line.startswith('```'):
            continue
        
        # Parse format: START | END | HEADWAY
        parts = [p.strip() for p in line.split('|')]
        if len(parts) == 3:
            start_time, end_time, headway_str = parts
            try:
                headway = parse_headway(headway_str)
                # Determine period type for station wait-time selection
                h = headway_str.strip().lower()
                if h == "rush":
                    period_type = "rush"
                elif h == "offpeak":
                    period_type = "offpeak"
                else:
                    period_type = "custom"
                slots.append((start_time, end_time, headway, period_type))
            except ValueError:
                print(f"Warning: Skipping invalid line: {line}")
                continue
    
    return slots


def read_config_file(config_path: str = "timetable-config.md") -> Dict[str, Tuple[Tuple[str, str], List[tuple], List[tuple]]]:
    """Read timetable configuration from markdown file for all schedules"""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Configuration file '{config_path}' not found!\n"
            f"Please create it or run with the default timetable-config.md"
        )
    
    schedule_mapping = {
        'weekdays': ('docs/mrt-6.json', 'Weekdays (Sun-Thu)'),
        'friday': ('docs/mrt-6-fri.json', 'Friday'),
        'saturday': ('docs/mrt-6-sat.json', 'Saturday')
    }
    
    all_schedules = {}
    
    # Extract each schedule's sections
    for schedule_key, (output_file, schedule_name) in schedule_mapping.items():
        # Find the schedule section - match the header and content until next ## at start of line
        section_pattern = rf'##\s+{schedule_key}[^\n]*\n(.*?)(?=\n##\s+\w+|\Z)'
        section_match = re.search(section_pattern, content, re.IGNORECASE | re.DOTALL)
        
        if not section_match:
            print(f"Warning: {schedule_key} schedule section not found in config file")
            continue
        
        section_content = section_match.group(1)
        
        # Extract Motijheel slots from this section
        motijheel_match = re.search(
            r'MOTIJHEEL_SLOTS:(.*?)(?=UTTARA_SLOTS:|$)', 
            section_content, 
            re.DOTALL | re.IGNORECASE
        )
        
        # Extract Uttara slots from this section
        uttara_match = re.search(
            r'UTTARA_SLOTS:(.*?)(?=```\s*$|$)', 
            section_content, 
            re.DOTALL | re.IGNORECASE
        )
        
        if motijheel_match and uttara_match:
            motijheel_slots = parse_slots(motijheel_match.group(1))
            uttara_slots = parse_slots(uttara_match.group(1))
            all_schedules[schedule_key] = ((output_file, schedule_name), motijheel_slots, uttara_slots)
    
    return all_schedules


def generate_schedule(schedule_name: str, output_file: str, slots_motijheel: List[tuple], slots_uttara: List[tuple]):
    """Generate timetable for a single schedule"""
    print("\n" + "=" * 60)
    print(f"GENERATING: {schedule_name}")
    print("=" * 60)
    
    # Process Platform 1 (Towards Motijheel)
    print("\nPLATFORM 1: Trains towards Motijheel")
    print(f"Found {len(slots_motijheel)} timing slots")
    
    # Generate all train times for Motijheel direction
    all_trains_motijheel = []
    for i, (start_time, end_time, headway_sec, period_type) in enumerate(slots_motijheel, 1):
        trains = generate_train_times(start_time, end_time, headway_sec)
        for t in trains:
            all_trains_motijheel.append((t, period_type))
        if headway_sec == "rush":
            headway_display = "rush (6:00/5:30)"
        else:
            headway_display = f"{headway_sec // 60}:{headway_sec % 60:02d}"
        print(f"  Slot {i}: {start_time} to {end_time}, headway {headway_display} → {len(trains)} trains")
    
    # Remove duplicates (keep first period_type) and sort
    seen = {}
    for t, p in all_trains_motijheel:
        if t not in seen:
            seen[t] = p
    all_trains_motijheel = sorted(seen.items())
    print(f"✓ Total trains towards Motijheel: {len(all_trains_motijheel)}")
    
    # Process Platform 2 (Towards Uttara North)
    print("\nPLATFORM 2: Trains towards Uttara North")
    print(f"Found {len(slots_uttara)} timing slots")
    
    # Generate all train times for Uttara direction
    all_trains_uttara = []
    for i, (start_time, end_time, headway_sec, period_type) in enumerate(slots_uttara, 1):
        trains = generate_train_times(start_time, end_time, headway_sec)
        for t in trains:
            all_trains_uttara.append((t, period_type))
        if headway_sec == "rush":
            headway_display = "rush (6:00/5:30)"
        else:
            headway_display = f"{headway_sec // 60}:{headway_sec % 60:02d}"
        print(f"  Slot {i}: {start_time} to {end_time}, headway {headway_display} → {len(trains)} trains")
    
    # Remove duplicates (keep first period_type) and sort
    seen = {}
    for t, p in all_trains_uttara:
        if t not in seen:
            seen[t] = p
    all_trains_uttara = sorted(seen.items())
    print(f"✓ Total trains towards Uttara North: {len(all_trains_uttara)}")
    
    # Pre-compute station offsets for each period type
    print("\nCalculating station times (journey + dwell offsets)...")
    offsets_by_period = {}
    for period in ("rush", "offpeak", "custom"):
        offsets_motijheel = compute_station_offsets(JOURNEY_TIMES_TO_MOTIJHEEL, period)
        offsets_uttara    = compute_station_offsets(JOURNEY_TIMES_TO_UTTARA, period)
        offsets_by_period[period] = (offsets_motijheel, offsets_uttara)
    
    # Station name list (consistent order)
    station_names = [s for s, _ in JOURNEY_TIMES_TO_MOTIJHEEL]
    
    # Build the complete timetable structure
    complete_timetable = {}
    
    for station in station_names:
        complete_timetable[station] = {}
        
        # Calculate times for this station — Motijheel direction
        times_to_motijheel = []
        for dep_time, period_type in all_trains_motijheel:
            offset = offsets_by_period[period_type][0][station]
            dt = parse_time(dep_time)
            arrival = dt + timedelta(seconds=offset)
            times_to_motijheel.append(format_time(arrival))
        complete_timetable[station]["Motijheel"] = times_to_motijheel
        
        # Calculate times for this station — Uttara North direction
        times_to_uttara = []
        for dep_time, period_type in all_trains_uttara:
            offset = offsets_by_period[period_type][1][station]
            dt = parse_time(dep_time)
            arrival = dt + timedelta(seconds=offset)
            times_to_uttara.append(format_time(arrival))
        complete_timetable[station]["Uttara North"] = times_to_uttara
    
    # Save to JSON file
    with open(output_file, 'w') as f:
        json.dump(complete_timetable, f, indent=2)
    
    print(f"✓ Saved to {output_file}")


def generate_full_timetable(config_path: str = "timetable-config.md"):
    """Generate complete timetables for all schedules"""
    print("=" * 60)
    print("Dhaka MRT-6 Timetable Generator")
    print("=" * 60)
    
    # Read configuration from file
    print("\nReading configuration from timetable-config.md...")
    try:
        all_schedules = read_config_file(config_path)
    except Exception as e:
        print(f"\n❌ Error reading config file: {e}")
        return
    
    if not all_schedules:
        print("\n❌ No schedules found in config file!")
        return
    
    print(f"✓ Configuration loaded successfully")
    print(f"✓ Found {len(all_schedules)} schedule(s): {', '.join(all_schedules.keys())}")
    
    # Generate each schedule
    for schedule_key, ((output_file, schedule_name), slots_motijheel, slots_uttara) in all_schedules.items():
        generate_schedule(schedule_name, output_file, slots_motijheel, slots_uttara)
    
    # Summary
    print("\n" + "=" * 60)
    print("ALL TIMETABLES GENERATED SUCCESSFULLY!")
    print("=" * 60)
    print(f"✓ {len(all_schedules)} schedule(s) generated:")
    for schedule_key, ((output_file, schedule_name), _, _) in all_schedules.items():
        print(f"  • {schedule_name} → {output_file}")
    print("=" * 60)


if __name__ == "__main__":
    try:
        generate_full_timetable()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
