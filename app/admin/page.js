"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

export default function Admin() {
  const [workers, setWorkers] = useState([]);

  const load = async () => {
    const s = await getDocs(collection(db, "workers"));
    setWorkers(s.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { load(); }, []);

  const addWorker = async () => {
    const name = prompt("Worker ka naam?");
    const pin = prompt("4-digit PIN (e.g. 5566)");
    await setDoc(doc(db, "workers", pin), { name, dailyWages: 500, advance: 0, attendance: [], currentStatus: 'Offline' });
    load();
  };

  return (
    <div style={{padding:'20px'}}>
      <h1>Admin: MD Jamil Ansari</h1>
      <button onClick={addWorker}>+ Add New Worker</button>
      {workers.map(w => (
        <div key={w.id} style={{border:'1px solid #ccc', padding:'10px', margin:'10px 0'}}>
          <h4>{w.name} (PIN: {w.id}) - {w.currentStatus}</h4>
          <p>Advance: ₹{w.advance} | Net Pay: ₹{(w.attendance.filter(a => a.approved).length * w.dailyWages) - w.advance}</p>
          <button onClick={() => alert("PDF History Sent!")}>Download PDF</button>
        </div>
      ))}
    </div>
  );
}
