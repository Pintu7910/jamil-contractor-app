"use client";
import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

export default function AdminSetSite() {
  const [siteName, setSiteName] = useState('');

  const handleSetSite = async (e) => {
    const file = e.target.files[0];
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      // Photo upload
      const storageRef = ref(storage, `sites/${siteName}`);
      await uploadBytes(storageRef, file);
      const photoUrl = await getDownloadURL(storageRef);

      // Save Site Data
      await addDoc(collection(db, "sites"), {
        name: siteName,
        lat: latitude,
        lng: longitude,
        photo: photoUrl,
        contractor: "MD Jamil Ansari",
        createdAt: new Date()
      });
      alert("Site Location & Photo Set Successfully!");
    });
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Add New Site (Geo-Fence)</h1>
      <input className="border p-2 my-2 w-full" placeholder="Site Name" onChange={e => setSiteName(e.target.value)} />
      <input type="file" accept="image/*" capture="camera" onChange={handleSetSite} className="mt-4" />
      <p className="text-sm text-gray-500 mt-2">Photo lete hi location save ho jayegi.</p>
    </div>
  );
}
