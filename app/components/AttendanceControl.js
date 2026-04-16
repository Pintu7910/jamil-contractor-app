import React, { useState } from 'react';

export default function AttendanceControl({ onMarkAttendance, attendanceHistory }) {
  const [showHistory, setShowHistory] = useState(false);

  // Total din ginte hain calculation ke liye
  const totalDays = attendanceHistory ? attendanceHistory.length : 0;

  const styles = {
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '10px'
    },
    attendanceBtn: {
      padding: '20px',
      background: '#22c55e', // Dark Green
      color: '#fff',
      border: 'none',
      borderRadius: '20px',
      fontSize: '16px',
      fontWeight: '800',
      cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)',
      letterSpacing: '1px'
    },
    historyBtn: {
      padding: '15px',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#764ba2',
      border: 'none',
      borderRadius: '15px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    historyPanel: {
      background: '#fff',
      borderRadius: '20px',
      padding: '20px',
      maxHeight: '300px',
      overflowY: 'auto',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      border: '1px solid #f0f0f0'
    },
    statsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      paddingBottom: '10px',
      borderBottom: '2px solid #f0f0f0'
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. Bada Haziri Button */}
      <button 
        style={styles.attendanceBtn} 
        onClick={onMarkAttendance}
      >
        ✅ AAJ KI HAZIRI LAGAYEIN
      </button>

      {/* 2. Monthly History Button */}
      <button style={styles.historyBtn} onClick={() => setShowHistory(!showHistory)}>
        📅 {showHistory ? "CLOSE RECORD" : "📊 1 MONTH ATTENDANCE DEKHEIN"}
      </button>

      {/* 3. Record Panel with Wages Info */}
      {showHistory && (
        <div style={styles.historyPanel}>
          <div style={styles.statsRow}>
            <span style={{fontSize: '14px', fontWeight: 'bold', color: '#333'}}>Total Kaam:</span>
            <span style={{background: '#764ba2', color: '#fff', padding: '4px 12px', borderRadius: '10px', fontSize: '13px'}}>
              {totalDays} DIN
            </span>
          </div>

          {attendanceHistory && attendanceHistory.length > 0 ? (
            attendanceHistory.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '12px 0', 
                borderBottom: '1px solid #f9f9f9', 
                fontSize: '14px'
              }}>
                <span style={{color: '#666'}}>{entry.date}</span>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                   <span style={{fontSize:'11px', color:'#999'}}>{entry.time}</span>
                   <span style={{color: '#22c55e', fontWeight: '800'}}>PRESENT</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{fontSize: '13px', color: '#999', textAlign: 'center', padding: '20px'}}>
              Abhi tak koi haziri nahi lagi hai.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
