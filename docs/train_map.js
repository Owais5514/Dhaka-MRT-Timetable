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

    // Display list (includes construction-only stop)
    const stationDisplay = [
        ...stationsOrder.map(name => ({ name, construction: false })),
        { name: "Kamalapur", construction: true }
    ];

    const baseHeight = 620;
    const spacing = baseHeight / (stationsOrder.length - 1);

    // Render Stations & Track
    function renderStations() {
        const totalHeight = spacing * (stationDisplay.length - 1) + 40;
        mapTrack.innerHTML = '';

        // Draw stations and labels
        stationDisplay.forEach((station, index) => {
            const node = document.createElement('div');
            node.className = `station-node${station.construction ? ' construction' : ''}`;
            node.style.top = `${index * spacing}px`;
            node.style.left = '50%';
            
            const label = document.createElement('div');
            label.className = `station-label${station.construction ? ' construction' : ''}`;
            label.textContent = station.construction ? `${station.name} (Construction)` : station.name;
            if (!station.construction) {
                label.onclick = () => showStationDetails(station.name);
            }
            
            node.appendChild(label);
            mapTrack.appendChild(node);
        });

        mapTrack.style.height = `${totalHeight}px`;
    }

    renderStations();

    function getYForStationIndex(index) {
        return index * spacing;
    }

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

    const ARRIVAL_WINDOW = 1; // minutes before scheduled time
    const DEPARTURE_WINDOW = 0.25; // minutes after scheduled time (~15s)

    function processDirection(data, direction, currentMinutes, cssClass) {
        const firstStation = direction === "Motijheel" ? stationsOrder[0] : stationsOrder[stationsOrder.length - 1];
        
        if (!data[firstStation] || !data[firstStation][direction]) return;

        const trainCount = data[firstStation][direction].length;

        for (let i = 0; i < trainCount; i++) {
            // Construct the schedule for this specific train
            const trainSchedule = [];
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
            if (currentMinutes >= startTime && currentMinutes <= endTime + DEPARTURE_WINDOW) {
                // Find exactly where it is
                for (let k = 0; k < trainSchedule.length - 1; k++) {
                    const currentStop = trainSchedule[k];
                    const nextStop = trainSchedule[k+1];

                    const arrivalStart = nextStop.minutes - ARRIVAL_WINDOW;
                    const departureEnd = nextStop.minutes + DEPARTURE_WINDOW;

                    // Arriving window (1 minute before scheduled time)
                    if (currentMinutes >= arrivalStart && currentMinutes < nextStop.minutes) {
                        renderTrainMarker(nextStop.stationIndex, cssClass, 'arriving', direction, nextStop, 1);
                        break;
                    }

                    // Departure window (brief pulse at scheduled time)
                    if (currentMinutes >= nextStop.minutes && currentMinutes < departureEnd) {
                        renderTrainMarker(nextStop.stationIndex, cssClass, 'departing', direction, nextStop, 1);
                        break;
                    }

                    if (currentMinutes >= currentStop.minutes && currentMinutes < nextStop.minutes) {
                        // Train is between currentStop and nextStop
                        const totalSegmentTime = nextStop.minutes - currentStop.minutes;
                        const timeElapsed = currentMinutes - currentStop.minutes;
                        const progress = timeElapsed / totalSegmentTime;

                        const startY = getYForStationIndex(currentStop.stationIndex);
                        const endY = getYForStationIndex(nextStop.stationIndex);
                        const currentY = startY + (endY - startY) * progress;

                        renderTrainMarkerPosition(currentY, cssClass, direction, nextStop, progress);
                        break; // Found the segment, move to next train
                    }

                    // Handle final arrival case (at last station)
                    if (k === trainSchedule.length - 2 && currentMinutes >= arrivalStart && currentMinutes <= endTime + DEPARTURE_WINDOW) {
                        renderTrainMarker(nextStop.stationIndex, cssClass, 'arriving', direction, nextStop, 1);
                        break;
                    }
                }
            }
        }
    }

    function renderTrainMarker(stationIndex, cssClass, state, direction, nextStop, progress) {
        const currentY = getYForStationIndex(stationIndex);
        renderTrainMarkerPosition(currentY, cssClass, direction, nextStop, progress, state);
    }

    function renderTrainMarkerPosition(currentY, cssClass, direction, nextStop, progress, state = '') {
        const trainMarker = document.createElement('div');
        trainMarker.className = `train-marker ${cssClass}${state ? ' ' + state : ''}`;
        trainMarker.style.top = `${currentY}px`;
        
        const icon = document.createElement('span');
        icon.className = 'train-icon';
        icon.textContent = '🚆';
        trainMarker.appendChild(icon);

        trainMarker.onclick = () => showTrainDetails(direction, nextStop, progress);
        mapTrack.appendChild(trainMarker);
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

    // Station Details Modal Logic
    const stationModal = document.getElementById('stationModal');
    let currentTab = 'motijheel';
    
    // Google Maps coordinates for each station
    const stationCoordinates = {
        "Uttara North": "23.8759,90.3795",
        "Uttara Center": "23.8689,90.3822",
        "Uttara South": "23.8628,90.3869",
        "Pallabi": "23.8282,90.3655",
        "Mirpur 11": "23.8175,90.3589",
        "Mirpur 10": "23.8069,90.3684",
        "Kazipara": "23.7977,90.3710",
        "Sewrapara": "23.7903,90.3750",
        "Agargoan": "23.7783,90.3794",
        "Bijoy Sarani": "23.7652,90.3881",
        "Farmgate": "23.7581,90.3897",
        "Karwan Bazar": "23.7507,90.3919",
        "Shahbag": "23.7388,90.3953",
        "Dhaka University": "23.7356,90.3969",
        "Bangladesh Secretariat": "23.7268,90.4024",
        "Motijheel": "23.7330,90.4172"
    };
    
    window.showStationDetails = function(stationName) {
        document.getElementById('modalStationName').textContent = stationName;
        
        // Set Google Maps link
        const coords = stationCoordinates[stationName] || "23.7808,90.4194"; // Default to Dhaka center
        document.getElementById('stationGoogleMapsLink').href = `https://www.google.com/maps/search/?api=1&query=${coords}`;
        
        if (!scheduleData) {
            fetchSchedule().then(() => populateStationDetails(stationName));
        } else {
            populateStationDetails(stationName);
        }
        
        stationModal.classList.add('active');
    };
    
    function populateStationDetails(stationName) {
        const stationData = scheduleData[stationName];
        if (!stationData) return;
        
        // Get first and last trains
        const motijheelTrains = stationData["Motijheel"] || [];
        const uttaraTrains = stationData["Uttara North"] || [];
        
        if (motijheelTrains.length > 0) {
            const first = motijheelTrains[0];
            const last = motijheelTrains[motijheelTrains.length - 1];
            document.getElementById('motijheelFirstLast').textContent = `${first} - ${last}`;
        } else {
            document.getElementById('motijheelFirstLast').textContent = 'No service';
        }
        
        if (uttaraTrains.length > 0) {
            const first = uttaraTrains[0];
            const last = uttaraTrains[uttaraTrains.length - 1];
            document.getElementById('uttaraFirstLast').textContent = `${first} - ${last}`;
        } else {
            document.getElementById('uttaraFirstLast').textContent = 'No service';
        }
        
        // Populate train lists
        populateTrainList('motijheel', motijheelTrains);
        populateTrainList('uttara', uttaraTrains);
    }
    
    function populateTrainList(direction, trains) {
        const listId = direction === 'motijheel' ? 'trainListMotijheel' : 'trainListUttara';
        const listElement = document.getElementById(listId);
        listElement.innerHTML = '';
        
        const now = getCurrentTime();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        // Find current position
        let currentIndex = -1;
        let departedCount = 0;
        
        for (let i = 0; i < trains.length; i++) {
            const trainMinutes = timeToMinutes(trains[i]);
            if (trainMinutes <= currentMinutes) {
                departedCount++;
            } else if (currentIndex === -1) {
                currentIndex = i;
            }
        }
        
        // Show 3 departed trains + next 12 trains (15 total)
        const startIndex = Math.max(0, departedCount - 3);
        const endIndex = Math.min(trains.length, startIndex + 15);
        
        for (let i = startIndex; i < endIndex; i++) {
            const trainTime = trains[i];
            const trainMinutes = timeToMinutes(trainTime);
            const item = document.createElement('div');
            item.className = 'train-item';
            
            let statusClass = '';
            let statusText = '';
            
            if (trainMinutes < currentMinutes) {
                item.classList.add('departed');
                statusClass = 'departed';
                statusText = 'Departed';
            } else if (i === currentIndex) {
                item.classList.add('current');
                statusClass = 'current';
                statusText = 'Next Train';
            } else if (i === currentIndex + 1) {
                item.classList.add('next');
                statusClass = 'next';
                statusText = 'Coming';
            }
            
            item.innerHTML = `
                <span class="train-time">${trainTime}</span>
                ${statusText ? `<span class="train-status ${statusClass}">${statusText}</span>` : ''}
            `;
            
            listElement.appendChild(item);
        }
        
        if (trains.length === 0) {
            listElement.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No trains available</div>';
        }
    }
    
    window.switchTab = function(tab) {
        currentTab = tab;
        const motijheelList = document.getElementById('trainListMotijheel');
        const uttaraList = document.getElementById('trainListUttara');
        const tabs = document.querySelectorAll('.tab-btn');
        
        tabs.forEach(t => t.classList.remove('active'));
        
        if (tab === 'motijheel') {
            motijheelList.style.display = 'block';
            uttaraList.style.display = 'none';
            tabs[0].classList.add('active');
        } else {
            motijheelList.style.display = 'none';
            uttaraList.style.display = 'block';
            tabs[1].classList.add('active');
        }
    };
    
    window.closeStationModal = function() {
        stationModal.classList.remove('active');
    };
    
    stationModal.addEventListener('click', (e) => {
        if (e.target === stationModal) closeStationModal();
    });

    // Start animation
    fetchSchedule().then(() => {
        requestAnimationFrame(animateTrains);
        // Also set up periodic fetch to refresh schedule data (e.g. if day changes)
        setInterval(fetchSchedule, FETCH_INTERVAL);
    });
});
