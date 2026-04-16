import React from 'react';

/**
 * IDCard Component: Updated with "Mark Attendance" button functionality.
 */
export default function IDCard({ worker, onMark }) { // onMark prop add kiya gaya hai
  const styles = {
    cardContainer: {
      background: '#fff',
      borderRadius: '25px',
      width: '100%',
      maxWidth: '360px',
      height: 'auto', // Content ke hisaab se adjust hoga taaki button fit aaye
      margin: '20px auto',
      overflow: 'hidden',
      boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      border: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingBottom: '20px' // Bottom padding for look
    },
    punchHole: {
      width: '40px',
      height: '8px',
      background: '#e0e0e0',
      borderRadius: '20px',
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2,
    },
    header: {
      background: 'linear-gradient(135deg, #764ba2, #667eea)',
      color: '#fff',
      padding: '25px 20px 15px 20px',
      textAlign: 'center',
      borderBottom: '5px solid #ffca28',
    },
    logoSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px'
    },
    logoText: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '800',
      letterSpacing: '1px',
      textTransform: 'uppercase'
    },
    headerSubText: {
      margin: 0,
      fontSize: '10px',
      opacity: 0.9,
      letterSpacing: '0.5px'
    },
    imageSection: {
      marginTop: '30px',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative'
    },
    profileImg: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      border: '6px solid #fff',
      boxShadow: '0 8px 15px rgba(0,0,0,0.15)',
      objectFit: 'cover',
      backgroundColor: '#f8f8f8'
    },
    detailsSection: {
      padding: '20px 20px',
      textAlign: 'center',
    },
    workerName: {
      margin: '0',
      fontSize: '26px',
      color: '#2d3436',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    idLabel: {
      fontSize: '11px',
      color: '#888',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginTop: '10px'
    },
    workerId: {
      margin: '0 0 15px 0',
      color: '#764ba2',
      fontSize: '18px',
      fontWeight: '700'
    },
    statusBadge: {
      padding: '8px 25px',
      borderRadius: '50px',
      fontSize: '14px',
      fontWeight: '700',
      color: '#fff',
      textTransform: 'uppercase',
      backgroundColor: worker?.status === 'Online' ? '#27ae60' : '#d63031',
      letterSpacing: '0.5px',
      display: 'inline-block',
      marginBottom: '20px'
    },
    // ✅ Naya Button Style
    attendanceBtn: {
      width: '90%',
      margin: '10px auto',
      padding: '12px',
      borderRadius: '12px',
      border: 'none',
      background: '#2ecc71',
      color: '#fff',
      fontSize: '15px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: '0.3s'
    },
    watermark: {
      position: 'absolute',
      bottom: '80px',
      left: '-10px',
      fontSize: '80px',
      fontWeight: 'bold',
      color: 'rgba(118, 75, 162, 0.03)',
      transform: 'rotate(-20deg)',
      zIndex: 0,
      pointerEvents: 'none'
    }
  };

  return (
    <div style={styles.cardContainer}>
      <div style={styles.punchHole}></div>
      
      <div style={styles.header}>
        <div style={styles.logoSection}>
          <h2 style={styles.logoText}>JAMIL CONTRACTOR</h2>
          <p style={styles.headerSubText}>AUTHORIZED WORKER ID BADGE</p>
        </div>
      </div>

      <div style={styles.imageSection}>
        <img 
          src={worker?.photo || "https://via.placeholder.com/150"} 
          alt="Worker Profile" 
          style={styles.profileImg} 
        />
      </div>

      <div style={styles.detailsSection}>
        <h2 style={styles.workerName}>{worker?.name || "MD JAMIL ANSARI"}</h2>
        <div style={styles.idLabel}>Unique ID</div>
        <p style={styles.workerId}>JC/W/{worker?.id || "----"}</p>
        
        <span style={styles.statusBadge}>
          {worker?.status || "Offline"}
        </span>

        {/* ✅ Attendance Button Jo Ab Kaam Karega */}
        <button onClick={onMark} style={styles.attendanceBtn}>
          ✅ AAJ KI HAZIRI LAGAYEIN
        </button>
      </div>

      <div style={styles.watermark}>JC</div>
    </div>
  );
}
