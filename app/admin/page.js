"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminSetup() {
  const setupWorker = async () => {
    // 1234 ID ko manually create karne ke liye
    await setDoc(doc(db, "workers", "1234"), {
      name: "Sadiya Test Worker",
      id: "1234",
      wages: 500,
      totalAdvance: 0,
      totalDeducted: 0,
      approvedAttendance: [],
      pendingAttendance: []
    });
    alert("Worker 1234 Registered Successfully!");
  };

  return (
    <div style={{padding: '50px', textAlign: 'center'}}>
      <h1>Jamil Contractor Admin</h1>
      <button onClick={setupWorker} style={{padding: '15px 30px', background: '#764ba2', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer'}}>
        Register Worker 1234
      </button>
    </div>
  );
}
