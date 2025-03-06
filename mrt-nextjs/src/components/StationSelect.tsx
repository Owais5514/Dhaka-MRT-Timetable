'use client'

import { useState, useEffect } from 'react'

const stationOrder = [
  "Uttara North", "Uttara Center", "Uttara South", "Pallabi", "Mirpur 11", 
  "Mirpur 10", "Kazipara", "Sewrapara", "Agargoan", "Bijoy Sarani", 
  "Farmgate", "Karwan Bazar", "Shahbag", "Dhaka University", 
  "Bangladesh Secretariat", "Motijheel"
]

interface StationSelectProps {
  onStationSelect: (station: string) => void
}

export default function StationSelect({ onStationSelect }: StationSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStation, setSelectedStation] = useState('Select a station')

  const handleStationClick = (station: string) => {
    setSelectedStation(station)
    setIsOpen(false)
    onStationSelect(station)
  }

  return (
    <div className="custom-dropdown-container">
      <div className="custom-dropdown-wrapper">
        <div className={`custom-dropdown ${isOpen ? 'active' : ''}`}>
          <div 
            className="selected-option" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{selectedStation}</span>
            <i className="dropdown-arrow">▼</i>
          </div>
          {isOpen && (
            <div className="dropdown-options">
              <div className="station-columns">
                {stationOrder.map((station) => (
                  <div
                    key={station}
                    className={`station-option ${selectedStation === station ? 'selected' : ''}`}
                    onClick={() => handleStationClick(station)}
                  >
                    {station}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}