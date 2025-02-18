document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const stationSelect = document.getElementById('station');
    const scheduleDiv = document.getElementById('schedule');
    const confirmButton = document.getElementById('confirm');
    const toggleModeButton = document.getElementById('toggle-mode');
    const menuToggleButton = document.getElementById('menu-toggle');
    const viewCounterElement = document.getElementById('view-counter');

    // Function to update the clock
    function updateClock() {
        const now = new Date();
        const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const timeString = now.toLocaleTimeString('en-US', options);
        clockElement.textContent = timeString;
    }

    // Update the clock every second
    setInterval(updateClock, 1000);
    updateClock();

    // Function to get the appropriate JSON file based on the day of the week
    function getTrainTimesFile() {
        const today = new Date().getDay();
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
                const now = new Date();
                const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: false };
                const currentTime = now.toLocaleTimeString('en-US', options);
                const currentSec = now.getSeconds();
                const station = data[stationName];
                if (station) {
                    // Compute messages based on seconds within the minute
                    const msg1 = station["Motijheel"].includes(currentTime)
                       ? `<div class="arrival-message">Train is ${currentSec < 30 ? 'arriving at' : 'leaving'} Platform 1</div>` : '';
                    const msg2 = station["Uttara North"].includes(currentTime)
                       ? `<div class="arrival-message">Train is ${currentSec < 30 ? 'arriving at' : 'leaving'} Platform 2</div>` : '';
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
                const now = new Date();
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
                const now = new Date();
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

    // Toggle dark/light mode
    toggleModeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleModeButton.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
});