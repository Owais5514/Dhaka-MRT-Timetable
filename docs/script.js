document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const stationSelect = document.getElementById('station');
    const scheduleDiv = document.getElementById('schedule');
    const confirmButton = document.getElementById('confirm');

    // New global variable to hold custom time override
    let customTime = null;

    // Helper to return current time: custom if set, system otherwise
    function getCurrentTime() {
        return customTime ? new Date(customTime) : new Date();
    }

    // Modified updateClock to use customTime if set
    function updateClock() {
        let now;
        if (customTime) {
            now = new Date(customTime);
            // Increment custom time by 1 second
            customTime = now.getTime() + 1000;
            customTime = new Date(customTime);
        } else {
            now = new Date();
        }
        const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        clockElement.textContent = now.toLocaleTimeString('en-US', options);
    }

    // Update the clock every second
    setInterval(updateClock, 1000);
    updateClock();

    // Function to get the appropriate JSON file based on the day of the week
    function getTrainTimesFile() {
        const today = getCurrentTime().getDay();
        let fileName;

        if (today === 5) { // Friday
            fileName = 'mrt-6-fri.json';
        } else if (today === 6) { // Saturday
            fileName = 'mrt-6-sat.json';
        } else { // Other days
            fileName = 'mrt-6.json';
        }

        return fileName;
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

            stationOrder.forEach(station => {
                if (data[station]) {
                    const option = document.createElement('option');
                    option.value = station;
                    option.textContent = station;
                    stationSelect.appendChild(option);
                }
            });
        })
        .catch(error => console.error('Error fetching station data:', error));

    // Function to find the next three trains
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
                    let msg1 = '';
                    // If one minute from now matches a scheduled time, show arriving message for the whole current minute
                    if (station["Motijheel"].includes(oneMinuteLater)) {
                        msg1 = `<div class="arrival-message">Train is arriving at Platform 1</div>`;
                    } else if (station["Motijheel"].includes(currentTime) && currentSec < 30) {
                        // When the current minute exactly matches the schedule, show leaving for the first 30 seconds
                        msg1 = `<div class="arrival-message">Train is leaving Platform 1</div>`;
                    }
                    
                    let msg2 = '';
                    if (station["Uttara North"].includes(oneMinuteLater)) {
                        msg2 = `<div class="arrival-message">Train is arriving at Platform 2</div>`;
                    } else if (station["Uttara North"].includes(currentTime) && currentSec < 30) {
                        msg2 = `<div class="arrival-message">Train is leaving Platform 2</div>`;
                    }
                    
                    document.getElementById('arrival-message').innerHTML = msg1 + msg2;
                    
                    // Remove arrival messages from inside the platform containers
                    const nextTrainsToMotijheel = station["Motijheel"]
                        .filter(time => time > currentTime)
                        .slice(0, 3);
                    const nextTrainsToUttara = station["Uttara North"]
                        .filter(time => time > currentTime)
                        .slice(0, 3);
                    
                    document.getElementById('platform1').innerHTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                            ${nextTrainsToMotijheel
                                .map((time, index) => `<li class="fade-in" style="animation-delay: ${index * 0.2}s;">${time}</li>`)
                                .join('')}
                        </ul>
                    `;
                    document.getElementById('platform2').innerHTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                            ${nextTrainsToUttara
                                .map((time, index) => `<li class="fade-in" style="animation-delay: ${index * 0.2}s;">${time}</li>`)
                                .join('')}
                        </ul>
                    `;
                }
            })
            .catch(error => console.error('Error fetching train data:', error));
    }

    // Event listener for the confirm button
    confirmButton.addEventListener('click', () => {
        const selectedStation = stationSelect.value;
        findNextTrains(selectedStation);
    });

    // Event listener for First Train button (show earliest train times, ignoring current time)
    document.getElementById('firstTrain').addEventListener('click', () => {
        const stationName = document.getElementById('station').value;
        fetch(getTrainTimesFile())
            .then(response => response.json())
            .then(data => {
                const now = getCurrentTime();
                const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: false };
                const currentTime = now.toLocaleTimeString('en-US', options);
                const currentSec = now.getSeconds();
                const station = data[stationName];
                if (station) {
                    const msg1 = station["Motijheel"].includes(currentTime)
                       ? `<div class="arrival-message">Train is ${currentSec < 30 ? 'arriving at' : 'leaving'} Platform 1</div>` : '';
                    const msg2 = station["Uttara North"].includes(currentTime)
                       ? `<div class="arrival-message">Train is ${currentSec < 30 ? 'arriving at' : 'leaving'} Platform 2</div>` : '';
                    document.getElementById('arrival-message').innerHTML = msg1 + msg2;
                    
                    const firstTrainToMotijheel = station["Motijheel"][0] || "No train available";
                    const firstTrainToUttara = station["Uttara North"][0] || "No train available";
                    
                    document.getElementById('platform1').innerHTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                            <li class="fade-in">${firstTrainToMotijheel}</li>
                        </ul>
                    `;
                    
                    document.getElementById('platform2').innerHTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                            <li class="fade-in">${firstTrainToUttara}</li>
                        </ul>
                    `;
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
                const now = getCurrentTime();
                const options = {
                    timeZone: 'Asia/Dhaka',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                };
                const currentTime = now.toLocaleTimeString('en-US', options);
                const currentSec = now.getSeconds();
                const station = data[stationName];

                if (station) {
                    const msg1 = station["Motijheel"].includes(currentTime)
                       ? `<div class="arrival-message">Train is ${currentSec < 30 ? 'arriving at' : 'leaving'} Platform 1</div>` : '';
                    const msg2 = station["Uttara North"].includes(currentTime)
                       ? `<div class="arrival-message">Train is ${currentSec < 30 ? 'arriving at' : 'leaving'} Platform 2</div>` : '';
                    document.getElementById('arrival-message').innerHTML = msg1 + msg2;
                    
                    const motijheelTrains = station["Motijheel"].filter(time => time > currentTime);
                    const uttaraTrains = station["Uttara North"].filter(time => time > currentTime);
                    
                    // For last train, choose the last upcoming time
                    const lastTrainToMotijheel = motijheelTrains.length ? motijheelTrains[motijheelTrains.length - 1] : "No upcoming train";
                    const lastTrainToUttara = uttaraTrains.length ? uttaraTrains[uttaraTrains.length - 1] : "No upcoming train";

                    document.getElementById('platform1').innerHTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                            <li class="fade-in">${lastTrainToMotijheel}</li>
                        </ul>
                    `;

                    document.getElementById('platform2').innerHTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                            <li class="fade-in">${lastTrainToUttara}</li>
                        </ul>
                    `;
                }
            })
            .catch(error => console.error('Error fetching train data:', error));
    });

    // Admin menu functionality
    const adminBtn = document.getElementById('admin-btn');
    const adminPanel = document.getElementById('admin-panel');
    const adminUnlock = document.getElementById('admin-unlock');
    const adminPassword = document.getElementById('admin-password');
    const adminControls = document.getElementById('admin-controls');
    const customTimeInput = document.getElementById('custom-time');
    const setTimeBtn = document.getElementById('set-time');
    const resetTimeBtn = document.getElementById('reset-time');

    // Toggle admin panel visibility on admin button click
    adminBtn.addEventListener('click', () => {
        adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
    });

    // Unlock admin controls when correct password is entered
    adminUnlock.addEventListener('click', () => {
        if (adminPassword.value === '12345678') {
            adminControls.style.display = 'block';
        } else {
            alert('Incorrect password');
            adminControls.style.display = 'none';
        }
    });

    // Set custom time override based on entered time (HH:MM:SS)
    setTimeBtn.addEventListener('click', () => {
        const timeParts = customTimeInput.value.split(':');
        if (timeParts.length === 3) {
            const now = new Date();
            now.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2]));
            customTime = new Date(now);
        } else {
            alert('Please enter time in HH:MM:SS format');
        }
    });

    // Reset to system time (clear custom override)
    resetTimeBtn.addEventListener('click', () => {
        customTime = null;
        customTimeInput.value = '';
    });
});