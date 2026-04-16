import imageCompression from 'browser-image-compression';

/**
 * imageCompressor: High quality photo ko compress karke size chota karne ke liye.
 */
export const compressWorkerImage = async (imageFile) => {
  const options = {
    maxSizeMB: 0.2,          // Photo ko 200KB se kam rakhega
    maxWidthOrHeight: 800,   // Dimensions limit karega
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(imageFile, options);
    console.log(`Pehle size: ${imageFile.size / 1024} KB`);
    console.log(`Naya size: ${compressedFile.size / 1024} KB`);
    
    // File ko Base64 mein badal raha hai taaki turant dikh sake
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => resolve(reader.result);
    });
  } catch (error) {
    console.error("Compression failed:", error);
    return null;
  }
};
