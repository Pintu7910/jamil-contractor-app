"use client";

export default function FinanceLedger({ worker }) {
  if (!worker) return null;

  // 1. Kul Kamayi Calculation: Approved attendance count * Daily Wage
  const approvedAttendance = worker.approvedAttendance?.filter(a => a.status === 'Approved' || a.status === 'Present') || [];
  const totalEarned = approvedAttendance.length * (worker.dailyWage || 0);

  // 2. Bakaya (Pending) Calculation: Total Earned - Jo Paisa Diya Gaya
  const totalPaid = worker.totalPaidEarnings || 0;
  const bakiBalance = totalEarned - totalPaid;

  return (
    <div style={styles.ledgerContainer}>
      <h3 style={styles.title}>💰 AAPKA HISAB-KITAB</h3>

      <div style={styles.statsGrid}>
        {/* Kul Kamayi Box */}
        <div style={styles.glassBox}>
          <div style={styles.iconCircle}>🏗️</div>
          <div style={styles.textData}>
            <p style={styles.label}>Kul Kamayi (Wages)</p>
            <h2 style={styles.value}>₹{totalEarned}</h2>
            <small style={styles.subtext}>₹{worker.dailyWage}/day × {approvedAttendance.length} Din</small>
          </div>
        </div>

        {/* Bakaya (Pending) Box */}
        <div style={{...styles.glassBox, borderLeft: '4px solid #f1c40f'}}>
          <div style={{...styles.iconCircle, background: 'rgba(241, 196, 15, 0.2)'}}>⏳</div>
          <div style={styles.textData}>
            <p style={styles.label}>Bakaya (Pending)</p>
            <h2 style={{...styles.value, color: '#f1c40f'}}>₹{bakiBalance}</h2>
            <p style={styles.subtext}>Total balance to pay</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  ledgerContainer: {
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: '14px',
    letterSpacing: '1px',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  glassBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  iconCircle: {
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  textData: {
    flex: 1
  },
  label: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)'
  },
  value: {
    margin: '2px 0',
    fontSize: '22px',
    color: '#fff',
    fontWeight: 'bold'
  },
  subtext: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
    display: 'block'
  }
};
