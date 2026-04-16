import React from 'react';

/**
 * IDCard Component: Worker ki profile aur digital pehchan dikhane ke liye.
 * Isme Worker ki Photo, Name, ID aur Live Status shamil hai.
 */
export default function IDCard({ worker }) {
  // Styles for the professional ID Card look
  const styles = {
    cardContainer: {
      background: '#fff',
      borderRadius: '25px',
      width: '100%',
      maxWidth: '360px',
      margin: '20px auto',
      overflow: 'hidden',
      boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      border: '1px solid #eee'
    },
    header: {
      background: 'linear-gradient(90deg, #764ba2, #667eea)',
      color: '#fff',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    logoCircle: {
      background: '#fff',
      color: '#764ba2',
      width: '35px',
      height: '35px',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    headerText: {
      textAlign: 'right'
    },
    imageWrapper: {
      marginTop: '25px',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative'
    },
    // Worker image folder logic ke liye
    profileImg: {
      width: '130px',
      height: '130px',
      borderRadius: '50%',
      border: '5px solid #fff',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      objectFit: 'cover',
      backgroundColor: '#f0f0f0'
    },
    detailsSection: {
      padding: '20px',
      textAlign: 'center'
    },
    workerName: {
      margin: '10px 0 5px 0',
      fontSize: '24px',
      color: '#2d3436',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    workerId: {
      margin: '0',
      color: '#636e72',
      fontSize: '15px',
      fontWeight: '600'
    },
    statusContainer: {
      marginTop: '15px'
    },
    // Live status indicator
    statusBadge: {
      padding: '6px 20px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#fff',
      textTransform: 'uppercase',
      backgroundColor: worker?.status === 'Online' ? '#27ae60' : '#d63031'
    },
    footerLine: {
      height: '10px',
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.cardContainer}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logoCircle}>JC</div>
        </div>
        <div style={styles.headerText}>
          <h4 style={{ margin: 0, fontSize: '15px', letterSpacing: '0.5px' }}>JAMIL CONTRACTOR</h4>
          <p style={{ margin: 0, fontSize: '10px', opacity: 0.9 }}>DIGITAL WORKER ID</p>
        </div>
      </div>

      {/* Profile Image Section */}
      <div style={styles.imageWrapper}>
        <img 
          src={worker?.photo || "https://img.icons8.com/bubbles/100/000000/user.png"} 
          alt="Worker Profile" 
          style={styles.profileImg} 
        />
      </div>

      {/* Info Section */}
      <div style={styles.detailsSection}>
        <h2 style={styles.workerName}>{worker?.name || "MD JAMIL ANSARI"}</h2>
        <p style={styles.workerId}>ID NO: {worker?.id || "----"}</p>
        
        {/* Status Indicator */}
        <div style={styles.statusContainer}>
          <span style={styles.statusBadge}>
            {worker?.status || "OFFLINE"}
          </span>
        </div>
      </div>

      <div style={styles.footerLine}></div>
    </div>
  );
}
