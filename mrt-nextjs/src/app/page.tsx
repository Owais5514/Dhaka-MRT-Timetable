'use client'

import { useState, useEffect, useCallback } from 'react'
import TopMenu from '@/components/TopMenu'
import StationSelect from '@/components/StationSelect'
import AdminPanel from '@/components/AdminPanel'

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [selectedStation, setSelectedStation] = useState('')
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [customTimeOffset, setCustomTimeOffset] = useState<number | null>(null)

  const toggleAdminPanel = () => {
    setIsAdminOpen(!isAdminOpen)
  }

  const handleTimeChange = useCallback((newTime: Date | null) => {
    if (newTime === null) {
      setCustomTimeOffset(null)
    } else {
      const now = new Date()
      setCustomTimeOffset(newTime.getTime() - now.getTime())
    }
  }, [])

  useEffect(() => {
    const adminBtn = document.getElementById('admin-btn')
    if (adminBtn) {
      adminBtn.addEventListener('click', (e) => {
        e.preventDefault()
        toggleAdminPanel()
      })
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      if (customTimeOffset !== null) {
        const customTime = new Date(now.getTime() + customTimeOffset)
        setCurrentTime(customTime)
      } else {
        setCurrentTime(now)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [customTimeOffset])

  useEffect(() => {
    const fetchSchedule = async () => {
      const day = currentTime.getDay()
      let fileName
      if (day === 5) {
        fileName = '/data/mrt-6-fri.json'
      } else if (day === 6) {
        fileName = '/data/mrt-6-sat.json'
      } else {
        fileName = '/data/mrt-6.json'
      }
      try {
        const response = await fetch(fileName)
        const data = await response.json()
        setScheduleData(data)
      } catch (error) {
        console.error('Error loading schedule:', error)
      }
    }
    fetchSchedule()
  }, [currentTime.getDay()])

  const handleStationSelect = (station: string) => {
    setSelectedStation(station)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const findNextTrains = () => {
    if (!scheduleData || !selectedStation) return null

    const currentTimeStr = formatTime(currentTime)
    const station = scheduleData[selectedStation]

    if (!station) return null

    const nextTrainsToMotijheel = station["Motijheel"]
      .filter((time: string) => time > currentTimeStr)
      .slice(0, 3)

    const nextTrainsToUttara = station["Uttara North"]
      .filter((time: string) => time > currentTimeStr)
      .slice(0, 3)

    return { nextTrainsToMotijheel, nextTrainsToUttara }
  }

  const nextTrains = findNextTrains()

  return (
    <main className="container">
      <TopMenu />
      <div className="clock">
        {formatTime(currentTime)}
      </div>
      <h1>Dhaka MRT-6</h1>
      
      <label htmlFor="station-dropdown">Select Your Current Station:</label>
      <StationSelect onStationSelect={handleStationSelect} />

      <div className="platform-info-container">
        <div className="platform">
          <h3>Platform 1</h3>
          <p className="direction-text">To Motijheel</p>
          <ul className="train-times">
            {nextTrains?.nextTrainsToMotijheel.map((time: string, index: number) => (
              <li key={time} className="fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                {time}
              </li>
            ))}
          </ul>
        </div>
        <div className="platform">
          <h3>Platform 2</h3>
          <p className="direction-text">To Uttara North</p>
          <ul className="train-times">
            {nextTrains?.nextTrainsToUttara.map((time: string, index: number) => (
              <li key={time} className="fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                {time}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer">
        <p>Made by <a href="https://github.com/Owais5514" target="_blank" rel="noopener noreferrer">Owais5514</a></p>
      </div>
      
      <div className="disclaimer">
        <h3 className="disclaimer-title">Disclaimer</h3>
        <div className="disclaimer-content">
          <p>This is an unofficial time schedule of Dhaka MRT-6. The times do not reflect actual train times provided by DMTCL, rather this is made using the schedule provided on the official website. Delays will not be reflected on this page.</p>
        </div>
      </div>

      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onTimeChange={handleTimeChange}
      />
    </main>
  )
}
