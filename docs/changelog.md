# Changelog

## March 22, 2025
- Added scrollable train time lists to see both past and upcoming trains
- Added styling for past trains to distinguish them from upcoming trains
- Added special highlighting for the current train in the schedule
- Improved the platform layout with better train time visualization
- Updated "First Train" and "Last Train" buttons to show more trains in scrollable lists

## [2024-01-07 17:15 Dhaka Time]
### Changed
- Modified delay-handler.js to add morning peak hour delays (8:30 AM to 10:30 AM) for Platform 1 (Motijheel direction)
  - Added morning peak hour delay functions
  - +1 minute delay for Mirpur 11 to Mirpur 10
  - +2 minute delay for Karwan Bazar to Agargoan
  - +3 minute delay for Bijoy Sarani to Motijheel
  - Delays only apply on weekdays (Sunday through Thursday)
  - Delays shown in red color with brackets

## [2024-01-07 17:00 Dhaka Time]
### Changed
- Modified delay-handler.js to exclude delays on Fridays and Saturdays
  - Added isDelayApplicable() function to check day of week
  - Delays only apply on Sunday through Thursday

## [2024-01-07 16:45 Dhaka Time]
### Added
- Created new file: delay-handler.js
  - Added delay calculation logic for Platform 2 trains
  - Implemented delay display functionality with red color
- Modified index.html
  - Added preset time buttons (8:00, 10:00, 16:00, 18:30)
  - Added pause/resume button to dev menu
- Modified script.js
  - Added time control functions 
  - Implemented pause/resume functionality
- Modified styles.css
  - Added styles for preset time buttons
  - Added styles for delay indicators

### Changes
- Platform 2 trains now show delays during peak hours (3:30 PM - 6:20 PM)
  - +1 minute delay from Dhaka University to Shahbag
  - +2 minute delay from Karwan Bazar to Bijoy Sarani
  - +3 minute delay from Agargaon to Uttara North
- Added clock control functionality in dev menu
  - Preset time buttons for quick time changes
  - Pause/Resume button to control clock updates
