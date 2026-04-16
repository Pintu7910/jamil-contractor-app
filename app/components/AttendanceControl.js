import React, { useState } from 'react';

export default function AttendanceControl({ onMarkAttendance, attendanceHistory }) {
  const [showHistory, setShowHistory] = useState(false);

  const styles = {
    container: {
      width: '100%',
      maxWidth: '360px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    attendanceBtn: {
      padding: '18px',
      background: '#22c55e',
      color: '#fff',
      border: 'none',
      borderRadius: '15px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 5px 15px rgba(34, 197, 94, 0.3)',
      transition: 'transform 0.2s'
    },
    historyBtn: {
      padding: '15px',
      background: '#fff',
      color: '#764ba2',
      border: '2px solid #764ba2',
      borderRadius: '15px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    historyPanel: {
      background: '#fff',
      borderRadius: '15px',
      padding: '15px',
      maxHeight: '250px',
      overflowY: 'auto',
      boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. Direct Attendance Button (No Image) */}
      <button 
        style={styles.attendanceBtn} 
        onClick={onMarkAttendance}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        ✅ AAJ KI HAZIRI LAGAYEIN
      </button>

      {/* 2. Monthly Attendance Toggle Button */}
      <button style={styles.historyBtn} onClick={() => setShowHistory(!showHistory)}>
        📅 {showHistory ? "CLOSE HISTORY" : "1 MONTH ATTENDANCE DEKHEIN"}
      </button>

      {/* 3. Sliding History Panel */}
      {showHistory && (
        <div style={styles.historyPanel}>
          <h4 style={{marginTop: 0, fontSize: '14px', color: '#555'}}>Haziri Record (Last 30 Days)</h4>
          {attendanceHistory && attendanceHistory.length > 0 ? (
            attendanceHistory.map((entry, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '13px'}}>
                <span>{entry.date}</span>
                <span style={{color: '#22c55e', fontWeight: 'bold'}}>P</span>
              </div>
            ))
          ) : (
            <p style={{fontSize: '12px', color: '#999'}}>Nahi mili koi history.</p>
          )}
        </div>
      )}
    </div>
  );
}
