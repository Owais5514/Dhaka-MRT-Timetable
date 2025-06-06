# Changelog

All notable changes to the Dhaka MRT-6 Timetable project will be documented in this file.

## [January 28, 2025] - Multiple Issues Fixed and Enhancements Completed
### Major Bug Fixes and Improvements
- **FIXED**: Pageclip submissions for delayed time feedback now working properly
  - Replaced FormData approach with plain object structure in `submitFeedbackToPageclip()` function
  - Added proper error handling with local storage fallback
  - Enhanced user feedback with success/error notifications
- **FIXED**: Admin panel now properly displayed in mobile browsers
  - Updated CSS media queries for better mobile responsiveness 
  - Improved viewport handling (95vh max-height, auto overflow)
  - Enhanced button sizing and touch interface optimization
  - Better input field sizing (16px font to prevent iOS zoom)
  - Vertical stacking of controls on small screens (<768px)
- **VERIFIED**: Time feedback checkmarks are properly implemented
  - Green checkmarks (✓) display correctly for verified times
  - CSS styling: `.verified-time::after` with #4caf50 color
  - Immediate visual feedback when users verify train times
  - Persistent verification symbols across sessions
- **VERIFIED**: GitHub Actions for verified times are running as intended
  - Workflow triggers on repository dispatch events
  - Automated updates to `verified-times.json` file
  - Auto-commit and push functionality working correctly
  - 2-10 minute global sync timeline for all users

### Added Mobile Responsiveness Improvements
- Enhanced feedback modal responsiveness for mobile devices
- Improved admin panel layout for tablets and phones
- Better touch targets and button spacing
- Responsive CSS for feedback panels on small screens

### Technical Improvements
- Fixed syntax error with duplicate closing brace in script.js
- Enhanced error handling for network failures
- Improved local storage fallback mechanisms
- Better notification system for user feedback

### Files Modified
- `docs/script.js`: Enhanced pageclip submission and error handling
- `docs/styles.css`: Mobile responsiveness improvements for admin panel and feedback modals
- `docs/verified-times.json`: Test verification data added
- `changelog.md`: Updated with current fixes

### Verification Status
✅ **Pageclip submissions**: Working with proper error handling
✅ **Mobile admin panel**: Responsive and touch-friendly  
✅ **Feedback checkmarks**: Properly displaying with green ✓ symbols
✅ **GitHub Actions**: Automated workflow functioning correctly
✅ **End-to-end testing**: All components verified and operational

## [Unreleased]
- Future features and improvements planned

## [2023-10-07] - Initial Version

## [2025-03-21]

### Removed
- Completely removed Journey Planner feature
- Removed journey.html file
- Removed Journey Planner link from top menu
- Removed Journey Planner reference from tagline

### Changed
- Updated manifest.webmanifest version to 2025-03-21
- Updated the start_url in manifest to match the new version
- Modified the tagline to "Unofficial Metro Time Schedule"
- Added "Last Updated: March 21, 2025" line below the author credit

## [2025-03-22]

### Added
- Integrated Pageclip form service for feature requests submission
- Added Pageclip CSS and JavaScript libraries
- Added form success and error handling with user feedback

### Changed
- Re-enabled feature request functionality with Pageclip integration
- Updated "Requests (Closed)" to "Requests" in the top menu
- Removed "temporarily closed" message from the feature request form
- Modified form submission to use Pageclip instead of GitHub Issues API
- Updated form button text to "Submit Request"
- Updated form field names to work with Pageclip service
- Updated "Last Updated" date to March 22, 2025

## [Current Date]

### Added
- Created new journey.html page with "Coming Soon" placeholder
- Added navigation link to journey planner from index.html
- Implemented responsive styles for the navigation links
- Added styling for "Coming Soon" content on journey page
- Created GitHub Actions workflow for automatic webapp updates
- Added modal-style modernized admin panel with close button
- Added backdrop blur effect for modals for better visual hierarchy
- Added new "Requests" feature in hamburger menu for users to submit feature requests
- Implemented responsive feature request form with validation
- Added success/error feedback for feature request submissions
- Integrated GitHub Issues API for storing feature requests directly in the repository
- Added local storage backup for submitted feature requests
- Created GitHub issue creation link with pre-filled request information
- Added permanent top menu with navigation buttons (Home/Journey Planner, Requests, Admin)
- Implemented modern two-column station selection dropdown with custom styling
- Comprehensive SEO optimization
  - Meta tags with detailed descriptions and keywords
  - Open Graph and Twitter card meta tags for better social sharing
  - JSON-LD structured data for improved search engine understanding
  - Semantic HTML structure (header, main, section, footer tags)
  - robots.txt for better crawling guidance
  - sitemap.xml for improved indexing
- Vercel Web Analytics integration for tracking site visits
- Enhanced PWA manifest file with better descriptions and categories
- GitHub Action workflow to automatically update manifest.webmanifest version with current Dhaka date

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
- Removed hamburger menu from all pages
- Added main navigation buttons directly in the container area of both index.html and journey.html
- Simplified navigation by making buttons more accessible
- Updated CSS for new navigation style
- Updated JavaScript to remove hamburger menu functionality
- Relocated navigation buttons from main container to permanent top menu
- Implemented active state indicator for current page in top menu
- Reduced spacing between the clock and Dhaka MRT-6 title for a more compact layout
- Added 8px top margin to the clock for better spacing from top menu
- Replaced standard station selection dropdown with modern two-column dropdown
- Maintained compatibility with existing code while modernizing the UI
- Increased the clock's top margin by 2 pixels for better spacing
- Added 10 pixels of additional top margin to the Journey Planning page title
- Improved HTML structure with semantic elements for better accessibility and SEO
- Enhanced CSS styling for better user experience
- Updated feature request functionality to redirect directly to GitHub issues

### Fixed
- Fixed admin panel password functionality not working in the modal popup
- Added support for pressing Enter key in the password field
- Added proper handling for time format input in admin controls
- Fixed issue with admin controls not being properly accessible after UI modernization
- Enhanced error handling with user-friendly messages
- Fixed hamburger menu visibility issue that showed a peek of the menu before clicking
- Improved mobile responsiveness by using direct navigation instead of a hidden menu
- Improved navigation consistency across pages with permanent top menu
- Improved mobile responsiveness with adaptive station selection layout
- Fixed issue where stations weren't fully visible in the custom dropdown menu
- Added scrolling capability to the station dropdown menu
- Improved mobile experience with proper two-column layout and better touch targets
- Enhanced mobile usability with appropriate heights for dropdown menu using viewport units
- Expanded the dropdown menu to take full screen width on mobile devices for better usability
- Fixed critical issue where the dropdown menu wasn't appearing when clicked on mobile devices

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
- Set up GitHub Actions workflow (update-manifest-version.yml) to automatically update the manifest version with the current date in Dhaka timezone