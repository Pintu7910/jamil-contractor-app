"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';

export default function AdminPanel() {
  const [workers, setWorkers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [advanceAmt, setAdvanceAmt] = useState("");
  const [newWorker, setNewWorker] = useState({ name: '', id: '', wages: 500 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workers"), (snap) => {
      setWorkers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const createWorker = async () => {
    if (newWorker.id.length !== 4) return alert("ID 4 digit ki honi chahiye!");
    await setDoc(doc(db, "workers", newWorker.id), {
      ...newWorker, totalAdvance: 0, totalDeducted: 0, totalEarned: 0, 
      approvedAttendance: [], pendingAttendance: []
    });
    alert("Worker Registered!");
  };

  const handleAdvanceUpdate = async () => {
    if (!advanceAmt) return;
    const workerRef = doc(db, "workers", selectedWorker.id);
    await updateDoc(workerRef, {
      totalAdvance: (selectedWorker.totalAdvance || 0) + Number(advanceAmt)
    });
    setShowAdvanceModal(false);
    setAdvanceAmt("");
    alert("Advance Add Ho Gaya!");
  };

  if (!isAdmin) {
    return (
      <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center', background:'#764ba2'}}>
        <div style={{background:'#fff', padding:'30px', borderRadius:'15px', textAlign:'center'}}>
          <h2>Admin Login</h2>
          <input type="password" placeholder="Enter Jh8323" onChange={(e) => e.target.value === "Jh8323" && setIsAdmin(true)} style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', fontFamily:'sans-serif', background:'#f4f7f6', minHeight:'100vh'}}>
      <h1 style={{color:'#764ba2'}}>JAMIL CONTRACTOR - ADMIN</h1>

      {/* WORKER REGISTRATION */}
      <div style={{background:'#fff', padding:'20px', borderRadius:'12px', marginBottom:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
        <h3>Add New Worker</h3>
        <div style={{display:'flex', gap:'10px'}}>
          <input placeholder="Name" onChange={e => setNewWorker({...newWorker, name: e.target.value})} style={adminStyles.input} />
          <input placeholder="4 Digit ID" onChange={e => setNewWorker({...newWorker, id: e.target.value})} style={adminStyles.input} />
          <button onClick={createWorker} style={adminStyles.btn}>Create Worker</button>
        </div>
      </div>

      {/* WORKER LIST WITH ADVANCE BUTTON */}
      <h3>Worker List & Finance</h3>
      <div style={{display:'grid', gap:'15px'}}>
        {workers.map(w => (
          <div key={w.id} style={adminStyles.workerCard}>
            <div>
              <h4 style={{margin:0}}>{w.name} (ID: {w.id})</h4>
              <p style={{fontSize:'12px', color:'#666'}}>Baki Balance: ₹{(w.totalAdvance || 0) - (w.totalDeducted || 0)}</p>
            </div>
            <button 
              onClick={() => { setSelectedWorker(w); setShowAdvanceModal(true); }}
              style={{background:'#764ba2', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}
            >
              ➕ Add Advance
            </button>
          </div>
        ))}
      </div>

      {/* ADVANCE POPUP MODAL */}
      {showAdvanceModal && (
        <div style={adminStyles.modalOverlay}>
          <div style={adminStyles.modal}>
            <h3>Add Advance for {selectedWorker?.name}</h3>
            <p>Current Advance: ₹{selectedWorker?.totalAdvance || 0}</p>
            <input 
              type="number" 
              placeholder="Amount Enter Karein" 
              value={advanceAmt}
              onChange={(e) => setAdvanceAmt(e.target.value)}
              style={{width:'100%', padding:'10px', marginBottom:'15px'}}
            />
            <div style={{display:'flex', gap:'10px'}}>
              <button onClick={handleAdvanceUpdate} style={{flex:1, background:'#22c55e', color:'#fff', border:'none', padding:'10px', borderRadius:'5px'}}>SAVE</button>
              <button onClick={() => setShowAdvanceModal(false)} style={{flex:1, background:'#ef4444', color:'#fff', border:'none', padding:'10px', borderRadius:'5px'}}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const adminStyles = {
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '5px' },
  btn: { background: '#764ba2', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' },
  workerCard: { background: '#fff', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: '#fff', padding: '30px', borderRadius: '15px', width: '300px' }
};
