import React from 'react';

export default function IDCard({ worker }) {
  const styles = {
    cardContainer: {
      background: '#fff',
      borderRadius: '25px',
      width: '100%',
      maxWidth: '360px',
      margin: '20px auto',
      overflow: 'hidden',
      boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
      fontFamily: '"Segoe UI", sans-serif',
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
    logoCircle: {
      background: '#fff',
      color: '#764ba2',
      width: '35px',
      height: '35px',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold'
    },
    imageWrapper: {
      marginTop: '25px',
      display: 'flex',
      justifyContent: 'center'
    },
    profileImg: {
      width: '130px',
      height: '130px',
      borderRadius: '50%',
      border: '5px solid #fff',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      objectFit: 'cover'
    },
    detailsSection: {
      padding: '20px',
      textAlign: 'center'
    },
    statusBadge: {
      padding: '6px 20px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: worker?.status === 'Online' ? '#27ae60' : '#d63031',
      display: 'inline-block',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.cardContainer}>
      <div style={styles.header}>
        <div style={styles.logoCircle}>JC</div>
        <div style={{textAlign: 'right'}}>
          <h4 style={{ margin: 0, fontSize: '15px' }}>JAMIL CONTRACTOR</h4>
          <p style={{ margin: 0, fontSize: '10px', opacity: 0.9 }}>WORKER ID CARD</p>
        </div>
      </div>

      <div style={styles.imageWrapper}>
        {/* Yeh photo Admin Panel se database mein save honi chahiye */}
        <img 
          src={worker?.photo || "https://img.icons8.com/bubbles/100/000000/user.png"} 
          alt="Worker Profile" 
          style={styles.profileImg} 
        />
      </div>

      <div style={styles.detailsSection}>
        <h2 style={{margin: '0', fontSize: '24px', textTransform: 'uppercase'}}>{worker?.name || "MD JAMIL ANSARI"}</h2>
        <p style={{margin: '5px 0', color: '#636e72'}}>ID NO: {worker?.id || "----"}</p>
        <span style={styles.statusBadge}>{worker?.status || "OFFLINE"}</span>
      </div>
      <div style={{ height: '10px', background: 'linear-gradient(90deg, #667eea, #764ba2)' }}></div>
    </div>
  );
}
