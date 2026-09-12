# MRT-6 Timetable Configuration

Edit this file to set up your timetable, then run `generate_timetable.py`

---

## Headway Categories

The following predefined headway categories are available:

| Category   | Interval             | Description                                    |
|------------|----------------------|------------------------------------------------|
| `rush`     | 6:00                    | Rush hour — fixed 6 min interval                     |
| `offpeak`  | 8:00                 | Off-peak hour                                  |

You can also specify a custom headway in `MM:SS` format (e.g., `10:00`, `15:00`, `5:30`)
or plain minutes for backward compatibility (e.g., `10` = 10 minutes).

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

Format: `START_TIME | END_TIME | HEADWAY`

HEADWAY can be a category (`rush`, `offpeak`), `MM:SS`, or plain minutes.

```
MOTIJHEEL_SLOTS:
630 | 710 | 20:00
710 | 730 | 10:00
730 | 810 | 08:00
810 | 1000 | 05:00
1000 | 1520 | 08:00
1520 | 1644 | 06:00
1644 | 2004 | 05:00
2004 | 2100 | 10:00
2100 | 2130 | 15:00
2130 | 2150 | 20:00
```

### Platform 2: Trains towards Uttara North

Format: `START_TIME | END_TIME | HEADWAY`

```
UTTARA_SLOTS:
715 | 755 | 10:00
755 | 845 | 08:00
845 | 1036 | 05:00
1036 | 1556 | 08:00
1556 | 1720 | 06:00
1720 | 2040 | 08:00
2040 | 2140 | 10:00
2140 | 2210 | 15:00
2210 | 2230 | 20:00
```

---

## FRIDAY Schedule

**To use Friday schedule, change SCHEDULE to: `friday`**

### Platform 1: Trains towards Motijheel

```
MOTIJHEEL_SLOTS:
1500 | 1636 | 08:00
1636 | 1842 | 06:00
1842 | 2018 | 08:00
2018 | 2100 | 10:00
2100 | 2130 | 15:00
2130 | 2150 | 20:00
```

### Platform 2: Trains towards Uttara North

```
UTTARA_SLOTS:
1520 | 1712 | 08:00
1712 | 1918 | 06:00
1918 | 2054 | 08:00
2054 | 2140 | 10:00
2140 | 2210 | 15:00
2210 | 2230 | 20:00
```

---

## SATURDAY (and Public Holidays) Schedule

**To use Saturday schedule, change SCHEDULE to: `saturday`**

### Platform 1: Trains towards Motijheel

```
MOTIJHEEL_SLOTS:
630 | 726 | 20:00
726 | 750 | 12:00
750 | 840 | 10:00
840 | 1040 | 08:00
1050 | 1530 | 10:00
1530 | 1626 | 08:00
1626 | 1856 | 06:00
1856 | 1952 | 08:00
1752 | 2130 | 15:00
2130 | 2150 | 20:00
```

### Platform 2: Trains towards Uttara North

```
UTTARA_SLOTS:
715 | 824 | 12:00
824 | 914 | 10:00
914 | 1114 | 08:00
1114 | 1604 | 10:00
1604 | 1700 | 08:00
1700 | 1930 | 06:00
1930 | 2026 | 08:00
2026 | 2140 | 10:00
2140 | 2210 | 15:00
2210 | 2230 | 20:00
```

---

## Notes

- **Automatic generation**: The script generates all 3 schedules (weekdays/friday/saturday) in one run
- **Rush headway**: `rush` alternates between 6:00 and 5:30 for consecutive trains
- **Offpeak headway**: `offpeak` uses a fixed 8:00 interval
- **Custom headway**: Specify any interval in `MM:SS` format (e.g., `10:00`, `5:30`) or plain minutes (e.g., `10`)
- **Station journey times**: Inter-station travel times are defined in `generate_timetable.py` as MM:SS durations
- **Station wait/dwell times**: Three categories — low (30s), medium (45s), high (60s) — configurable per station and per period in `generate_timetable.py`
- Edit timing slots for each schedule in their respective sections above
- Times can be in any format: `630`, `7:30`, or `7:30 AM`
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
