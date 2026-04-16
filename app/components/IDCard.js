import React from 'react';

export default function IDCard({ worker }) {
  const styles = {
    cardContainer: {
      background: '#fff',
      borderRadius: '25px',
      width: '100%', // Poori width lega
      margin: '10px 0',
      overflow: 'hidden',
      boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
      fontFamily: 'sans-serif',
    },
    header: {
      background: 'linear-gradient(90deg, #764ba2, #667eea)',
      color: '#fff',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    profileImg: {
      width: '110px',
      height: '110px',
      borderRadius: '50%',
      border: '4px solid #fff',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      objectFit: 'cover'
    },
    details: {
      padding: '20px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.cardContainer}>
      <div style={styles.header}>
        <span style={{fontWeight:'bold'}}>JC</span>
        <div style={{textAlign: 'right'}}>
          <h4 style={{ margin: 0, fontSize: '14px' }}>JAMIL CONTRACTOR</h4>
          <p style={{ margin: 0, fontSize: '9px', opacity: 0.8 }}>WORKER ID CARD</p>
        </div>
      </div>
      <div style={styles.details}>
        <img 
          src={worker?.photo || "https://img.icons8.com/bubbles/100/000000/user.png"} 
          alt="Worker" 
          style={styles.profileImg} 
        />
        <h2 style={{margin: '10px 0 0 0', fontSize: '20px'}}>{worker?.name || "SADIYA TEST WORKER"}</h2>
        <p style={{margin: '2px 0', color: '#666', fontSize: '13px'}}>ID NO: {worker?.id || "1234"}</p>
        <span style={{
          background: worker?.status === 'Online' ? '#27ae60' : '#d63031',
          color: '#fff', padding: '4px 15px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold'
        }}>
          {worker?.status || "Online"}
        </span>
      </div>
    </div>
  );
}
