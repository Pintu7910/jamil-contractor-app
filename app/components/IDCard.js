import React from 'react';

export default function IDCard({ worker }) {
  const styles = {
    card: {
      background: '#fff',
      borderRadius: '20px',
      width: '100%',
      marginBottom: '10px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    header: {
      background: '#764ba2',
      color: '#fff',
      padding: '10px 15px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    body: { padding: '20px', textAlign: 'center' },
    img: { width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #f0f0f0' }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span>JC - OFFICIAL</span>
        <span>ID: {worker?.id || '1234'}</span>
      </div>
      <div style={styles.body}>
        <img src={worker?.photo || "https://img.icons8.com/bubbles/100/000000/user.png"} style={styles.img} alt="worker" />
        <h2 style={{margin: '10px 0 0', fontSize: '18px', color: '#333'}}>{worker?.name || "Sadiya Test Worker"}</h2>
        <div style={{color: '#27ae60', fontSize: '12px', fontWeight: 'bold', marginTop: '5px'}}>● ONLINE</div>
      </div>
    </div>
  );
}
