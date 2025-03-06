# Changelog

All notable changes to the Dhaka MRT-6 Timetable project will be documented in this file.

## [Unreleased]
- Future features and improvements planned

## [2023-10-07] - Initial Version

## [Current Date]

### Added
- Created new journey.html page with "Coming Soon" placeholder
- Added navigation link to journey planner from index.html
- Implemented responsive styles for the navigation links
- Added styling for "Coming Soon" content on journey page
- Created GitHub Actions workflow for automatic webapp updates
- Added hamburger menu to improve UI on mobile devices
- Moved Journey Planner and Admin buttons to hamburger menu for cleaner interface
- Added modal-style modernized admin panel with close button
- Added backdrop blur effect for modals for better visual hierarchy
- Added new "Requests" feature in hamburger menu for users to submit feature requests
- Implemented responsive feature request form with validation
- Added success/error feedback for feature request submissions
- Integrated GitHub Issues API for storing feature requests directly in the repository
- Added local storage backup for submitted feature requests
- Created GitHub issue creation link with pre-filled request information

### Changed
- Updated service-worker.js to cache the new journey.html page
- Enhanced service worker to better handle version updates
- Modified the container style to support scrolling for better mobile experience
- Improved navigation with back button on journey page
- Improved mobile responsiveness with hamburger menu
- Made the UI more modern with animated menu transitions
- Upgraded admin panel to appear at the center of the screen with modern styling
- Improved user experience with animated transitions for modals
- Changed hamburger menu to be completely hidden until clicked for cleaner UI
- Enhanced feature request form with option to create GitHub issue directly

### Fixed
- Fixed admin panel password functionality not working in the modal popup
- Added support for pressing Enter key in the password field
- Added proper handling for time format input in admin controls
- Fixed issue with admin controls not being properly accessible after UI modernization
- Enhanced error handling with user-friendly messages
- Fixed hamburger menu visibility issue that showed a peek of the menu before clicking

### Technical
- Set up GitHub Actions workflow (update-webapp-version.yml) to automatically update the manifest version when changes are pushed
- Enhanced cache management in the service worker to ensure users receive the latest updates
- Added animation effects for smoother UI transitions
- Implemented JavaScript for hamburger menu functionality
- Added event listeners for modal close functionality
- Refactored admin panel code to work with the new modal design
- Created form validation for feature requests with user feedback
- Implemented GitHub issue creation system with formatted markdown and metadata
- Added localStorage persistence for feature requests as fallback