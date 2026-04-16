import React, { useState } from 'react';

export default function FinanceLedger({ worker }) {
  // States to toggle history lists
  const [showAdvanceList, setShowAdvanceList] = useState(false);
  const [showDeductionList, setShowDeductionList] = useState(false);
  
  const advance = worker?.totalAdvance || 0;
  const deducted = worker?.totalDeducted || 0;
  const pending = advance - deducted;
  
  // Data arrays from Firebase
  const advanceHistory = worker?.advanceHistory || [];
  const deductionHistory = worker?.deductionHistory || [];

  const styles = {
    container: { width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', margin: '15px 0' },
    infoButton: {
      background: '#fff',
      borderRadius: '15px',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: '1px solid #eee',
      cursor: 'pointer',
      width: '100%'
    },
    historyPanel: {
      background: '#f9f9f9',
      borderRadius: '12px',
      padding: '12px',
      marginTop: '-8px',
      borderLeft: '4px solid #764ba2',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
    },
    label: { fontSize: '14px', color: '#555', fontWeight: '500' },
    value: { fontSize: '18px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <h4 style={{color: '#fff', margin: '0 5px', fontSize: '14px', opacity: 0.9}}>AAPKA HISAB (PAYMENT LEDGER)</h4>
      
      {/* 1. TOTAL ADVANCE SECTION */}
      <div 
        style={{...styles.infoButton, border: showAdvanceList ? '2px solid #ef4444' : '1px solid #eee'}} 
        onClick={() => { setShowAdvanceList(!showAdvanceList); setShowDeductionList(false); }}
      >
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={styles.label}>💰 Total Advance Liya:</span>
          <span style={{fontSize:'10px', color:'#ef4444'}}>{showAdvanceList ? '▲' : '▼ View'}</span>
        </div>
        <span style={{...styles.value, color: '#ef4444'}}>₹{advance}</span>
      </div>

      {showAdvanceList && (
        <div style={styles.historyPanel}>
          <p style={{margin:'0 0 8px 0', fontSize:'11px', fontWeight:'bold', color:'#ef4444'}}>ADVANCE LENE KA RECORD:</p>
          {advanceHistory.length > 0 ? (
            advanceHistory.map((item, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #eee', fontSize:'13px'}}>
                <span>{item.date}</span>
                <span style={{fontWeight:'600'}}>+ ₹{item.amount}</span>
              </div>
            ))
          ) : <p style={{fontSize:'12px', color:'#999'}}>Koi record nahi hai.</p>}
        </div>
      )}

      {/* 2. KATWA DIYA SECTION */}
      <div 
        style={{...styles.infoButton, border: showDeductionList ? '2px solid #22c55e' : '1px solid #eee'}} 
        onClick={() => { setShowDeductionList(!showDeductionList); setShowAdvanceList(false); }}
      >
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={styles.label}>✅ Kitna Katwa Diya:</span>
          <span style={{fontSize:'10px', color:'#22c55e'}}>{showDeductionList ? '▲' : '▼ View'}</span>
        </div>
        <span style={{...styles.value, color: '#22c55e'}}>₹{deducted}</span>
      </div>

      {showDeductionList && (
        <div style={{...styles.historyPanel, borderLeftColor: '#22c55e'}}>
          <p style={{margin:'0 0 8px 0', fontSize:'11px', fontWeight:'bold', color:'#22c55e'}}>PAISA KATNE KA RECORD:</p>
          {deductionHistory.length > 0 ? (
            deductionHistory.map((item, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #eee', fontSize:'13px'}}>
                <span>{item.date}</span>
                <span style={{fontWeight:'600', color:'#22c55e'}}>- ₹{item.amount}</span>
              </div>
            ))
          ) : <p style={{fontSize:'12px', color:'#999'}}>Abhi tak kuch nahi kata.</p>}
        </div>
      )}

      {/* 3. BAKAYA (PENDING) - NO CLICK */}
      <div style={{...styles.infoButton, background: '#333', border: 'none'}}>
        <span style={{...styles.label, color: '#fff', fontWeight: 'bold'}}>⏳ Bakaya (Pending):</span>
        <span style={{...styles.value, color: '#fff', fontSize: '22px'}}>₹{pending}</span>
      </div>
    </div>
  );
}
