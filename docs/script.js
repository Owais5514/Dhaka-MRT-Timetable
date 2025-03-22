document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const stationSelect = document.getElementById('station');
    const scheduleDiv = document.getElementById('schedule');
    const confirmButton = document.getElementById('confirm');
    
    // Custom dropdown elements
    const customDropdown = document.getElementById('station-dropdown');
    const selectedOption = document.getElementById('selected-station');
    const stationOptions = document.getElementById('station-options');
    const stationColumns = document.querySelector('.station-columns');
    
    // New global variable to hold custom time override
    let customTime = null;
    let isPaused = false;
    let clockInterval;
    
    // Helper to return current time: custom if set, system otherwise
    function getCurrentTime() {
        return customTime ? new Date(customTime) : new Date();
    }
    
    // Modified updateClock to use customTime if set
    function updateClock() {
        if (isPaused) return;
        
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

    // Reset the clock interval
    function resetClockInterval() {
        if (clockInterval) {
            clearInterval(clockInterval);
        }
        clockInterval = setInterval(updateClock, 1000);
    }

    // Initialize clock interval
    resetClockInterval();
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

    // Toggle custom dropdown when clicked
    if (customDropdown) {
        selectedOption.addEventListener('click', () => {
            customDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!customDropdown.contains(event.target)) {
                customDropdown.classList.remove('active');
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
                    
                    // Use our new custom methods to show/hide the arrival message
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
                    
                    // Get the last 5 past trains (or all if there are fewer)
                    const recentPastTrainsToMotijheel = pastTrainsToMotijheel.slice(-5);
                    const recentPastTrainsToUttara = pastTrainsToUttara.slice(-5);
                    
                    // Build HTML for platform 1 (To Motijheel)
                    let platform1HTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                    `;
                    
                    // Add past trains with past-train class
                    recentPastTrainsToMotijheel.forEach(time => {
                        platform1HTML += `<li class="past-train">${time}</li>`;
                    });
                    
                    // Add current/upcoming trains with appropriate classes
                    futureTrainsToMotijheel.forEach((time, index) => {
                        let className = "";
                        if (time === currentTime) {
                            className = "current-train";
                        } else if (index < 3) {
                            className = `upcoming-train fade-in" style="animation-delay: ${index * 0.2}s;`;
                        } else {
                            className = "future-train";
                        }
                        platform1HTML += `<li class="${className}">${time}</li>`;
                    });
                    
                    platform1HTML += `</ul>`;
                    
                    // Build HTML for platform 2 (To Uttara North)
                    let platform2HTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                    `;
                    
                    // Add past trains with past-train class
                    recentPastTrainsToUttara.forEach(time => {
                        platform2HTML += `<li class="past-train">${formatTimeWithDelay(time, stationName, "Uttara North")}</li>`;
                    });
                    
                    // Add current/upcoming trains with appropriate classes
                    futureTrainsToUttara.forEach((time, index) => {
                        let className = "";
                        if (time === currentTime) {
                            className = "current-train";
                        } else if (index < 3) {
                            className = `upcoming-train fade-in" style="animation-delay: ${index * 0.2}s;`;
                        } else {
                            className = "future-train";
                        }
                        platform2HTML += `<li class="${className}">${formatTimeWithDelay(time, stationName, "Uttara North")}</li>`;
                    });
                    
                    platform2HTML += `</ul>`;
                    
                    // Update the platform containers
                    document.getElementById('platform1').innerHTML = platform1HTML;
                    document.getElementById('platform2').innerHTML = platform2HTML;
                    
                    // Scroll to the first upcoming train in each platform list
                    setTimeout(() => {
                        const platform1List = document.querySelector('#platform1 .train-times');
                        const platform2List = document.querySelector('#platform2 .train-times');
                        
                        const firstUpcomingPlatform1 = platform1List.querySelector('.upcoming-train') || platform1List.querySelector('.current-train');
                        const firstUpcomingPlatform2 = platform2List.querySelector('.upcoming-train') || platform2List.querySelector('.current-train');
                        
                        if (firstUpcomingPlatform1) {
                            const scrollPos1 = firstUpcomingPlatform1.offsetTop - platform1List.offsetTop - 40;
                            platform1List.scrollTop = Math.max(0, scrollPos1);
                        }
                        
                        if (firstUpcomingPlatform2) {
                            const scrollPos2 = firstUpcomingPlatform2.offsetTop - platform2List.offsetTop - 40;
                            platform2List.scrollTop = Math.max(0, scrollPos2);
                        }
                    }, 100); // Small delay to ensure the DOM is fully rendered
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
                const station = data[stationName];
                
                if (station) {
                    // Hide any arrival messages when viewing first trains
                    window.hideArrivalMessage();
                    
                    // Get first several trains for each direction
                    const trainsToMotijheel = station["Motijheel"].slice(0, 10); // Get first 10 trains
                    const trainsToUttara = station["Uttara North"].slice(0, 10); // Get first 10 trains
                    
                    // Build HTML for platform 1 (To Motijheel)
                    let platform1HTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                    `;
                    
                    trainsToMotijheel.forEach((time, index) => {
                        let className = "";
                        if (index < 3) {
                            className = `upcoming-train fade-in" style="animation-delay: ${index * 0.1}s;`;
                        } else {
                            className = "future-train";
                        }
                        platform1HTML += `<li class="${className}">${time}</li>`;
                    });
                    
                    platform1HTML += `</ul>`;
                    
                    // Build HTML for platform 2 (To Uttara North)
                    let platform2HTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                    `;
                    
                    trainsToUttara.forEach((time, index) => {
                        let className = "";
                        if (index < 3) {
                            className = `upcoming-train fade-in" style="animation-delay: ${index * 0.1}s;`;
                        } else {
                            className = "future-train";
                        }
                        platform2HTML += `<li class="${className}">${formatTimeWithDelay(time, stationName, "Uttara North")}</li>`;
                    });
                    
                    platform2HTML += `</ul>`;
                    
                    document.getElementById('platform1').innerHTML = platform1HTML;
                    document.getElementById('platform2').innerHTML = platform2HTML;
                    
                    // Scroll to the first train in each list
                    setTimeout(() => {
                        const platform1List = document.querySelector('#platform1 .train-times');
                        const platform2List = document.querySelector('#platform2 .train-times');
                        
                        // Reset scroll position to top for First Train
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
                const now = getCurrentTime();
                const options = {
                    timeZone: 'Asia/Dhaka',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                };
                const currentTime = now.toLocaleTimeString('en-US', options);
                const station = data[stationName];

                if (station) {
                    // Hide any arrival messages when viewing last trains
                    window.hideArrivalMessage();
                    
                    // Get last 10 trains for each direction
                    const trainsToMotijheel = station["Motijheel"].slice(-10); // Get last 10 trains
                    const trainsToUttara = station["Uttara North"].slice(-10); // Get last 10 trains
                    
                    // Build HTML for platform 1 (To Motijheel)
                    let platform1HTML = `
                        <h3>Platform 1</h3>
                        <p class="direction-text">To Motijheel</p>
                        <ul class="train-times">
                    `;
                    
                    trainsToMotijheel.forEach((time, index) => {
                        let className = "";
                        if (index >= trainsToMotijheel.length - 3) {
                            className = `upcoming-train fade-in" style="animation-delay: ${(trainsToMotijheel.length - index - 1) * 0.1}s;`;
                        } else {
                            className = "future-train";
                        }
                        platform1HTML += `<li class="${className}">${time}</li>`;
                    });
                    
                    platform1HTML += `</ul>`;
                    
                    // Build HTML for platform 2 (To Uttara North)
                    let platform2HTML = `
                        <h3>Platform 2</h3>
                        <p class="direction-text">To Uttara North</p>
                        <ul class="train-times">
                    `;
                    
                    trainsToUttara.forEach((time, index) => {
                        let className = "";
                        if (index >= trainsToUttara.length - 3) {
                            className = `upcoming-train fade-in" style="animation-delay: ${(trainsToUttara.length - index - 1) * 0.1}s;`;
                        } else {
                            className = "future-train";
                        }
                        platform2HTML += `<li class="${className}">${formatTimeWithDelay(time, stationName, "Uttara North")}</li>`;
                    });
                    
                    platform2HTML += `</ul>`;
                    
                    document.getElementById('platform1').innerHTML = platform1HTML;
                    document.getElementById('platform2').innerHTML = platform2HTML;
                    
                    // Scroll to show the last few trains
                    setTimeout(() => {
                        const platform1List = document.querySelector('#platform1 .train-times');
                        const platform2List = document.querySelector('#platform2 .train-times');
                        
                        // For Last Train button, scroll to the bottom
                        if (platform1List) platform1List.scrollTop = platform1List.scrollHeight;
                        if (platform2List) platform2List.scrollTop = platform2List.scrollHeight;
                    }, 100);
                }
            })
            .catch(error => console.error('Error fetching train data:', error));
    });

    // Admin functionality with the new modal design
    const adminUnlock = document.getElementById('admin-unlock');
    const adminPassword = document.getElementById('admin-password');
    const adminControls = document.getElementById('admin-controls');
    const customTimeInput = document.getElementById('custom-time');
    const setTimeBtn = document.getElementById('set-time');
    const resetTimeBtn = document.getElementById('reset-time');
    const adminBtn = document.getElementById('admin-btn');
    const adminModal = document.getElementById('admin-modal');
    const closeAdmin = document.getElementById('close-admin');
    
    // Show modal when clicking admin button
    if (adminBtn) {
        adminBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (adminModal) {
                adminModal.style.display = 'flex';
            }
        });
    }
    
    // Close modal with close button
    if (closeAdmin) {
        closeAdmin.addEventListener('click', () => {
            if (adminModal) {
                adminModal.style.display = 'none';
            }
        });
    }
    
    // Close modal when clicking outside
    if (adminModal) {
        window.addEventListener('click', (event) => {
            if (event.target === adminModal) {
                adminModal.style.display = 'none';
            }
        });
    }
    
    // Unlock admin controls when correct password is entered
    if (adminUnlock) {
        adminUnlock.addEventListener('click', () => {
            if (adminPassword && adminControls) {
                if (adminPassword.value === '12345678') {
                    adminControls.style.display = 'block';
                } else {
                    alert('Incorrect password');
                    adminControls.style.display = 'none';
                }
            }
        });
    }
    
    // Set custom time override based on entered time
    if (setTimeBtn) {
        setTimeBtn.addEventListener('click', () => {
            if (customTimeInput) {
                const timeValue = customTimeInput.value;
                // Handle both HH:MM and HH:MM:SS formats
                let hours, minutes, seconds = 0;
                
                if (timeValue.includes(':')) {
                    const timeParts = timeValue.split(':');
                    hours = parseInt(timeParts[0]) || 0;
                    minutes = parseInt(timeParts[1]) || 0;
                    seconds = parseInt(timeParts[2]) || 0;
                    
                    const now = new Date();
                    now.setHours(hours, minutes, seconds);
                    customTime = new Date(now);
                    console.log('Custom time set to:', customTime);
                } else {
                    alert('Please enter time in HH:MM or HH:MM:SS format');
                }
            }
        });
    }
    
    // Reset to system time (clear custom override)
    if (resetTimeBtn) {
        resetTimeBtn.addEventListener('click', () => {
            customTime = null;
            if (customTimeInput) {
                customTimeInput.value = '';
            }
        });
    }
    
    // Also add event listener for Enter key when in password field
    if (adminPassword) {
        adminPassword.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (adminUnlock) {
                    adminUnlock.click();
                }
            }
        });
    }
    
    // Handle preset time buttons
    const presetButtons = document.querySelectorAll('.preset-time-btn');
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const timeValue = button.getAttribute('data-time');
            const [hours, minutes] = timeValue.split(':').map(Number);
            const now = new Date();
            now.setHours(hours, minutes, 0);
            customTime = now;
            updateClock();
        });
    });

    // Handle pause/resume button
    const pauseResumeBtn = document.getElementById('pause-resume');
    pauseResumeBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseResumeBtn.textContent = isPaused ? 'Resume' : 'Pause';
        pauseResumeBtn.classList.toggle('paused', isPaused);
        if (!isPaused) {
            updateClock();
            resetClockInterval();
        }
    });

    // Initialize by hiding the arrival message at startup
    if (typeof window.hideArrivalMessage === 'function') {
        window.hideArrivalMessage();
    }
});

// Function to format time with potential delay information
function formatTimeWithDelay(time, stationName, direction) {
    // Check if delay information exists for this station and direction
    // This is a placeholder - actual delay detection will come from delay-handler.js
    return time; // For now, just return the time without delay info
}