import React, { useState } from 'react';

/**
 * AttendanceBox Component: Worker ki photo capture karne aur attendance mark karne ke liye.
 * Isme camera interface aur submit button ka logic hai.
 */
export default function AttendanceBox({ onUpload }) {
  const [preview, setPreview] = useState(null);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Photo ka preview dikhane ke liye
      };
      reader.readAsDataURL(file);
    }
  };

  const styles = {
    container: {
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '20px',
      padding: '20px',
      width: '100%',
      maxWidth: '360px',
      margin: '15px auto',
      textAlign: 'center',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '15px'
    },
    uploadArea: {
      border: '2px dashed #764ba2',
      borderRadius: '15px',
      padding: '20px',
      cursor: 'pointer',
      marginBottom: '15px',
      position: 'relative'
    },
    previewImg: {
      width: '100%',
      maxHeight: '200px',
      borderRadius: '10px',
      objectFit: 'cover'
    },
    presentBtn: {
      width: '100%',
      padding: '15px',
      background: '#22c55e',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)'
    },
    input: {
      display: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>MD Jamil Ansari</h3>
      
      <div style={styles.uploadArea} onClick={() => document.getElementById('cam').click()}>
        {preview ? (
          <img src={preview} alt="Preview" style={styles.previewImg} />
        ) : (
          <div style={{color: '#764ba2'}}>
            <p style={{margin: 0}}>Subah ki ek photo lein:</p>
            <span style={{fontSize: '12px', color: '#888'}}>Click to Open Camera</span>
          </div>
        )}
      </div>

      <input 
        id="cam"
        type="file" 
        accept="image/*" 
        capture="camera" 
        onChange={handleCapture}
        style={styles.input} 
      />

      <button 
        style={styles.presentBtn}
        onClick={() => onUpload(preview)}
        disabled={!preview}
      >
        ✅ MARK PRESENT
      </button>
    </div>
  );
}
