# MRT-6 Timetable Configuration

Edit this file to set up your timetable, then run `generate_timetable.py`

---

## Headway Categories

The following predefined headway categories are available:

| Category   | Interval             | Description                                    |
|------------|----------------------|------------------------------------------------|
| `rush`     | 6:00 / 5:30 alternating | Rush hour — alternates between 6 min and 5 min 30 sec |
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
630 | 711 | 20:00
711 | 731 | 10:00
731 | 811 | offpeak
811 | 954 | rush
954 | 1457 | offpeak
1457 | 1742 | rush
1742 | 1814 | offpeak
1814 | 2101 | 10:00
2101 | 2130 | 15:00
```

### Platform 2: Trains towards Uttara North

Format: `START_TIME | END_TIME | HEADWAY`

```
UTTARA_SLOTS:
715 | 731 | 15:00
731 | 801 | 10:00
801 | 849 | offpeak
849 | 1032 | rush
1032 | 1535 | offpeak
1535 | 1821 | rush
1821 | 1852 | offpeak
1852 | 2141 | 10:00
2141 | 2210 | 15:00
```

---

## FRIDAY Schedule

**To use Friday schedule, change SCHEDULE to: `friday`**

### Platform 1: Trains towards Motijheel

```
MOTIJHEEL_SLOTS:
1500 | 2100 | 10:00
```

### Platform 2: Trains towards Uttara North

```
UTTARA_SLOTS:
1520 | 2140 | 10:00
```

---

## SATURDAY (and Public Holidays) Schedule

**To use Saturday schedule, change SCHEDULE to: `saturday`**

### Platform 1: Trains towards Motijheel

```
MOTIJHEEL_SLOTS:
630 | 730 | 20:00
710 | 725 | 15:00
725 | 1038 | 12:00
1038 | 2100 | 10:00
2100 | 2130 | 15:00
```

### Platform 2: Trains towards Uttara North

```
UTTARA_SLOTS:
715 | 730 | 15:00
730 | 1118 | 12:00
1118 | 2140 | offpeak
2140 | 2210 | 15:00
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
