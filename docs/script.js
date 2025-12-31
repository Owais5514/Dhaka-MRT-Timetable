document.addEventListener('DOMContentLoaded', () => {
    
    const clockElement = document.getElementById('clock');
    const stationSelect = document.getElementById('station');
    const scheduleDiv = document.getElementById('schedule');
    const confirmButton = document.getElementById('confirm');
    const dayDisplay = document.getElementById('day-display');
    const dateDisplay = document.getElementById('date-display');
    
    // Custom dropdown elements
    const customDropdown = document.getElementById('station-dropdown');
    const selectedOption = document.getElementById('selected-station');
    const stationOptions = document.getElementById('station-options');
    const stationColumns = document.querySelector('.station-columns');
    
    // Helper to return current time
    function getCurrentTime() {
        return new Date();
    }
    
    // Store the last displayed date to avoid unnecessary updates
    let lastDisplayedDate = null;
    
    // Function to update the day of week and date display
    function updateDayDisplay(date) {
        if (!dayDisplay || !dateDisplay) return;
        
        // Only update if the date has changed or it's the first time
        const currentDateStr = date.toDateString();
        if (lastDisplayedDate !== currentDateStr) {
            lastDisplayedDate = currentDateStr;
            
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const dayOfWeek = date.getDay();
            
            // Set the day text
            dayDisplay.textContent = daysOfWeek[dayOfWeek];
            dayDisplay.classList.remove('holiday'); // Reset holiday class
            
            // Set the date text (e.g., "December 31, 2025")
            const month = monthNames[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            dateDisplay.textContent = `${month} ${day}, ${year}`;
            
            // If it's a public holiday (but not Friday), apply holiday styling
            isPublicHoliday(date).then(isHoliday => {
                if (isHoliday) {
                    dayDisplay.textContent += ' (Holiday)';
                    dayDisplay.classList.add('holiday'); // Add yellow color class
                }
                
                // Log for debugging
                console.log('Date checked for holiday:', date.toISOString().split('T')[0], 'Is holiday:', isHoliday);
            }).catch(error => {
                console.error('Error checking holiday status:', error);
            });
        }
    }
    
    // Update clock function
    function updateClock() {
        const now = new Date();
        const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        clockElement.textContent = now.toLocaleTimeString('en-US', options);
        
        // Update day of week and date display
        updateDayDisplay(now);
    }

    // Update clock every second
    setInterval(updateClock, 1000);
    updateClock();

    let cachedHolidays = null;
    
    // Function to check if current date is a public holiday in Bangladesh using Nager.Date API
    async function isPublicHoliday(date = new Date()) {
        // Format the date as YYYY-MM-DD for easier comparison
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        // Hardcoded check for April 1, 2025 which we know should be a holiday but may not be in the API
        if (formattedDate === '2025-04-01') {
            console.log('Detected April 1, 2025 as a hardcoded holiday');
            return true;
        }
        
        // Only if we don't have cached holidays or it's a different year, fetch new data
        if (!cachedHolidays || !cachedHolidays[year]) {
            try {
                // Try to get holidays from localStorage first (to reduce API calls)
                const cachedData = localStorage.getItem(`bd_holidays_${year}`);
                
                if (cachedData) {
                    if (!cachedHolidays) cachedHolidays = {};
                    cachedHolidays[year] = JSON.parse(cachedData);
                    console.log(`Loaded ${year} Bangladesh holidays from cache`);
                } else {
                    // Fetch holidays from timeanddate.com if not in cache
                    console.log(`Fetching holidays for Bangladesh in ${year}`);
                    try {
                        // We'll use a proxy or CORS-enabled URL if needed in production
                        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.timeanddate.com/holidays/bangladesh/?hol=1&year=${year}`);
                        
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        
                        const htmlText = await response.text();
                        
                        // Parse the HTML to extract holiday data
                        const holidays = parseTimeAndDateHolidays(htmlText, year);
                        console.log('Extracted holidays from timeanddate.com:', holidays);
                        
                        // Store in memory cache
                        if (!cachedHolidays) cachedHolidays = {};
                        cachedHolidays[year] = holidays;
                        
                        // Also store in localStorage to reduce API calls in the future
                        try {
                            localStorage.setItem(`bd_holidays_${year}`, JSON.stringify(holidays));
                            console.log(`Cached ${year} Bangladesh holidays`);
                        } catch (e) {
                            console.warn('Failed to cache holidays in localStorage', e);
                        }
                    } catch (error) {
                        console.error('Error fetching holidays from timeanddate.com:', error);
                        
                        // Fallback to the previous API if timeanddate fails
                        try {
                            const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BD`);
                            
                            if (!response.ok) {
                                console.error('Failed to fetch holidays from fallback API');
                                return false; // Return false if both APIs fail
                            }
                            
                            const holidays = await response.json();
                            console.log('Received holidays from fallback API:', holidays);
                            
                            // Store in memory cache
                            if (!cachedHolidays) cachedHolidays = {};
                            cachedHolidays[year] = holidays;
                            
                            // Also store in localStorage to reduce API calls in the future
                            try {
                                localStorage.setItem(`bd_holidays_${year}`, JSON.stringify(holidays));
                                console.log(`Cached ${year} Bangladesh holidays`);
                            } catch (e) {
                                console.warn('Failed to cache holidays in localStorage', e);
                            }
                        } catch (error) {
                            console.error('Error fetching holidays from fallback API:', error);
                            return false; // Return false if there's any error
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching holidays:', error);
                return false; // Return false if there's any error
            }
        }
        
        // Check if this date is in the holiday list and is not a Friday (day 5)
        const isInAPIHolidays = cachedHolidays[year] && 
                cachedHolidays[year].some(holiday => holiday.date === formattedDate);
        
        if (isInAPIHolidays) {
            console.log(`Found ${formattedDate} in API holidays`);
        }
        
        return (isInAPIHolidays || formattedDate === '2025-04-01') && date.getDay() !== 5;
    }

    // Modified function to get the appropriate JSON file based on the day of the week
    // and updated to handle the async holiday check
    async function getTrainTimesFileAsync() {
        const today = getCurrentTime();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
        
        // Check if it's a public holiday (excluding Fridays)
        try {
            if (await isPublicHoliday(today)) {
                console.log('Today is a holiday - using Saturday schedule');
                return 'mrt-6-sat.json'; // Use Saturday schedule for public holidays
            }
        } catch (e) {
            console.error('Error checking holiday status:', e);
            // Continue with normal day logic if holiday check fails
        }
        
        // Normal schedule based on day of week
        if (dayOfWeek === 5) { // Friday
            return 'mrt-6-fri.json';
        } else if (dayOfWeek === 6) { // Saturday
            return 'mrt-6-sat.json';
        } else { // Other days
            return 'mrt-6.json';
        }
    }
    
    // Wrapper function that returns the correct file synchronously using cached result
    let currentScheduleFile = null; // Cache the schedule file name
    
    function getTrainTimesFile() {
        // If we don't have a schedule file yet, fetch it asynchronously
        if (!currentScheduleFile) {
            // Start with a default based on day of week (synchronous for initial load)
            const today = getCurrentTime();
            const dayOfWeek = today.getDay();
            
            if (dayOfWeek === 5) { // Friday
                currentScheduleFile = 'mrt-6-fri.json';
            } else if (dayOfWeek === 6) { // Saturday
                currentScheduleFile = 'mrt-6-sat.json';
            } else { // Other days
                currentScheduleFile = 'mrt-6.json';
            }
            
            // Then update it asynchronously with the holiday check
            getTrainTimesFileAsync().then(file => {
                if (file !== currentScheduleFile) {
                    console.log(`Updating schedule file from ${currentScheduleFile} to ${file}`);
                    currentScheduleFile = file;
                    
                    // Refresh the current view if a station is already selected
                    const selectedStation = stationSelect.value;
                    if (selectedStation) {
                        findNextTrains(selectedStation);
                    }
                }
            }).catch(error => {
                console.error('Error getting train times file:', error);
            });
        }
        
        return currentScheduleFile;
    }

    // Toggle custom dropdown when clicked
    if (customDropdown) {
        selectedOption.addEventListener('click', () => {
            customDropdown.classList.toggle('active');
            selectedOption.setAttribute('aria-expanded', customDropdown.classList.contains('active').toString());
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!customDropdown.contains(event.target)) {
                customDropdown.classList.remove('active');
                if (selectedOption) selectedOption.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Handle station selection
    function selectStation(stationName) {
        // Update UI
        selectedOption.querySelector('span').textContent = stationName;
        
        // Update hidden select element for compatibility with existing code
        if (stationSelect) {
            stationSelect.value = stationName;
        }
        
        // Update selected styling
        const stationOptions = document.querySelectorAll('.station-option');
        stationOptions.forEach(option => {
            if (option.textContent === stationName) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Close dropdown
        customDropdown.classList.remove('active');
        if (selectedOption) selectedOption.setAttribute('aria-expanded', 'false');
    }
    
    // Fetch station names and populate the dropdown
    fetch(getTrainTimesFile())
        .then(response => response.json())
        .then(data => {
            // Updated stationOrder array with "Bijoy Sharani" added
            const stationOrder = [
                "Uttara North", "Uttara Center", "Uttara South", "Pallabi", "Mirpur 11", "Mirpur 10", 
                "Kazipara", "Sewrapara", "Agargoan", "Bijoy Sarani", "Farmgate", "Karwan Bazar", 
                "Shahbag", "Dhaka University", "Bangladesh Secretariat", "Motijheel"
            ];
            
            // Populate both the custom dropdown and the hidden select
            stationOrder.forEach(station => {
                if (data[station]) {
                    // Create option for the hidden select
                    const option = document.createElement('option');
                    option.value = station;
                    option.textContent = station;
                    stationSelect.appendChild(option);
                    
                    // Create option for the custom dropdown
                    const stationOption = document.createElement('div');
                    stationOption.className = 'station-option';
                    stationOption.textContent = station;
                    stationOption.addEventListener('click', () => {
                        selectStation(station);
                    });
                    stationColumns.appendChild(stationOption);
                }
            });
            
            // Select the first station by default
            if (stationOrder.length > 0 && data[stationOrder[0]]) {
                selectStation(stationOrder[0]);
            }
        })
        .catch(error => console.error('Error fetching station data:', error));

    // Function to find the next three trains
    // Function to find the next trains (2 past + 10 upcoming when scrolling)
    function findNextTrains(stationName) {
        fetch(getTrainTimesFile())
            .then(response => response.json())
            .then(data => {
                const now = getCurrentTime();
                // Create a base time with seconds zeroed out for consistent HH:MM format
                const baseTime = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    now.getHours(),
                    now.getMinutes()
                );
                const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: false };
                const currentTime = baseTime.toLocaleTimeString('en-US', options);
                const oneMinuteLater = new Date(baseTime.getTime() + 60000).toLocaleTimeString('en-US', options);
                const currentSec = now.getSeconds();
                const station = data[stationName];
                if (station) {
                    let arrivalMessage = '';
                    
                    // If one minute from now matches a scheduled time, show arriving message
                    if (station["Motijheel"].includes(oneMinuteLater)) {
                        arrivalMessage += `Train is arriving at Platform 1`;
                    } else if (station["Motijheel"].includes(currentTime) && currentSec < 30) {
                        // When the current minute exactly matches the schedule, show leaving for the first 30 seconds
                        arrivalMessage += `Train is leaving Platform 1`;
                    }
                    
                    if (station["Uttara North"].includes(oneMinuteLater)) {
                        if (arrivalMessage) arrivalMessage += '<br>';
                        arrivalMessage += `Train is arriving at Platform 2`;
                    } else if (station["Uttara North"].includes(currentTime) && currentSec < 30) {
                        if (arrivalMessage) arrivalMessage += '<br>';
                        arrivalMessage += `Train is leaving Platform 2`;
                    }
                    
                    // Use our custom methods to show/hide the arrival message
                    if (arrivalMessage) {
                        window.showArrivalMessage(arrivalMessage);
                    } else {
                        window.hideArrivalMessage();
                    }
                    
                    // Get all trains for both directions, split into past and future
                    const motijheelTrains = station["Motijheel"];
                    const uttaraTrains = station["Uttara North"];
                    
                    // Split trains into past and future based on current time
                    const pastTrainsToMotijheel = motijheelTrains.filter(time => time < currentTime);
                    const futureTrainsToMotijheel = motijheelTrains.filter(time => time >= currentTime);
                    
                    const pastTrainsToUttara = uttaraTrains.filter(time => time < currentTime);
                    const futureTrainsToUttara = uttaraTrains.filter(time => time >= currentTime);
                    
                    // Build HTML for platform 1 (To Motijheel)
                    // Show last 2 past trains + up to 10 upcoming trains
                    let platform1HTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                    `;
                    
                    // Add last 2 past trains
                    const recentPastMotijheel = pastTrainsToMotijheel.slice(-2);
                    recentPastMotijheel.forEach(time => {
                        platform1HTML += `<li class="past-train clickable-train" data-time="${time}" data-direction="Motijheel" data-station="${stationName}">${time}</li>`;
                    });
                    
                    // Add up to 10 future trains
                    const upcomingMotijheel = futureTrainsToMotijheel.slice(0, 10);
                    upcomingMotijheel.forEach((time, index) => {
                        let className = "";
                        let styleAttr = "";
                        
                        // Current time train (leaving now)
                        if (time === currentTime) {
                            className = "current-train";
                        } 
                        // One minute before arrival (yellow indicator)
                        else if (time === oneMinuteLater) {
                            className = "arriving-train";
                        }
                        // First 3 upcoming trains (highlighted)
                        else if (index < 3) {
                            className = "upcoming-train fade-in";
                            styleAttr = `style="animation-delay: ${index * 0.2}s;"`;
                        }
                        // Other future trains
                        else {
                            className = "future-train";
                        }
                        
                        platform1HTML += `<li class="${className} clickable-train" ${styleAttr} data-time="${time}" data-direction="Motijheel" data-station="${stationName}">${time}</li>`;
                    });
                    
                    platform1HTML += `</ul>`;
                    
                    // Build HTML for platform 2 (To Uttara North)
                    // Show last 2 past trains + up to 10 upcoming trains
                    let platform2HTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                    `;
                    
                    // Add last 2 past trains
                    const recentPastUttara = pastTrainsToUttara.slice(-2);
                    recentPastUttara.forEach(time => {
                        platform2HTML += `<li class="past-train clickable-train" data-time="${time}" data-direction="Uttara North" data-station="${stationName}">${time}</li>`;
                    });
                    
                    // Add up to 10 future trains
                    const upcomingUttara = futureTrainsToUttara.slice(0, 10);
                    upcomingUttara.forEach((time, index) => {
                        let className = "";
                        let styleAttr = "";
                        
                        // Current time train (leaving now)
                        if (time === currentTime) {
                            className = "current-train";
                        } 
                        // One minute before arrival (yellow indicator)
                        else if (time === oneMinuteLater) {
                            className = "arriving-train";
                        }
                        // First 3 upcoming trains (highlighted)
                        else if (index < 3) {
                            className = "upcoming-train fade-in";
                            styleAttr = `style="animation-delay: ${index * 0.2}s;"`;
                        }
                        // Other future trains
                        else {
                            className = "future-train";
                        }
                        
                        platform2HTML += `<li class="${className} clickable-train" ${styleAttr} data-time="${time}" data-direction="Uttara North" data-station="${stationName}">${time}</li>`;
                    });
                    
                    platform2HTML += `</ul>`;
                    
                    // Update the platform containers
                    document.getElementById('platform1').innerHTML = platform1HTML;
                    document.getElementById('platform2').innerHTML = platform2HTML;
                    
                    // Scroll to show current/upcoming trains (skip past trains)
                    setTimeout(() => {
                        const platform1List = document.querySelector('#platform1 .train-times');
                        const platform2List = document.querySelector('#platform2 .train-times');
                        
                        // Find first upcoming train (current or arriving)
                        const currentTrain1 = platform1List.querySelector('.current-train, .arriving-train, .upcoming-train');
                        const currentTrain2 = platform2List.querySelector('.current-train, .arriving-train, .upcoming-train');
                        
                        if (currentTrain1) {
                            currentTrain1.scrollIntoView({ block: 'center', behavior: 'smooth' });
                        }
                        
                        if (currentTrain2) {
                            currentTrain2.scrollIntoView({ block: 'center', behavior: 'smooth' });
                        }
                    }, 100);
                }
            })
            .catch(error => console.error('Error fetching train data:', error));
    }

    // Event listener for the confirm button
    confirmButton.addEventListener('click', () => {
        const selectedStation = stationSelect.value;
        findNextTrains(selectedStation);
    });

    // Event listener for First Train button (show earliest train times)
    document.getElementById('firstTrain').addEventListener('click', () => {
        const stationName = document.getElementById('station').value;
        fetch(getTrainTimesFile())
            .then(response => response.json())
            .then(data => {
                const station = data[stationName];
                
                if (station) {
                    // Hide any arrival messages when viewing first trains
                    window.hideArrivalMessage();
                    
                    // Get first train for each direction
                    const trainsToMotijheel = station["Motijheel"].slice(0, 1);
                    const trainsToUttara = station["Uttara North"].slice(0, 1);
                    
                    // Build HTML for platform 1 (To Motijheel)
                    let platform1HTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                    `;
                    
                    trainsToMotijheel.forEach((time, index) => {
                        let className = "upcoming-train fade-in";
                        let styleAttr = `style="animation-delay: ${index * 0.1}s;"`;
                        platform1HTML += `<li class="${className} clickable-train" ${styleAttr} data-time="${time}" data-direction="Motijheel" data-station="${stationName}">${time}</li>`;
                    });
                    
                    platform1HTML += `</ul>`;
                    
                    // Build HTML for platform 2 (To Uttara North)
                    let platform2HTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                    `;
                    
                    trainsToUttara.forEach((time, index) => {
                        let className = "upcoming-train fade-in";
                        let styleAttr = `style="animation-delay: ${index * 0.1}s;"`;
                        platform2HTML += `<li class="${className} clickable-train" ${styleAttr} data-time="${time}" data-direction="Uttara North" data-station="${stationName}">${time}</li>`;
                    });
                    
                    platform2HTML += `</ul>`;
                    
                    document.getElementById('platform1').innerHTML = platform1HTML;
                    document.getElementById('platform2').innerHTML = platform2HTML;
                    
                    // Scroll to the first train in each list
                    setTimeout(() => {
                        const platform1List = document.querySelector('#platform1 .train-times');
                        const platform2List = document.querySelector('#platform2 .train-times');
                        
                        if (platform1List) platform1List.scrollTop = 0;
                        if (platform2List) platform2List.scrollTop = 0;
                    }, 100);
                }
            })
            .catch(error => console.error('Error fetching train data:', error));
    });

    // Event listener for Last Train button
    document.getElementById('lastTrain').addEventListener('click', () => {
        const stationName = document.getElementById('station').value;
        fetch(getTrainTimesFile())
            .then(response => response.json())
            .then(data => {
                const station = data[stationName];

                if (station) {
                    // Hide any arrival messages when viewing last trains
                    window.hideArrivalMessage();
                    
                    // Get last train for each direction
                    const trainsToMotijheel = station["Motijheel"].slice(-1);
                    const trainsToUttara = station["Uttara North"].slice(-1);
                    
                    // Build HTML for platform 1 (To Motijheel)
                    let platform1HTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                    `;
                    
                    trainsToMotijheel.forEach((time, index) => {
                        let className = "upcoming-train fade-in";
                        let styleAttr = `style="animation-delay: ${index * 0.1}s;"`;
                        platform1HTML += `<li class="${className} clickable-train" ${styleAttr} data-time="${time}" data-direction="Motijheel" data-station="${stationName}">${time}</li>`;
                    });
                    
                    platform1HTML += `</ul>`;
                    
                    // Build HTML for platform 2 (To Uttara North)
                    let platform2HTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                    `;
                    
                    trainsToUttara.forEach((time, index) => {
                        let className = "upcoming-train fade-in";
                        let styleAttr = `style="animation-delay: ${index * 0.1}s;"`;
                        platform2HTML += `<li class="${className} clickable-train" ${styleAttr} data-time="${time}" data-direction="Uttara North" data-station="${stationName}">${time}</li>`;
                    });
                    
                    platform2HTML += `</ul>`;
                    
                    document.getElementById('platform1').innerHTML = platform1HTML;
                    document.getElementById('platform2').innerHTML = platform2HTML;
                    
                    // Scroll to show the last trains
                    setTimeout(() => {
                        const platform1List = document.querySelector('#platform1 .train-times');
                        const platform2List = document.querySelector('#platform2 .train-times');
                        
                        if (platform1List) platform1List.scrollTop = platform1List.scrollHeight;
                        if (platform2List) platform2List.scrollTop = platform2List.scrollHeight;
                    }, 100);
                }
            })
            .catch(error => console.error('Error fetching train data:', error));
    });

    // Initialize by hiding the arrival message at startup
    if (typeof window.hideArrivalMessage === 'function') {
        window.hideArrivalMessage();
    }

    // Event delegation for train time clicks
    document.addEventListener('click', (event) => {
        const target = event.target.closest('.clickable-train');
        if (target) {
            const time = target.getAttribute('data-time');
            const station = target.getAttribute('data-station');
            const direction = target.getAttribute('data-direction');
            const scheduleFile = getTrainTimesFile(); // Get the current schedule file
            
            if (time && station && direction) {
                window.location.href = `train_details.html?station=${encodeURIComponent(station)}&time=${encodeURIComponent(time)}&direction=${encodeURIComponent(direction)}&file=${encodeURIComponent(scheduleFile)}`;
            }
        }
    });
});

// Function to parse holidays from timeanddate.com HTML
function parseTimeAndDateHolidays(htmlText, year) {
    console.log('Parsing holidays from timeanddate.com HTML');
    const holidays = [];
    
    try {
        // Create a DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Find the holiday table sections - there may be multiple tables for different types of holidays
        const holidayTables = doc.querySelectorAll('table.table');
        
        holidayTables.forEach(table => {
            // Process each row in the table
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                try {
                    // Extract date and name from the table cells
                    const dateTd = row.querySelector('th');
                    const nameTd = row.querySelector('td:nth-child(2)');
                    const typeTd = row.querySelector('td:nth-child(3)');
                    
                    if (dateTd && nameTd && typeTd) {
                        // Parse the date from the format used by timeanddate.com
                        const dateText = dateTd.textContent.trim();
                        const dateMatch = dateText.match(/\d+/); // Extract the day number
                        
                        if (dateMatch) {
                            const day = parseInt(dateMatch[0], 10);
                            
                            // Extract month from another attribute or parent element
                            let month = 1; // Default to January
                            
                            // Try to find month information in section headers or table captions
                            const sectionHeader = table.closest('section').querySelector('h3, h2');
                            if (sectionHeader) {
                                const monthNames = [
                                    'january', 'february', 'march', 'april', 'may', 'june',
                                    'july', 'august', 'september', 'october', 'november', 'december'
                                ];
                                
                                const headerText = sectionHeader.textContent.toLowerCase();
                                for (let i = 0; i < monthNames.length; i++) {
                                    if (headerText.includes(monthNames[i])) {
                                        month = i + 1;
                                        break;
                                    }
                                }
                            }
                            
                            // Format date as YYYY-MM-DD
                            const formattedMonth = String(month).padStart(2, '0');
                            const formattedDay = String(day).padStart(2, '0');
                            const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
                            
                            // Get holiday name and type
                            const holidayName = nameTd.textContent.trim();
                            const holidayType = typeTd.textContent.trim();
                            
                            // Only include government holidays and optional holidays
                            if (holidayType.includes('Government Holiday') || 
                                holidayType.includes('Optional Holiday') ||
                                holidayType.includes('Bank Holiday') ||
                                holidayType.includes('National Holiday')) {
                                
                                holidays.push({
                                    date: formattedDate,
                                    name: holidayName,
                                    type: holidayType
                                });
                                
                                console.log(`Added holiday: ${formattedDate} - ${holidayName} (${holidayType})`);
                            }
                        }
                    }
                } catch (rowError) {
                    console.warn('Error parsing a holiday row:', rowError);
                }
            });
        });
        
        // If no holidays were found using table parsing, try alternative extraction methods
        if (holidays.length === 0) {
            console.log('No holidays found in tables, trying alternative extraction method');
            
            // Look for holiday markers in the page content
            const holidayElements = doc.querySelectorAll('.holiday');
            holidayElements.forEach(el => {
                const dateText = el.querySelector('.date')?.textContent.trim();
                const nameText = el.querySelector('.name')?.textContent.trim();
                const typeText = el.querySelector('.type')?.textContent.trim();
                
                // Add to holiday list if all required information is present
                if (dateText && nameText && typeText) {
                    holidays.push({
                        date: dateText,
                        name: nameText,
                        type: typeText
                    });
                }
            });
        }
        
        // Add April 1, 2025 as a special case since we know it's a holiday
        if (year === 2025) {
            const april1 = {
                date: '2025-04-01',
                name: 'Eid ul-Fitr Holiday',
                type: 'Government Holiday'
            };
            
            // Check if it's already in the list
            const alreadyInList = holidays.some(h => h.date === april1.date);
            if (!alreadyInList) {
                holidays.push(april1);
                console.log('Added hardcoded holiday: April 1, 2025 - Eid ul-Fitr Holiday');
            }
        }
        
    } catch (error) {
        console.error('Error parsing HTML:', error);
    }
    
    console.log(`Found ${holidays.length} holidays for ${year}`);
    return holidays;
}