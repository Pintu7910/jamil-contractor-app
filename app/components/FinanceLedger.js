import React from 'react';

/**
 * FinanceLedger Component: Worker ke saare hisab-kitab ko dikhane ke liye.
 * Isme Advance, Kataya, aur Baki (Pending) amount ka folder logic hai.
 */
export default function FinanceLedger({ worker }) {
  // Calculations for the ledger
  const totalAdvance = worker?.totalAdvance || 0;
  const totalDeducted = worker?.totalDeducted || 0;
  const bakiAmount = totalAdvance - totalDeducted;
  
  // Progress bar percentage (kitna advance pay ho chuka hai)
  const progress = totalAdvance > 0 ? (totalDeducted / totalAdvance) * 100 : 0;

  const styles = {
    container: {
      background: '#fff',
      borderRadius: '20px',
      padding: '20px',
      width: '100%',
      maxWidth: '360px',
      margin: '15px auto',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif'
    },
    title: {
      fontSize: '14px',
      color: '#764ba2',
      fontWeight: 'bold',
      borderBottom: '1px solid #eee',
      paddingBottom: '10px',
      marginBottom: '15px',
      textTransform: 'uppercase'
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      fontSize: '15px'
    },
    label: {
      color: '#555'
    },
    value: {
      fontWeight: 'bold',
      color: '#333'
    },
    bakiRow: {
      marginTop: '10px',
      paddingTop: '10px',
      borderTop: '2px dashed #eee',
      fontSize: '17px',
      color: '#764ba2'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: '#f0f0f0',
      borderRadius: '10px',
      marginTop: '15px',
      overflow: 'hidden'
    },
    progressFill: {
      width: `${progress}%`,
      height: '100%',
      background: 'linear-gradient(90deg, #764ba2, #667eea)',
      transition: 'width 0.5s ease'
    },
    footerNote: {
      fontSize: '10px',
      color: '#aaa',
      textAlign: 'center',
      marginTop: '15px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.title}>Aapka Hisab (Payment Ledger)</div>

      {/* Row: Total Advance */}
      <div style={styles.row}>
        <span style={styles.label}>Total Advance Liya:</span>
        <span style={{ ...styles.value, color: '#ef4444' }}>₹{totalAdvance}</span>
      </div>

      {/* Row: Kitna Katwa Diya */}
      <div style={styles.row}>
        <span style={styles.label}>Kitna Katwa Diya:</span>
        <span style={{ ...styles.value, color: '#22c55e' }}>₹{totalDeducted}</span>
      </div>

      {/* Row: Baki (Pending) */}
      <div style={{ ...styles.row, ...styles.bakiRow }}>
        <span style={{ fontWeight: 'bold' }}>Bakaya (Pending):</span>
        <span style={{ fontWeight: 'bold' }}>₹{bakiAmount}</span>
      </div>

      {/* Advance Paid Progress Bar */}
      <div style={styles.progressBar}>
        <div style={styles.progressFill}></div>
      </div>
      <p style={{ fontSize: '11px', textAlign: 'center', marginTop: '5px', color: '#888' }}>
        {progress.toFixed(0)}% Advance Paid
      </p>

      {/* Footer */}
      <p style={styles.footerNote}>System Automatic Track Kar Raha Hai</p>
    </div>
  );
}
