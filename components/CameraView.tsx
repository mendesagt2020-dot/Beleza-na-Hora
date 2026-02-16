
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CameraViewProps {
  onCapture: (image: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Navegador incompatível.");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err: any) {
      setError("Câmera indisponível no momento.");
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopStream();
  }, [startCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Otimização crucial: Reduzir para 512px para upload ultra-rápido
      const targetSize = 512;
      canvas.width = targetSize;
      canvas.height = targetSize;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const videoSize = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - videoSize) / 2;
        const startY = (video.videoHeight - videoSize) / 2;
        
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, startX, startY, videoSize, videoSize, 0, 0, targetSize, targetSize);
        ctx.restore();
        
        // JPEG com 80% de qualidade é imperceptível para IA e muito menor em bytes
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
        setIsPhotoTaken(true);
        stopStream();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, 512, 512);
              setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
              setIsPhotoTaken(true);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-xl w-full mx-auto bg-white rounded-[3rem] shadow-2xl border border-gray-50">
      <div className="w-full mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Estúdio Fotográfico</h2>
        <p className="text-gray-300 text-[9px] font-black uppercase tracking-[0.3em]">Ambiente otimizado para velocidade</p>
      </div>

      <div className="relative w-full aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden mb-10 shadow-inner flex items-center justify-center border border-gray-100">
        {!isPhotoTaken ? (
          <>
            {stream && <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />}
            {isInitializing && <div className="absolute inset-0 bg-white flex items-center justify-center"><div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>}
            {error && (
              <div className="p-10 text-center">
                <label className="py-5 px-10 bg-black text-white rounded-2xl font-bold text-[10px] tracking-widest cursor-pointer hover:scale-105 transition-all">
                  UPLOAD DE FOTO
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload}/>
                </label>
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
               <div className="w-2/3 h-2/3 border border-white/20 rounded-full border-dashed"></div>
            </div>
          </>
        ) : (
          <img src={capturedImage!} alt="Captura" className="w-full h-full object-cover animate-fadeIn" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col gap-5 w-full">
        {!isPhotoTaken ? (
          <button onClick={takePhoto} className="w-full py-6 rounded-2xl bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-gray-800 transition-all" disabled={isInitializing || !!error}>CAPTURAR AGORA</button>
        ) : (
          <button onClick={() => onCapture(capturedImage!)} className="w-full py-6 rounded-2xl bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-all">INICIAR TRANSFORMAÇÃO</button>
        )}
        <button onClick={onCancel} className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 hover:text-black transition-colors">
          <i className="fas fa-arrow-left mr-2"></i> Voltar
        </button>
      </div>
    </div>
  );
};

export default CameraView;
