"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
// 1. useParams ko import karein
import { useParams } from 'next/navigation';

// Components Import
import IDCard from '../../components/IDCard';
import FinanceLedger from '../../components/FinanceLedger';
import AttendanceControl from '../../components/AttendanceControl';
import { downloadWorkerHistory } from '../../utils/pdfGenerator';

export const dynamic = 'force-dynamic';

export default function WorkerDashboard() {
  const params = useParams(); // 2. URL se ID nikalne ke liye
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 3. ❌ "1234" hatakar real ID use karein
    const id = params.id; 

    if (!id) return;

    const unsub = onSnapshot(doc(db, "workers", id), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      } else {
        console.error("Worker nahi mila!");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [params.id]); // ID badalne par naya data load hoga

  // ... baaki handleMarkAttendance aur UI wahi rahega
