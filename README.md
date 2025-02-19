# Dhaka MRT-6 Schedule

This project is a Progressive Web App (PWA) for displaying the Dhaka MRT-6 schedule.

## Features
- Live updating clock and dynamic train schedule based on selected station.
- Buttons for quick access to first and last train schedules.
- Service Worker for offline caching:
  - Caches essential assets (HTML, CSS, JS, manifest, icons, and JSON schedules).
- PWA enhancements:
  - A new `/index.html` file at the project root redirects to `/docs/index.html` to satisfy GitHub Pages requirement.
  - Updated `manifest.json` using `"start_url": "/index.html"` for proper app launching.
- Automated updates:
  - A GitHub Action workflow (`.github/workflows/populate-whats-new.yml`) extracts recent commit messages and populates the “What's New” page accordingly.

## File Structure (Relevant Files)
- `/docs/index.html` – Main application page.
- `/docs/script.js` – JavaScript logic for the schedule.
- `/docs/styles.css` – Styling for the app.
- `/docs/service-worker.js` – Caching logic for offline access.
- `/manifest.json` – Web app manifest (updated to use `/index.html` as start URL).
- `/index.html` – Newly added redirect page to meet GitHub Pages requirements.
- `/.github/workflows/populate-whats-new.yml` – GitHub Action workflow to update the "What's New" content using Git commit messages.

## Setup & Deployment
1. Clone the repository.
2. Serve the app (ensure GitHub Pages is configured to use the project root, where `index.html` resides).
3. On push to the main branch, the GitHub Action will update the “What's New” page with recent commit summaries.
4. Install the PWA on your Android device for an app-like experience.

# Dhaka-MRT-Timetable

Unofficial Dhaka MRT-6 Time schedule through a web application. This is a self-made unofficial timetable of trains arriving at all the stations. You can check the raw data for yourself in `docs/mrt-6.json` and `docs/mrt-6-sat.json`. These JSON files were generated through observation of arrival and departure times of the stations between Uttara North and Motijheel. There could be a ±1 minute error on the given time. If you happen to come across any irregularities in a time for a station, report it through the issues tab.

This web application was built using HTML, CSS, and JavaScript. The data is stored in JSON files and accessed using JavaScript. The website also features a dark mode toggle, which is implemented using CSS and JavaScript.

**This is an unofficial timetable and is not affiliated with DMTCL (Dhaka Mass Transit Company Limited).**

## Live Site

You can view the web application hosted on GitHub Pages [here](https://owais5514.github.io/Dhaka-MRT-Timetable/).

## Features

    -   Check upcoming train times for each station

## Setup

If you want to set it up yourself or implement it on your application, you can check the following instructions.

### Prerequisites

- A web browser

### Running Locally

1. Clone the repository:
    ```sh
    git clone https://github.com/Owais5514/Dhaka-MRT-Timetable.git
    cd Dhaka-MRT-Timetable
    ```

2. Open [index.html](http://_vscodecontentref_/0) in your web browser.

## How the JavaScript Script Works

The [script.js](http://_vscodecontentref_/6) file is responsible for the dynamic functionality of the web application. Here's a breakdown of how it works:

1.  **Fetching Data**:
    -   The script fetches the train schedule data from the [mrt-6.json](http://_vscodecontentref_/7) file using the [fetch](http://_vscodecontentref_/8) API.
    -   This data is then used to populate the station dropdown menu.
    -   The json file contains all pre-populated time schedules for each station.

2.  **Populating the Station Dropdown**:
    -   The station names are extracted from the JSON data and added as options to the station select element.
    -   The station order is predefined to ensure the stations are listed in the correct sequence.

3.  **Displaying Train Schedules**:
    -   When a station is selected, the script retrieves the corresponding train schedule from the JSON data.
    -   It then displays the next three trains for both the Motijheel and Uttara North directions.
    -   The script uses the current time to determine the upcoming trains.

4.  **Updating the Clock**:
    -   The script includes a function to update the clock every second, displaying the current time in Bangladesh.

5.  **Toggling Dark Mode**:
    -   The script allows users to toggle between light and dark mode, using CSS and JavaScript to update the website's appearance.

6.  **Tracking Page Views**:
    -   The script uses local storage to track the number of times the page has been visited, displaying the view count to the user.

7.  **Menu Functionality**:
    -   The script handles the opening and closing of the menu, providing access to the repository and the developer's GitHub profile.

## Contributing

If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](http://_vscodecontentref_/9) file for details.

## Disclaimer

This is an unofficial time schedule of Dhaka MRT-6. The times do not reflect actual train times provided by DMTCL, rather this is made using the schedule provided on the official website. Delays will not be reflected on this page.