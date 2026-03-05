import React, { useState, useEffect } from 'react';
import { createAuthenticatedApi } from '../utils/api.js';

const AvailabilityCalendar = ({ property, token }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState('available'); // available, unavailable, maintenance

  // Create authenticated API instance
  const api = createAuthenticatedApi(token);

  useEffect(() => {
    if (property && property._id) {
      fetchAvailability();
    }
  }, [property, currentDate]);

  const fetchAvailability = async () => {
    try {
      const response = await api.get(`/availability/properties/${property._id}/availability`, {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      });
      setAvailability(response.data.availability || {});
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  const updateAvailability = async (date, status) => {
    try {
      await api.post(`/availability/properties/${property._id}/availability`, {
        date,
        status
      });
      fetchAvailability();
      setShowBookingModal(false);
    } catch (err) {
      console.error('Failed to update availability:', err);
    }
  };

  const getDaysInMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  };

  const formatDate = (day) => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#10b981';
      case 'unavailable':
        return '#ef4444';
      case 'maintenance':
        return '#f59e0b';
      case 'booked':
        return '#3b82f6';
      default:
        return '#e5e7eb';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(day);
      const status = availability[dateStr] || 'available';
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day ${status} ${isToday ? 'today' : ''}`}
          style={{ backgroundColor: getStatusColor(status) }}
          onClick={() => {
            setSelectedDate(dateStr);
            setShowBookingModal(true);
          }}
        >
          <span className="day-number">{day}</span>
          {status !== 'available' && (
            <span className="status-indicator">{status.charAt(0).toUpperCase()}</span>
          )}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="card">
      <h3>Property Availability Calendar</h3>
      
      <div className="calendar-header">
        <button 
          className="btn btn-small btn-ghost" 
          onClick={() => changeMonth('prev')}
          style={{ pointerEvents: 'auto', zIndex: 10 }}
        >
          ←
        </button>
        <h4>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <button 
          className="btn btn-small btn-ghost" 
          onClick={() => changeMonth('next')}
          style={{ pointerEvents: 'auto', zIndex: 10 }}
        >
          →
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {renderCalendar()}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Maintenance</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
          <span>Booked</span>
        </div>
      </div>

      {showBookingModal && selectedDate && (
        <div className="modal" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Update Availability for {selectedDate}</h4>
            <div className="form-grid">
              <label>
                <input
                  type="radio"
                  name="status"
                  value="available"
                  checked={bookingType === 'available'}
                  onChange={(e) => setBookingType(e.target.value)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                />
                Available
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="unavailable"
                  checked={bookingType === 'unavailable'}
                  onChange={(e) => setBookingType(e.target.value)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                />
                Unavailable
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="maintenance"
                  checked={bookingType === 'maintenance'}
                  onChange={(e) => setBookingType(e.target.value)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                />
                Maintenance
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => updateAvailability(selectedDate, bookingType)}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                Update
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowBookingModal(false)}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .calendar-weekday {
          text-align: center;
          font-weight: 600;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .calendar-day {
          aspect-ratio: 1;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          min-height: 40px;
        }

        .calendar-day:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .calendar-day.empty {
          cursor: default;
          background: transparent !important;
        }

        .calendar-day.today {
          border: 2px solid #3b82f6;
        }

        .day-number {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .status-indicator {
          font-size: 0.6rem;
          font-weight: bold;
          color: white;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 2px;
          right: 2px;
        }

        .calendar-legend {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AvailabilityCalendar;
