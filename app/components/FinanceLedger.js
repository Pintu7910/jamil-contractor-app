import React, { useState } from 'react';

export default function FinanceLedger({ worker }) {
  const [open, setOpen] = useState(null); 
  
  // Wages logic
  const dailyWage = worker?.dailyWage || 0; 
  const totalDays = worker?.approvedAttendance?.length || 0; 
  const totalEarning = dailyWage * totalDays; 
  
  const advance = worker?.totalAdvance || 0;
  const deducted = worker?.totalDeducted || 0;
  const pending = advance - deducted;

  const styles = {
    container: { width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
    title: { color: '#fff', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' },
    card: {
      background: '#fff',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      minHeight: '85px', 
      border: '1px solid #f0f0f0',
      transition: 'all 0.3s ease'
    },
    iconCircle: {
      width: '45px',
      height: '45px',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '20px',
      marginRight: '15px'
    },
    labelGroup: { flex: 1 },
    mainLabel: { fontSize: '16px', fontWeight: 'bold', color: '#333', display: 'block' },
    subLabel: { fontSize: '11px', color: '#888' },
    amount: { fontSize: '20px', fontWeight: '800' }
  };

  return (
    <div style={styles.container}>
      <p style={styles.title}>💰 AAPKA HISAB-KITAB</p>
      
      {/* 1. Wages Card (Naya Function) */}
      <div style={{...styles.card, borderLeft: '6px solid #3498db'}}>
        <div style={{...styles.iconCircle, background: '#ebf5fb', color: '#3498db'}}>🏗️</div>
        <div style={styles.labelGroup}>
          <span style={styles.mainLabel}>Kul Kamayi (Wages)</span>
          <span style={styles.subLabel}>₹{dailyWage}/day × {totalDays} Din</span>
        </div>
        <span style={{...styles.amount, color: '#3498db'}}>₹{totalEarning}</span>
      </div>

      {/* 2. Total Advance Card */}
      <div 
        style={{...styles.card, borderLeft: '6px solid #ef4444'}} 
        onClick={() => setOpen(open === 'adv' ? null : 'adv')}
      >
        <div style={{...styles.iconCircle, background: '#fee2e2', color: '#ef4444'}}>💵</div>
        <div style={styles.labelGroup}>
          <span style={styles.mainLabel}>Total Advance</span>
          <span style={styles.subLabel}>{open === 'adv' ? 'Hide details' : 'See dates'}</span>
        </div>
        <span style={{...styles.amount, color: '#ef4444'}}>₹{advance}</span>
      </div>
      {open === 'adv' && (
        <div style={{background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '15px', marginTop: '-10px', fontSize: '13px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'}}>
          {worker?.advanceHistory?.map((h, i) => (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee'}}>
              <span>{h.date}</span> <b>₹{h.amount}</b>
            </div>
          )) || <p style={{color:'#999', margin:0}}>No history found</p>}
        </div>
      )}

      {/* 3. Katwa Diya Card */}
      <div 
        style={{...styles.card, borderLeft: '6px solid #22c55e'}}
        onClick={() => setOpen(open === 'ded' ? null : 'ded')}
      >
        <div style={{...styles.iconCircle, background: '#dcfce7', color: '#22c55e'}}>✂️</div>
        <div style={styles.labelGroup}>
          <span style={styles.mainLabel}>Katwa Diya</span>
          <span style={styles.subLabel}>Deducted till now</span>
        </div>
        <span style={{...styles.amount, color: '#22c55e'}}>₹{deducted}</span>
      </div>
      {open === 'ded' && (
        <div style={{background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '15px', marginTop: '-10px', fontSize: '13px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'}}>
          {worker?.deductionHistory?.map((h, i) => (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee'}}>
              <span>{h.date}</span> <b>- ₹{h.amount}</b>
            </div>
          )) || <p style={{color:'#999', margin:0}}>No record</p>}
        </div>
      )}

      {/* 4. Bakaya (Pending) Card */}
      <div style={{...styles.card, background: '#1a1a1a', border: 'none'}}>
        <div style={{...styles.iconCircle, background: '#333', color: '#fff'}}>⏳</div>
        <div style={styles.labelGroup}>
          <span style={{...styles.mainLabel, color: '#fff'}}>Bakaya (Pending)</span>
          <span style={{...styles.subLabel, color: '#666'}}>Total balance to pay</span>
        </div>
        <span style={{...styles.amount, color: '#fff', fontSize: '24px'}}>₹{pending}</span>
      </div>
    </div>
  );
}
