# Dhaka MRT-6 Schedule

This project is a Progressive Web App (PWA) that provides an unofficial timetable for the Dhaka MRT-6 metro line, allowing users to check train arrival and departure times for all stations between Uttara North and Motijheel.

**Note: This is an unofficial timetable and is not affiliated with DMTCL (Dhaka Mass Transit Company Limited).**

## Live Site

You can view the web application hosted on GitHub Pages [here](https://owais5514.github.io/Dhaka-MRT-Timetable/).

## Features

- **Train Schedule Information:**
  - Live updating clock and dynamic train schedule based on selected station
  - Display of next three trains for both directions at any station
  - Buttons for quick access to first and last train schedules
  - Weekend (Saturday) and weekday schedules

- **PWA Capabilities:**
  - Installable on Android and other devices for an app-like experience
  - Service Worker for offline caching of essential assets (HTML, CSS, JS, manifest, icons, and JSON schedules)
  - Dark mode toggle for better user experience

- **User Experience:**
  - Station selection dropdown with properly ordered stations
  - Page view counter using local storage
  - Menu for accessing additional information and resources

- **Analytics & Tracking:**
  - Vercel Web Analytics integration to track site visits and user behavior
  - Privacy-friendly analytics without personal data collection

- **Automated Updates:**
  - A GitHub Action workflow extracts recent commit messages and populates the "What's New" page

## Data Sources

The schedules are available in `docs/mrt-6.json` (weekday), `docs/mrt-6-sat.json` (Saturday), and `docs/mrt-6-fri.json` (Friday). These JSON files were compiled through observation of arrival and departure times. There could be a ±1 minute error margin in the provided times.

## File Structure

- `/docs/index.html` – Main application page
- `/docs/journey.html` – "What's New" page showing recent updates
- `/docs/script.js` – JavaScript logic for the schedule
- `/docs/styles.css` – Styling for the app
- `/docs/service-worker.js` – Caching logic for offline access
- `/docs/manifest.webmanifest` – Web app manifest for PWA functionality
- `/docs/mrt-6.json`, `/docs/mrt-6-sat.json`, `/docs/mrt-6-fri.json` – Schedule data
- `/docs/icons/` – App icons for PWA installation

## Setup & Deployment

### Prerequisites
- A web browser

### Running Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/Owais5514/Dhaka-MRT-Timetable.git
   cd Dhaka-MRT-Timetable
   ```
2. Open `docs/index.html` in your web browser

### Deployment
1. Configure GitHub Pages to use the project root
2. On push to the main branch, the GitHub Action will update the "What's New" page
3. Install the PWA on your device for an app-like experience

## How the JavaScript Works

The `script.js` file powers the application with these key functions:

1. **Data Fetching:** Retrieves schedule data from JSON files based on the current day
2. **Station Dropdown:** Populates station options in correct geographical sequence
3. **Train Schedules:** Displays upcoming trains based on current time and selected station
4. **Live Clock:** Updates the displayed time every second (Bangladesh time)
5. **Dark Mode:** Toggles between light and dark themes
6. **Page View Counter:** Tracks and displays visit counts using local storage
7. **Menu Functionality:** Provides access to additional resources

## Contributing

If you find any issues or have suggestions for improvements, please open an issue or submit a pull request. If you notice any schedule inaccuracies, please report them through the issues tab.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer

This is an unofficial time schedule of Dhaka MRT-6. The times are based on observation and the schedule provided on the official website. Delays and service changes will not be reflected on this page.