"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { checkDistance } from '@/lib/geofence';

export default function AdminPanel() {
  const [workers, setWorkers] = useState([]);
  const siteLocation = { lat: 22.8046, lng: 86.2029 }; // Example site lat/lng

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "live_tracking"), (snap) => {
      const list = snap.docs.map(doc => {
        const data = doc.data();
        const dist = checkDistance(data.lat, data.lng, siteLocation.lat, siteLocation.lng);
        return { 
          id: doc.id, 
          ...data, 
          isInside: dist < 100 // 100 meter radius
        };
      });
      setWorkers(list);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">MD Jamil Ansari - Admin</h1>
      {workers.map(w => (
        <div key={w.id} className="bg-white p-4 rounded-lg shadow mb-2 border-l-4 border-blue-500">
          <div className="flex justify-between">
            <h2 className="font-bold text-lg">{w.name}</h2>
            <span className={w.isInside ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              {w.isInside ? "On Site" : "Outside Site"}
            </span>
          </div>
          <p className="text-sm">Status: <span className="font-semibold text-orange-600">{w.currentStatus}</span></p>
          <p className="text-sm">Payment Due: ₹{w.totalPending} | Advance: ₹{w.advance}</p>
        </div>
      ))}
    </div>
  );
}
