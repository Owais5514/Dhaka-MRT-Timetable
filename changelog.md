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