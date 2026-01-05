#!/usr/bin/env python3
"""
Dhaka MRT-6 Timetable Generator
Generates train timetables for weekdays, Friday, and Saturday schedules.
"""

import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

# Station time offsets in minutes from starting station
STATIONS_TO_MOTIJHEEL = {
    "Uttara North": 0,
    "Uttara Center": 2,
    "Uttara South": 4,
    "Pallabi": 7,
    "Mirpur 11": 9,
    "Mirpur 10": 12,
    "Kazipara": 14,
    "Sewrapara": 16,
    "Agargoan": 19,
    "Bijoy Sarani": 21,
    "Farmgate": 23,
    "Karwan Bazar": 25,
    "Shahbag": 27,
    "Dhaka University": 29,
    "Bangladesh Secretariat": 32,
    "Motijheel": 35
}

# Reverse for Uttara North direction
STATIONS_TO_UTTARA = {
    "Motijheel": 0,
    "Bangladesh Secretariat": 3,
    "Dhaka University": 6,
    "Shahbag": 8,
    "Karwan Bazar": 10,
    "Farmgate": 12,
    "Bijoy Sarani": 14,
    "Agargoan": 16,
    "Sewrapara": 19,
    "Kazipara": 21,
    "Mirpur 10": 24,
    "Mirpur 11": 26,
    "Pallabi": 28,
    "Uttara South": 31,
    "Uttara Center": 34,
    "Uttara North": 36
}


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
        # Try parsing 24-hour format first
        return datetime.strptime(time_str, "%H:%M")
    except ValueError:
        try:
            # Try 12-hour format with AM/PM
            return datetime.strptime(time_str, "%I:%M %p")
        except ValueError:
            raise ValueError(f"Invalid time format: {time_str}. Use HH:MM, HHMM, or HH:MM AM/PM")


def format_time(dt: datetime) -> str:
    """Format datetime to HH:MM string"""
    return dt.strftime("%H:%M")


def generate_train_times(start_time: str, end_time: str, headway: int) -> List[str]:
    """Generate train departure times based on start, end time and headway
    
    Note: Generates trains from start_time up to (but NOT including) end_time.
    This allows consecutive time slots without duplication.
    For example: 7:10-7:30 with 10min headway generates [7:10, 7:20]
    Then 7:30-8:00 with 10min headway generates [7:30, 7:40, 7:50]
    
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
    
    # Use < instead of <= to exclude the end time
    while current_time < end_dt:
        train_times.append(format_time(current_time))
        current_time += timedelta(minutes=headway)
    
    return train_times


def parse_slots(section_text: str) -> List[tuple]:
    """Parse timing slots from config section"""
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
            start_time, end_time, headway = parts
            try:
                headway_int = int(headway)
                slots.append((start_time, end_time, headway_int))
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
    for i, (start_time, end_time, headway) in enumerate(slots_motijheel, 1):
        trains = generate_train_times(start_time, end_time, headway)
        all_trains_motijheel.extend(trains)
        print(f"  Slot {i}: {start_time} to {end_time}, headway {headway} min → {len(trains)} trains")
    
    # Remove duplicates and sort
    all_trains_motijheel = sorted(list(set(all_trains_motijheel)))
    print(f"✓ Total trains towards Motijheel: {len(all_trains_motijheel)}")
    
    # Process Platform 2 (Towards Uttara North)
    print("\nPLATFORM 2: Trains towards Uttara North")
    print(f"Found {len(slots_uttara)} timing slots")
    
    # Generate all train times for Uttara direction
    all_trains_uttara = []
    for i, (start_time, end_time, headway) in enumerate(slots_uttara, 1):
        trains = generate_train_times(start_time, end_time, headway)
        all_trains_uttara.extend(trains)
        print(f"  Slot {i}: {start_time} to {end_time}, headway {headway} min → {len(trains)} trains")
    
    # Remove duplicates and sort
    all_trains_uttara = sorted(list(set(all_trains_uttara)))
    print(f"✓ Total trains towards Uttara North: {len(all_trains_uttara)}")
    
    # Calculate times for all stations
    print("\nCalculating station times...")
    
    # Build the complete timetable structure
    complete_timetable = {}
    
    # For each station, calculate times for both directions
    for station in STATIONS_TO_MOTIJHEEL.keys():
        complete_timetable[station] = {}
        
        # Calculate times for this station when trains go towards Motijheel
        offset_to_motijheel = STATIONS_TO_MOTIJHEEL[station]
        times_to_motijheel = []
        for train_time in all_trains_motijheel:
            dt = parse_time(train_time)
            arrival = dt + timedelta(minutes=offset_to_motijheel)
            times_to_motijheel.append(format_time(arrival))
        complete_timetable[station]["Motijheel"] = times_to_motijheel
        
        # Calculate times for this station when trains go towards Uttara North
        offset_to_uttara = STATIONS_TO_UTTARA[station]
        times_to_uttara = []
        for train_time in all_trains_uttara:
            dt = parse_time(train_time)
            arrival = dt + timedelta(minutes=offset_to_uttara)
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
