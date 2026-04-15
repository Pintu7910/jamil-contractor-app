"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("workerID");
    if (!id) { window.location.href = "/"; return; }

    // Real-time listener taaki agar Admin (Jamil Bhai) hisab badlein toh turant dikhe
    const unsub = onSnapshot(doc(db, "workers", id), (docSnap) => {
      if (docSnap.exists()) {
        setWorker({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div style={styles.loader}>Loading ID Card...</div>;

  // Calculation Logic
  const totalAdvance = worker?.totalAdvance || 0;
  const totalDeducted = worker?.totalDeducted || 0;
  const balancePending = totalAdvance - totalDeducted;

  return (
    <div style={styles.container}>
      {/* 🪪 DIGITAL ID CARD SECTION */}
      <div style={styles.idCard}>
        <div style={styles.cardHeader}>
          <div style={styles.logoCircle}>JC</div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={styles.contractorName}>JAMIL CONTRACTOR</h3>
            <p style={styles.cardSub}>WORKER ID CARD</p>
          </div>
        </div>

        <div style={styles.photoBox}>
          <img 
            src={worker?.lastPhoto || worker?.attendanceHistory?.[0]?.photo || "https://via.placeholder.com/150"} 
            style={styles.workerImg} 
            alt="Worker" 
          />
        </div>

        <div style={styles.workerDetails}>
          <h2 style={styles.nameText}>{worker?.name || "Worker Name"}</h2>
          <p style={styles.idText}>ID NO: <strong>{worker?.id}</strong></p>
          <div style={{
            ...styles.statusBadge, 
            background: worker?.currentStatus?.includes("WORKING") ? "#22c55e" : "#ef4444"
          }}>
            {worker?.currentStatus || "OFFLINE"}
          </div>
        </div>

        {/* 💰 FINANCE/ADVANCE SECTION */}
        <div style={styles.financeBox}>
          <h4 style={styles.financeTitle}>AAPKA HISAB (PAYMENT LEDGER)</h4>
          
          <div style={styles.ledgerTable}>
            <div style={styles.ledgerRow}>
              <span>Total Advance Liya:</span>
              <span style={{color: '#ef4444'}}>₹{totalAdvance}</span>
            </div>
            <div style={styles.ledgerRow}>
              <span>Kitna Katwa Diya:</span>
              <span style={{color: '#22c55e'}}>₹{totalDeducted}</span>
            </div>
            <div style={{...styles.ledgerRow, borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px'}}>
              <strong>Bakaya (Pending):</strong>
              <strong style={{color: '#764ba2'}}>₹{balancePending}</strong>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={{
              ...styles.progressFill, 
              width: `${Math.min((totalDeducted/totalAdvance)*100 || 0, 100)}%`
            }}></div>
          </div>
          <p style={styles.progressText}>
            {balancePending === 0 && totalAdvance > 0 ? "✅ Hisab Clear Hai" : `${Math.round((totalDeducted/totalAdvance)*100 || 0)}% Advance Paid`}
          </p>
        </div>

        <div style={styles.footer}>
          <p>System Automatic Track Kar Raha Hai</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  idCard: { background: '#fff', width: '100%', maxWidth: '350px', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', border: '1px solid #fff' },
  cardHeader: { background: '#764ba2', padding: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoCircle: { width: '35px', height: '35px', background: '#fff', color: '#764ba2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  contractorName: { margin: 0, fontSize: '14px', letterSpacing: '1px' },
  cardSub: { margin: 0, fontSize: '10px', opacity: 0.8 },
  photoBox: { textAlign: 'center', padding: '20px 0', background: '#f9f9f9' },
  workerImg: { width: '130px', height: '130px', borderRadius: '15px', objectFit: 'cover', border: '4px solid #764ba2', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' },
  workerDetails: { textAlign: 'center', padding: '10px 20px' },
  nameText: { margin: '0 0 5px', fontSize: '20px', color: '#333', textTransform: 'uppercase' },
  idText: { fontSize: '13px', color: '#777', marginBottom: '15px' },
  statusBadge: { display: 'inline-block', padding: '5px 15px', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: 'bold' },
  financeBox: { padding: '20px', background: '#fff' },
  financeTitle: { fontSize: '11px', color: '#764ba2', margin: '0 0 10px', borderBottom: '1px solid #eee', paddingBottom: '5px' },
  ledgerTable: { background: '#f8f9fa', padding: '12px', borderRadius: '12px' },
  ledgerRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' },
  progressContainer: { height: '8px', background: '#eee', borderRadius: '10px', marginTop: '15px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#22c55e', borderRadius: '10px' },
  progressText: { textAlign: 'center', fontSize: '10px', color: '#888', marginTop: '5px' },
  footer: { textAlign: 'center', padding: '15px', fontSize: '10px', color: '#aaa' },
  loader: { color: '#fff', textAlign: 'center', marginTop: '50px' }
};
