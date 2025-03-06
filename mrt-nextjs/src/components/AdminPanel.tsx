'use client'

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeChange?: (newTime: Date | null) => void;
}

export default function AdminPanel({ isOpen, onClose, onTimeChange }: AdminPanelProps) {
  const handleUnlock = () => {
    const password = (document.getElementById('admin-password') as HTMLInputElement).value;
    const adminControls = document.getElementById('admin-controls');
    
    if (password === '12345678' && adminControls) {
      adminControls.style.display = 'block';
    } else {
      alert('Incorrect password');
    }
  };

  const handleSetTime = () => {
    const timeInput = document.getElementById('custom-time') as HTMLInputElement;
    const timeValue = timeInput.value;
    if (timeValue) {
      const [hours, minutes, seconds] = timeValue.split(':').map(Number);
      const newTime = new Date();
      newTime.setHours(hours, minutes, seconds || 0);
      onTimeChange?.(newTime);
      alert('Custom time set successfully');
    }
  };

  const handleResetTime = () => {
    onTimeChange?.(null);
    alert('Time reset to system time');
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal" style={{ display: 'flex' }}>
      <div className="admin-panel">
        <div className="admin-header">
          <h3>Admin Panel</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="admin-section">
          <label htmlFor="admin-password">Password:</label>
          <input 
            type="password" 
            id="admin-password" 
            className="admin-input" 
            onKeyUp={(e) => e.key === 'Enter' && handleUnlock()}
          />
          <button className="admin-button" onClick={handleUnlock}>Unlock</button>
        </div>
        <div id="admin-controls" className="admin-controls">
          <label htmlFor="custom-time">Set Time:</label>
          <input 
            type="time" 
            id="custom-time" 
            className="admin-input" 
            step="1" 
            placeholder="HH:MM:SS (24hr)" 
          />
          <button className="admin-button" onClick={handleSetTime}>Set Custom Time</button>
          <button className="admin-button" onClick={handleResetTime}>Reset</button>
        </div>
      </div>
    </div>
  );
}