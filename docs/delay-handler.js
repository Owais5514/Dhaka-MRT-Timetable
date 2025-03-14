function isDelayApplicable(date = new Date()) {
    const day = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    return day !== 5 && day !== 6; // Return false for Friday and Saturday
}

function applyDelays(time, station) {
    if (!isDelayApplicable()) return 0;

    const [hours, minutes] = time.split(':').map(Number);
    const currentTime = hours * 60 + minutes;
    const delayStart = 15 * 60 + 30; // 3:30 PM
    const delayEnd = 18 * 60 + 20;   // 6:20 PM
    
    if (currentTime >= delayStart && currentTime <= delayEnd) {
        if (['Dhaka University', 'Shahbag'].includes(station)) {
            return 1;
        } else if (['Karwan Bazar', 'Farmgate', 'Bijoy Sarani'].includes(station)) {
            return 2;
        } else if (['Agargoan', 'Sewrapara', 'Kazipara', 'Mirpur 10', 'Mirpur 11', 'Pallabi', 'Uttara South', 'Uttara Center', 'Uttara North'].includes(station)) {
            return 3;
        }
    }
    return 0;
}

function addDelayDisplay(time, station) {
    const delay = applyDelays(time, station);
    return delay ? `<span class="delay-text">+${delay}m</span>` : '';
}

function isDelayTime(currentTime) {
    const time = currentTime.split(':').map(Number);
    const hour = time[0];
    const minute = time[1];
    
    // Convert to 24-hour format for comparison
    const totalMinutes = hour * 60 + minute;
    const delayStartMinutes = 15 * 60 + 30; // 3:30 PM = 15:30
    const delayEndMinutes = 18 * 60 + 20;   // 6:20 PM = 18:20
    
    return totalMinutes >= delayStartMinutes && totalMinutes <= delayEndMinutes;
}

function getDelayMinutes(station) {
    const delayMap = {
        'Dhaka University': 1,
        'Shahbag': 1,
        'Karwan Bazar': 2,
        'Farmgate': 2,
        'Bijoy Sarani': 2,
        'Agargoan': 3,
        'Sewrapara': 3,
        'Kazipara': 3,
        'Mirpur 10': 3,
        'Mirpur 11': 3,
        'Pallabi': 3,
        'Uttara South': 3,
        'Uttara Center': 3,
        'Uttara North': 3
    };
    return delayMap[station] || 0;
}

function addDelayInfo(platformElement, station, time) {
    if (!platformElement || !platformElement.querySelector('.train-times')) return;
    
    const times = platformElement.querySelectorAll('.train-times li');
    times.forEach(timeElement => {
        const trainTime = timeElement.textContent;
        if (isDelayTime(trainTime)) {
            const delayMinutes = getDelayMinutes(station);
            if (delayMinutes > 0) {
                const delaySpan = document.createElement('span');
                delaySpan.className = 'delay-info';
                delaySpan.textContent = ` (+${delayMinutes} min)`;
                timeElement.appendChild(delaySpan);
            }
        }
    });
}

function isWithinMorningPeakHours(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const peakStartMinutes = 8 * 60 + 30;  // 8:30 AM
    const peakEndMinutes = 10 * 60 + 30;   // 10:30 AM
    return totalMinutes >= peakStartMinutes && totalMinutes <= peakEndMinutes;
}

function getMorningDelay(station, direction) {
    if (direction !== "Motijheel") return 0;
    
    if (['Mirpur 11', 'Mirpur 10'].includes(station)) {
        return 1;
    } else if (['Karwan Bazar', 'Farmgate', 'Bijoy Sarani', 'Agargoan'].includes(station)) {
        return 2;
    } else if (['Shahbag', 'Dhaka University', 'Bangladesh Secretariat', 'Motijheel'].includes(station)) {
        return 3;
    }
    return 0;
}

function formatTimeWithDelay(time, stationName, direction) {
    if (!isDelayApplicable()) return time;

    if (direction === "Motijheel" && isWithinMorningPeakHours(time)) {
        const delay = getMorningDelay(stationName, direction);
        if (delay > 0) {
            return `${time} [+${delay}m]`;
        }
    }
    
    if (direction !== "Uttara North") return time; // Only apply to Platform 2 (Uttara North direction)
    
    const delay = applyDelays(time, stationName);
    if (delay > 0) {
        return `${time} [+${delay}m]`;
    }
    return time;
}
