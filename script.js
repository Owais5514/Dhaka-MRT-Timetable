document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const stationSelect = document.getElementById('station');
    const scheduleDiv = document.getElementById('schedule');
    const confirmButton = document.getElementById('confirm');
    const toggleModeButton = document.getElementById('toggle-mode');
    const menuToggleButton = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');

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

    // Fetch station names and populate the dropdown
    fetch('mrt-6.json')
        .then(response => response.json())
        .then(data => {
            const stationOrder = [
                "Uttara North", "Uttara Center", "Uttara South", "Pallabi", "Mirpur 11", "Mirpur 10", 
                "Kazipara", "Sewrapara", "Agargoan", "Bijoy Sharani", "Farmgate", "Karwan Bazar", 
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
        fetch('mrt-6.json')
            .then(response => response.json())
            .then(data => {
                const now = new Date();
                const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: false };
                const currentTime = now.toLocaleTimeString('en-US', options);

                const station = data[stationName];
                if (station) {
                    const nextTrainsToMotijheel = station["Motijheel"].filter(time => time > currentTime).slice(0, 3);
                    const nextTrainsToUttara = station["Uttara North"].filter(time => time > currentTime).slice(0, 3);

                    scheduleDiv.innerHTML = `
                        <h2>Platform 1</h2>
                        <p>Next 3 trains to Motijheel</p>
                        <ul class="train-times">${nextTrainsToMotijheel.map(time => `<li>${time}</li>`).join('')}</ul>
                        <h2>Platform 2</h2>
                        <p>Next 3 trains to Uttara North</p>
                        <ul class="train-times">${nextTrainsToUttara.map(time => `<li>${time}</li>`).join('')}</ul>
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

    // Toggle dark/light mode
    toggleModeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleModeButton.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Toggle menu visibility
    menuToggleButton.addEventListener('click', () => {
        menu.classList.toggle('visible');
    });
});