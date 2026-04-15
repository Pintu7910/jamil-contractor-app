"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [workers, setWorkers] = useState([]);
  const [siteLocation, setSiteLocation] = useState({ lat: null, lng: null });

  const loadData = async () => {
    const snap = await getDocs(collection(db, "workers"));
    setWorkers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadData(); }, []);

  // Admin Worker register karega tab ID milegi
  const registerWorker = async (name) => {
    const id = "JAMIL-" + Math.floor(1000 + Math.random() * 9000);
    await setDoc(doc(db, "workers", id), {
      name, dailyWages: 500, advance: 0, attendanceHistory: [], currentStatus: 'Offline'
    });
    alert("Naya Worker ID: " + id);
    loadData();
  };

  const approveAttendance = async (workerId, logIndex) => {
    const workerRef = doc(db, "workers", workerId);
    const workerData = workers.find(w => w.id === workerId);
    workerData.attendanceHistory[logIndex].approved = true;
    
    await updateDoc(workerRef, {
      attendanceHistory: workerData.attendanceHistory
    });
    loadData();
    alert("Attendance Approved!");
  };

  return (
    <div style={{padding:'20px', fontFamily:'sans-serif'}}>
      <h1 style={{textAlign:'center'}}>MD Jamil Ansari Admin</h1>
      
      <button onClick={() => registerWorker(prompt("Worker ka naam?"))} style={adminBtn}>+ Add New Worker</button>

      <h3>Real-time Worker Tracking</h3>
      {workers.map(w => (
        <div key={w.id} style={workerCard}>
          <h4>{w.name} (ID: {w.id})</h4>
          <p>Status: <strong>{w.currentStatus}</strong></p>
          <p>Advance: ₹<input type="number" defaultValue={w.advance} onBlur={async (e) => {
            await updateDoc(doc(db, "workers", w.id), { advance: Number(e.target.value) });
            loadData();
          }} style={{width:'60px'}} /></p>
          
          <p>Total Payment: ₹{(w.attendanceHistory.filter(h => h.approved).length * w.dailyWages) - w.advance}</p>
          
          <h5>Pending Approvals:</h5>
          {w.attendanceHistory.map((log, index) => !log.approved && (
            <div key={index} style={{background:'#fff3cd', padding:'10px', marginBottom:'5px', borderRadius:'5px'}}>
              <img src={log.photo} width="50" /> {log.time} - {log.status}
              <button onClick={() => approveAttendance(w.id, index)} style={{marginLeft:'10px'}}>Approve</button>
            </div>
          ))}
          <button style={pdfBtn}>Download History PDF</button>
        </div>
      ))}
    </div>
  );
}

const adminBtn = { padding:'15px', background:'#000', color:'#fff', border:'none', borderRadius:'10px', width:'100%', cursor:'pointer' };
const workerCard = { border:'1px solid #ddd', padding:'15px', borderRadius:'15px', marginBottom:'15px', background:'#f9f9f9' };
const pdfBtn = { background:'#dc3545', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px', marginTop:'10px' };
