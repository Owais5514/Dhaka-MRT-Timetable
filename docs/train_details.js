document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const dateDisplay = document.getElementById('date-display');
    const dayDisplay = document.getElementById('day-display');
    const journeyTitle = document.getElementById('journey-title');
    const journeySubtitle = document.getElementById('journey-subtitle');
    const timelineContainer = document.getElementById('journey-timeline');
    const mapTrack = document.getElementById('map-track');

    // Station list in order from Uttara North to Motijheel
    const stationsOrder = [
        "Uttara North", "Uttara Center", "Uttara South", "Pallabi", "Mirpur 11", "Mirpur 10", 
        "Kazipara", "Sewrapara", "Agargoan", "Bijoy Sarani", "Farmgate", "Karwan Bazar", 
        "Shahbag", "Dhaka University", "Bangladesh Secretariat", "Motijheel"
    ];

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

    // Render Stations on Map
    function renderStations() {
        if (!mapTrack) return;
        
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
        
        mapTrack.style.height = `${totalHeight}px`;
    }

    renderStations();

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sourceStation = urlParams.get('station');
    const selectedTime = urlParams.get('time');
    const direction = urlParams.get('direction'); // "Motijheel" or "Uttara North"
    const scheduleFile = urlParams.get('file') || 'mrt-6.json';

    if (!sourceStation || !selectedTime || !direction) {
        journeySubtitle.textContent = "Error: Missing journey details.";
        return;
    }

    journeyTitle.textContent = `Train to ${direction}`;
    journeySubtitle.textContent = `Selected from ${sourceStation} at ${selectedTime}`;

    // Fetch the schedule data
    fetch(scheduleFile)
        .then(response => response.json())
        .then(data => {
            // 1. Find the index of the selected train at the source station
            const stationData = data[sourceStation];
            if (!stationData || !stationData[direction]) {
                journeySubtitle.textContent = "Error: Station or direction not found in schedule.";
                return;
            }

            const trainIndex = stationData[direction].indexOf(selectedTime);
            if (trainIndex === -1) {
                journeySubtitle.textContent = "Error: Selected time not found in schedule.";
                return;
            }

            // 2. Determine the list of stations based on direction
            let journeyStations = [];
            if (direction === "Motijheel") {
                journeyStations = [...stationsOrder];
            } else {
                journeyStations = [...stationsOrder].reverse();
            }

            // 3. Build the journey data
            const journeyDetails = [];
            
            journeyStations.forEach(station => {
                if (data[station] && data[station][direction]) {
                    const times = data[station][direction];
                    if (trainIndex < times.length) {
                        const time = times[trainIndex];
                        journeyDetails.push({
                            station: station,
                            time: time,
                            minutes: timeToMinutes(time),
                            stationIndex: stationsOrder.indexOf(station)
                        });
                    }
                }
            });

            // 4. Render the timeline
            const now = getCurrentTime();
            const options = { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: false };
            const currentTimeStr = now.toLocaleTimeString('en-US', options);
            renderTimeline(journeyDetails, currentTimeStr);

            // 5. Start Map Animation
            animateTrain(journeyDetails, direction);

        })
        .catch(error => {
            console.error('Error loading schedule:', error);
            journeySubtitle.textContent = "Error loading schedule data.";
        });

    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function renderTimeline(journey, currentTime) {
        timelineContainer.innerHTML = '';
        
        let currentStationIndex = -1;
        
        // Find the last station passed
        for (let i = 0; i < journey.length; i++) {
            if (journey[i].time <= currentTime) {
                currentStationIndex = i;
            } else {
                break;
            }
        }

        journey.forEach((stop, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            let statusClass = '';
            let statusText = '';
            let dotClass = 'timeline-dot';

            if (index < currentStationIndex) {
                statusClass = 'completed';
                statusText = 'Departed';
                item.classList.add('completed');
            } else if (index === currentStationIndex) {
                if (index === journey.length - 1) {
                    statusClass = 'completed';
                    statusText = 'Arrived';
                    item.classList.add('completed');
                } else {
                    statusClass = 'current';
                    statusText = 'Current Location';
                    item.classList.add('current');
                }
            } else {
                statusClass = 'upcoming';
                statusText = 'Expected';
                item.classList.add('upcoming');
            }

            if (currentStationIndex === -1 && index === 0) {
                 statusText = 'Starts Here';
            }

            item.innerHTML = `
                <div class="${dotClass}"></div>
                <div class="station-info">
                    <div class="station-name">
                        ${stop.station}
                        ${statusText ? `<span class="status-badge status-${statusClass}">${statusText}</span>` : ''}
                    </div>
                    <div class="arrival-time">${stop.time}</div>
                </div>
            `;
            
            timelineContainer.appendChild(item);
        });
        
        const currentItem = timelineContainer.querySelector('.timeline-item.current');
        if (currentItem) {
            setTimeout(() => {
                currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }

    function animateTrain(journeyDetails, direction) {
        if (!mapTrack) return;

        function update() {
            // Clear existing marker
            const existing = mapTrack.querySelector('.train-marker');
            if (existing) existing.remove();

            const now = getCurrentTime();
            const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

            const startTime = journeyDetails[0].minutes;
            const endTime = journeyDetails[journeyDetails.length - 1].minutes;

            // Check if train is currently running
            if (currentMinutes >= startTime && currentMinutes <= endTime) {
                // Find exactly where it is
                for (let k = 0; k < journeyDetails.length - 1; k++) {
                    const currentStop = journeyDetails[k];
                    const nextStop = journeyDetails[k+1];

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
                        // Use the correct class based on direction
                        const cssClass = direction === "Motijheel" ? 'motijheel-bound' : 'uttara-bound';
                        trainMarker.className = `train-marker ${cssClass}`;
                        trainMarker.style.top = `${currentY}px`;
                        
                        // Add icon
                        const icon = document.createElement('span');
                        icon.className = 'train-icon';
                        icon.textContent = '🚆';
                        trainMarker.appendChild(icon);

                        mapTrack.appendChild(trainMarker);
                        break;
                    }
                }
            }

            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }
});
