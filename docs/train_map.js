document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const dateDisplay = document.getElementById('date-display');
    const dayDisplay = document.getElementById('day-display');
    const mapTrack = document.getElementById('map-track');
    const modal = document.getElementById('trainModal');

    // Station list in order from Uttara North (Top) to Motijheel (Bottom)
    const stationsOrder = [
        "Uttara North", "Uttara Center", "Uttara South", "Pallabi", "Mirpur 11", "Mirpur 10", 
        "Kazipara", "Sewrapara", "Agargoan", "Bijoy Sarani", "Farmgate", "Karwan Bazar", 
        "Shahbag", "Dhaka University", "Bangladesh Secretariat", "Motijheel"
    ];

    let scheduleData = null;
    let lastFetchTime = 0;
    const FETCH_INTERVAL = 60000; // Fetch every minute
    let activeFilter = 'all'; // 'all', 'motijheel', 'uttara'

    // Filter Logic
    window.toggleFilter = function(filter) {
        if (activeFilter === filter) {
            activeFilter = 'all';
        } else {
            activeFilter = filter;
        }
        updateFilterUI();
    };

    function updateFilterUI() {
        const motijheelBtn = document.getElementById('filter-motijheel');
        const uttaraBtn = document.getElementById('filter-uttara');

        if (motijheelBtn) motijheelBtn.classList.remove('active');
        if (uttaraBtn) uttaraBtn.classList.remove('active');

        if (activeFilter === 'motijheel' && motijheelBtn) {
            motijheelBtn.classList.add('active');
        } else if (activeFilter === 'uttara' && uttaraBtn) {
            uttaraBtn.classList.add('active');
        }
    }

    // Helper to return current time
    function getCurrentTime() {
        return new Date();
    }

    // Update clock function
    function updateClock() {
        const now = new Date();
        const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        if (clockElement) clockElement.textContent = now.toLocaleTimeString('en-US', options);
        
        if (dateDisplay && dayDisplay) {
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            dayDisplay.textContent = daysOfWeek[now.getDay()];
            const month = monthNames[now.getMonth()];
            const day = now.getDate();
            const year = now.getFullYear();
            dateDisplay.textContent = `${month} ${day}, ${year}`;
        }
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Render Stations
    function renderStations() {
        const totalHeight = 600; // Approximate height of the track container
        const spacing = totalHeight / (stationsOrder.length - 1);

        stationsOrder.forEach((station, index) => {
            const node = document.createElement('div');
            node.className = 'station-node';
            node.style.top = `${index * spacing}px`;
            
            const label = document.createElement('div');
            label.className = 'station-label';
            label.textContent = station;
            
            node.appendChild(label);
            mapTrack.appendChild(node);
        });
        
        // Set container height explicitly
        mapTrack.style.height = `${totalHeight}px`;
    }

    renderStations();

    // Determine which schedule file to use
    function getTrainTimesFile() {
        const today = getCurrentTime();
        const dayOfWeek = today.getDay();
        
        if (dayOfWeek === 5) { // Friday
            return 'mrt-6-fri.json';
        } else if (dayOfWeek === 6) { // Saturday
            return 'mrt-6-sat.json';
        } else { // Other days
            return 'mrt-6.json';
        }
    }

    // Fetch data
    function fetchSchedule() {
        const now = Date.now();
        if (scheduleData && (now - lastFetchTime < FETCH_INTERVAL)) {
            return Promise.resolve(scheduleData);
        }

        return fetch(getTrainTimesFile())
            .then(response => response.json())
            .then(data => {
                scheduleData = data;
                lastFetchTime = now;
                return data;
            })
            .catch(error => console.error('Error fetching schedule:', error));
    }

    // Main animation loop
    function animateTrains() {
        if (!scheduleData) {
            fetchSchedule().then(() => requestAnimationFrame(animateTrains));
            return;
        }

        // Clear existing trains (or update them efficiently - for now, re-rendering is fine as DOM ops are low)
        const existingTrains = document.querySelectorAll('.train-marker');
        existingTrains.forEach(t => t.remove());

        const now = getCurrentTime();
        // Convert current time to minutes with seconds precision for smooth movement
        const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

        // Process Motijheel Bound (Down)
        if (activeFilter === 'all' || activeFilter === 'motijheel') {
            processDirection(scheduleData, "Motijheel", currentMinutes, 'motijheel-bound');
        }

        // Process Uttara Bound (Up)
        if (activeFilter === 'all' || activeFilter === 'uttara') {
            processDirection(scheduleData, "Uttara North", currentMinutes, 'uttara-bound');
        }

        requestAnimationFrame(animateTrains);
    }

    function processDirection(data, direction, currentMinutes, cssClass) {
        const firstStation = direction === "Motijheel" ? stationsOrder[0] : stationsOrder[stationsOrder.length - 1];
        
        if (!data[firstStation] || !data[firstStation][direction]) return;

        const trainCount = data[firstStation][direction].length;

        for (let i = 0; i < trainCount; i++) {
            // Construct the schedule for this specific train
            let trainSchedule = [];
            let isValidTrain = true;

            // Iterate through stations in order of travel
            const travelStations = direction === "Motijheel" ? stationsOrder : [...stationsOrder].reverse();

            for (let j = 0; j < travelStations.length; j++) {
                const station = travelStations[j];
                if (data[station] && data[station][direction] && data[station][direction][i]) {
                    trainSchedule.push({
                        station: station,
                        timeStr: data[station][direction][i],
                        minutes: timeToMinutes(data[station][direction][i]),
                        stationIndex: stationsOrder.indexOf(station) // Original index for positioning
                    });
                } else {
                    isValidTrain = false;
                    break;
                }
            }

            if (!isValidTrain || trainSchedule.length === 0) continue;

            const startTime = trainSchedule[0].minutes;
            const endTime = trainSchedule[trainSchedule.length - 1].minutes;

            // Check if train is currently running
            if (currentMinutes >= startTime && currentMinutes <= endTime) {
                // Find exactly where it is
                for (let k = 0; k < trainSchedule.length - 1; k++) {
                    const currentStop = trainSchedule[k];
                    const nextStop = trainSchedule[k+1];

                    if (currentMinutes >= currentStop.minutes && currentMinutes < nextStop.minutes) {
                        // Train is between currentStop and nextStop
                        const totalSegmentTime = nextStop.minutes - currentStop.minutes;
                        const timeElapsed = currentMinutes - currentStop.minutes;
                        const progress = timeElapsed / totalSegmentTime;

                        // Calculate position on the map
                        const totalHeight = 600;
                        const spacing = totalHeight / (stationsOrder.length - 1);
                        
                        const startY = currentStop.stationIndex * spacing;
                        const endY = nextStop.stationIndex * spacing;
                        
                        const currentY = startY + (endY - startY) * progress;

                        // Render Train
                        const trainMarker = document.createElement('div');
                        trainMarker.className = `train-marker ${cssClass}`;
                        trainMarker.style.top = `${currentY}px`;
                        
                        // Add icon
                        const icon = document.createElement('span');
                        icon.className = 'train-icon';
                        icon.textContent = '🚆'; // Train emoji
                        trainMarker.appendChild(icon);

                        // Click event for modal
                        trainMarker.onclick = () => showTrainDetails(direction, nextStop, progress);

                        mapTrack.appendChild(trainMarker);
                        break; // Found the segment, move to next train
                    }
                }
            }
        }
    }

    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Modal Logic
    window.showTrainDetails = function(direction, nextStop, progress) {
        document.getElementById('modalDirection').textContent = `To ${direction}`;
        document.getElementById('modalNextStation').textContent = nextStop.station;
        document.getElementById('modalArrivalTime').textContent = nextStop.timeStr;
        document.getElementById('modalProgress').textContent = `${Math.round(progress * 100)}%`;
        
        modal.classList.add('active');
    };

    window.closeModal = function() {
        modal.classList.remove('active');
    };

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Start animation
    fetchSchedule().then(() => {
        requestAnimationFrame(animateTrains);
        // Also set up periodic fetch to refresh schedule data (e.g. if day changes)
        setInterval(fetchSchedule, FETCH_INTERVAL);
    });
});
