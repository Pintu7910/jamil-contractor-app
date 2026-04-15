"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function WorkerPortal() {
  const updateStatus = async (status) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const user = auth.currentUser;
      const workerRef = doc(db, "live_tracking", user.uid);

      await updateDoc(workerRef, {
        currentStatus: status, // "Working", "Relaxing", "Out"
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        lastUpdated: serverTimestamp()
      });
      alert(`Status updated to ${status}`);
    });
  };

  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-center font-bold">Worker Dashboard</h1>
      <button onClick={() => updateStatus("Working")} className="bg-green-600 text-white p-4 rounded-xl">Kaam Shuru (Working)</button>
      <button onClick={() => updateStatus("Relaxing")} className="bg-yellow-500 text-white p-4 rounded-xl">Aaram (Relax)</button>
      <button onClick={() => updateStatus("Out")} className="bg-red-600 text-white p-4 rounded-xl">Site Se Bahar (Exit)</button>
    </div>
  );
}
