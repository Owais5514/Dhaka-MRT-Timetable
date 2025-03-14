# Changelog

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
