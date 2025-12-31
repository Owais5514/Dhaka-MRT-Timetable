# MRT-6 Timetable Generator

This Python script generates train timetables for Dhaka MRT-6 metro line based on configuration file.

## Quick Start

1. Edit `timetable-config.md` with your timing slots
2. Run `python3 generate_timetable.py`
3. Done! Your JSON file is generated in `docs/`

## Features

- **No interactive input needed** - Edit config file and run
- Generate timetables for:
  - Weekdays (Sunday to Thursday) → `mrt-6.json`
  - Friday → `mrt-6-fri.json`
  - Saturday → `mrt-6-sat.json`
- Support for multiple timing slots with different headways
- Automatic calculation of arrival times for all 16 stations
- Both directions: Uttara North ↔ Motijheel
- Automatic duplicate removal and time sorting

## Station Order & Travel Times

### Towards Motijheel (Platform 1)
```
Uttara North (0 min) → Uttara Center (+2) → Uttara South (+5) → 
Pallabi (+8) → Mirpur 11 (+10) → Mirpur 10 (+12) → Kazipara (+14) → 
Sewrapara (+16) → Agargoan (+19) → Bijoy Sarani (+21) → Farmgate (+23) → 
Karwan Bazar (+25) → Shahbag (+27) → Dhaka University (+29) → 
Bangladesh Secretariat (+32) → Motijheel (+35)
```

### Towards Uttara North (Platform 2)
Same stations in reverse order with corresponding travel times.

## Usage

### Step 1: Edit Configuration File

Open `timetable-config.md` and edit:

1. **Schedule type**: Set to `weekdays`, `friday`, or `saturday`
   ```
   SCHEDULE: weekdays
   ```

2. **Platform 1 (Towards Motijheel)**: Add timing slots
   ```
   MOTIJHEEL_SLOTS:
   630 | 710 | 20
   711 | 731 | 10
   739 | 811 | 8
   ```

3. **Platform 2 (Towards Uttara North)**: Add timing slots
   ```
   UTTARA_SLOTS:
   750 | 805 | 15
   806 | 846 | 10
   ```

### Step 2: Run the Generator

```bash
python3 generate_timetable.py
```

The script will:
- Read timing slots from `timetable-config.md`
- Generate all train times with specified headways
- Calculate arrival times for all 16 stations
- Save to the appropriate JSON file

### Configuration Format

Each timing slot uses: `START_TIME | END_TIME | HEADWAY_MINUTES`

- **START_TIME**: When first train departs (e.g., `630`, `7:30`, `7:30 AM`)
- **END_TIME**: When to stop generating trains (excluded from results)
- **HEADWAY_MINUTES**: Minutes between consecutive trains

**Special case**: To add a single train at a specific time:
```
2116 | 2116 | 1
```
This creates exactly one train at 21:16.

## Output

TheExamples

### Example 1: Consecutive Time Slots
```
630 | 710 | 20    → Generates: 6:30, 6:50
711 | 731 | 10    → Generates: 7:11, 7:21
739 | 811 | 8     → Generates: 7:39, 7:47, 7:55, 8:03
```
No duplicates! End times are excluded from each slot.

### Example 2: Rush Hour vs Off-Peak
```
630 | 900 | 6     → Rush hour: Every 6 minutes
900 | 1700 | 10   → Off-peak: Every 10 minutes
1700 | 2100 | 6   → Evening rush: Every 6 minutes
```

### Example 3: Single Train
```
2116 | 2116 | 1   → Creates one train at 21:16
```

- The script automatically calculates how many trains can run within each timing slot based on the headway
- Times crossing midnight are handled correctly
- Generated files are saved in the `docs/` directory
- Existing timetable files will be overwritten
