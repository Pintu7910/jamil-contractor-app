import React from 'react';

/**
 * IDCard Component: Ek asli physical worker badge jaisa look dene ke liye update kiya gaya hai.
 * Iski unchai (height) badhayi gayi hai taaki ye authentic dikhe.
 */
export default function IDCard({ worker }) {
  // Styles for the high-quality professional ID Card badge
  const styles = {
    cardContainer: {
      background: '#fff',
      borderRadius: '25px', // More rounded like a laminated card
      width: '100%',
      maxWidth: '360px',
      height: '480px', // Unchai badha di gayi hai asli card jaisa feel dene ke liye
      margin: '20px auto',
      overflow: 'hidden',
      boxShadow: '0 15px 35px rgba(0,0,0,0.2)', // Deeper shadow for depth
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      border: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative', // For watermark
    },
    // Top punch hole
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
      background: 'linear-gradient(135deg, #764ba2, #667eea)', // Deeper gradient
      color: '#fff',
      padding: '25px 20px 15px 20px', // Spacing for punch hole
      textAlign: 'center',
      borderBottom: '5px solid #ffca28', // Yellow gold bottom accent
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
      width: '150px', // Badi image asli card ke liye
      height: '150px',
      borderRadius: '50%',
      border: '6px solid #fff',
      boxShadow: '0 8px 15px rgba(0,0,0,0.15)',
      objectFit: 'cover',
      backgroundColor: '#f8f8f8'
    },
    detailsSection: {
      flex: 1, // Card ke beech ki baki jagah lega
      padding: '30px 20px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    workerName: {
      margin: '0',
      fontSize: '26px', // Bada font name ke liye
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
      margin: '0',
      color: '#764ba2', // Match theme color
      fontSize: '18px',
      fontWeight: '700'
    },
    statusContainer: {
      marginTop: '20px'
    },
    statusBadge: {
      padding: '8px 25px',
      borderRadius: '50px', // Fully rounded badge
      fontSize: '14px',
      fontWeight: '700',
      color: '#fff',
      textTransform: 'uppercase',
      backgroundColor: worker?.status === 'Online' ? '#27ae60' : '#d63031', // Green if Online, Red if Offline
      letterSpacing: '0.5px'
    },
    watermark: {
      position: 'absolute',
      bottom: '50px',
      left: '-20px',
      fontSize: '90px',
      fontWeight: 'bold',
      color: 'rgba(118, 75, 162, 0.03)', // Very faint theme color
      transform: 'rotate(-20deg)',
      zIndex: 0,
      pointerEvents: 'none'
    },
    footerLine: {
      height: '15px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
    }
  };

  return (
    <div style={styles.cardContainer}>
      {/* 📍 Physical Card Punch Hole */}
      <div style={styles.punchHole}></div>
      
      {/* 💼 Header Section */}
      <div style={styles.header}>
        <div style={styles.logoSection}>
          <h2 style={styles.logoText}>JAMIL CONTRACTOR</h2>
          <p style={styles.headerSubText}>AUTHORIZED WORKER ID BADGE</p>
        </div>
      </div>

      {/* 📸 Profile Image */}
      <div style={styles.imageSection}>
        <img 
          src={worker?.photo || "https://via.placeholder.com/150"} // Default placeholder image if no photo
          alt="Worker Profile" 
          style={styles.profileImg} 
        />
      </div>

      {/* 🪪 Worker Details */}
      <div style={styles.detailsSection}>
        <div>
          <h2 style={styles.workerName}>{worker?.name || "MD JAMIL ANSARI"}</h2>
          <div style={styles.idLabel}>Unique ID</div>
          <p style={styles.workerId}>JC/W/{worker?.id || "----"}</p>
        </div>
        
        {/* 🟢 Live Status Indicator */}
        <div style={styles.statusContainer}>
          <span style={styles.statusBadge}>
            {worker?.status || "Offline"}
          </span>
        </div>
      </div>

      {/* 🎨 Watermark Design Element */}
      <div style={styles.watermark}>JC</div>

      {/* 🎨 Bottom Accent Line */}
      <div style={styles.footerLine}></div>
    </div>
  );
}
