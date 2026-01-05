# MRT-6 Timetable Configuration

Edit this file to set up your timetable, then run `generate_timetable.py`

---

## Schedule Type

**Note:** The script now generates ALL THREE schedules automatically!
You don't need to change this setting anymore. Just edit the timing slots below.

```
SCHEDULE: weekdays
```

---

## WEEKDAYS (Sunday to Thursday) Schedule

### Platform 1: Trains towards Motijheel

Format: `START_TIME | END_TIME | HEADWAY_MINUTES`

You can use any format: `730`, `7:30`, or `7:30 AM`

```
MOTIJHEEL_SLOTS:
630 | 710 | 20
710 | 730 | 10
730 | 810 | 8
810 | 1052 | 6
1052 | 1620 | 8
1620 | 1914 | 6
1914 | 2000 | 8
2000 | 2100 | 10
2100 | 2130 | 15
```

### Platform 2: Trains towards Uttara North

Format: `START_TIME | END_TIME | HEADWAY_MINUTES`

```
UTTARA_SLOTS:
715 | 730 | 15
730 | 810 | 10
810 | 850 | 8
850 | 1132 | 6
1132 | 1137 | 5
1137 | 1658 | 8
1658 | 1952 | 6
1952 | 2040 | 8
2040 | 2140 | 10
2140 | 2210 | 15
```

---

## FRIDAY Schedule

**To use Friday schedule, change SCHEDULE to: `friday`**

### Platform 1: Trains towards Motijheel

```
MOTIJHEEL_SLOTS:
1500 | 2100 | 10
```

### Platform 2: Trains towards Uttara North

```
UTTARA_SLOTS:
1520 | 2140 | 10
```

---

## SATURDAY (and Public Holidays) Schedule

**To use Saturday schedule, change SCHEDULE to: `saturday`**

### Platform 1: Trains towards Motijheel

```
MOTIJHEEL_SLOTS:
630 | 730 | 20
710 | 725 | 15
725 | 1038 | 12
1038 | 2100 | 10
2100 | 2130 | 15
```

### Platform 2: Trains towards Uttara North

```
UTTARA_SLOTS:
715 | 730 | 15
730 | 1118 | 12
1118 | 2140 | 8
2140 | 2210 | 15
```

---

## Notes

- **Automatic generation**: The script generates all 3 schedules (weekdays/friday/saturday) in one run
- Edit timing slots for each schedule in their respective sections above
- Times can be in any format: `630`, `7:30`, or `7:30 AM`
- Headway is in minutes (time between trains)
- Each slot generates trains from START up to (but NOT including) END time
- Empty lines and lines starting with `#` are ignored
- To add a single train at a specific time, use the same start and end time with headway 1
  Example: `2116 | 2116 | 1` creates one train at 21:16

## Quick Instructions

1. **Edit the timing slots** in the schedule sections above (WEEKDAYS, FRIDAY, SATURDAY)
2. **Run the generator**: `python3 generate_timetable.py`
3. **Done!** All 3 JSON files are generated automatically:
   - `docs/mrt-6.json` (Weekdays)
   - `docs/mrt-6-fri.json` (Friday)
   - `docs/mrt-6-sat.json` (Saturday)
