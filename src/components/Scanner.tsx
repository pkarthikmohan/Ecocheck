import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ScannerProps {
  onScan: (base64Image: string, mimeType: string) => void;
  isLoading: boolean;
}

export function Scanner({ onScan, isLoading }: ScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen, stream]);

  const startCamera = async () => {
    console.log("Starting camera... Secure context:", window.isSecureContext);
    try {
      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser or context (requires HTTPS)");
      }

      let s: MediaStream;
      try {
        // Try with ideal constraints first (back camera, HD)
        s = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (firstErr) {
        console.warn("Ideal constraints failed, trying basic fallback...", firstErr);
        // Fallback to any available video source
        s = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(s);
      setIsOpen(true);
    } catch (err) {
      console.error("Camera access error:", err);
      let message = "Could not access camera";
      
      if (err instanceof Error) {
        if (err.name === 'NotReadableError' || err.message.includes('Could not start video source')) {
          message = "Camera is already in use by another application or tab, or hardware is unavailable";
        } else if (err.name === 'NotAllowedError') {
          message = "Camera permission was denied. Please enable it in your browser settings";
        } else if (err.name === 'NotFoundError') {
          message = "No camera hardware was found on this device";
        } else {
          message = err.message;
        }
      }
      
      alert(`${message}. If the problem persists, please try the "Upload Photo" option instead.`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onScan(dataUrl, 'image/jpeg');
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("File selected for upload:", file?.name, file?.type);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("File read complete, calling onScan...");
        onScan(reader.result as string, file.type);
        // Reset input so the same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-center gap-4">
      <motion.button
        onClick={startCamera}
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        className="flex items-center gap-2 px-6 py-3 bg-eco-a text-white rounded-2xl font-bold shadow-lg hover:bg-eco-a/90 transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
        Scan Product
      </motion.button>

      <motion.button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md text-slate-700 border-2 border-slate-200 rounded-2xl font-bold shadow-sm hover:border-emerald-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
      >
        <Upload className="w-5 h-5" />
        Upload Photo
      </motion.button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopCamera}
              className="absolute top-6 right-6 text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-8 h-8" />
            </motion.button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            >
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-sm font-medium">Initializing camera...</p>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none backdrop-blur-[2px]">
                <div className="w-full h-full border-2 border-emerald-400/50 rounded-xl relative overflow-hidden">
                  <motion.div 
                    className="absolute left-0 right-0 h-0.5 bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,1)]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={captureImage}
              className="mt-8 w-20 h-20 bg-white rounded-full border-[6px] border-emerald-500/30 flex items-center justify-center shadow-2xl transition-colors hover:border-emerald-500/50"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-full" />
            </motion.button>
            
            <p className="mt-4 text-white/60 text-sm font-medium">Align product within the frame</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
