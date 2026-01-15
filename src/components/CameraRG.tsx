import { useRef, useEffect, useState } from "react";

interface CameraRGProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
}

export function CameraRG({
  open,
  onClose,
  formData,
  setFormData,
}: CameraRGProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // 🔥 Abre a câmera quando open = true
  useEffect(() => {
    if (!open) return;

    let activeStream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      .then((stream) => {
        activeStream = stream;
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        alert("Não foi possível acessar a câmera");
        onClose();
      });

    return () => {
      activeStream?.getTracks().forEach((t) => t.stop());
    };
  }, [open, onClose]);

  if (!open) return null;

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    onClose();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 🔹 Proporção do RG
    const rectWidthRatio = 0.65;
    const aspect = 1.6;

    const cropWidth = video.videoWidth * rectWidthRatio;
    const cropHeight = cropWidth / aspect;

    const sx = (video.videoWidth - cropWidth) / 2;
    const sy = (video.videoHeight - cropHeight) / 2;

    // 🎯 Canvas invertido (vai rotacionar)
    canvas.width = cropHeight;
    canvas.height = cropWidth;

    // 🔄 Rotação 90° horário
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI / 2);

    ctx.drawImage(
      video,
      sx,
      sy,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    ctx.restore();

    const photo = canvas.toDataURL("image/jpeg", 0.85);
    setFormData({ ...formData, rgPhoto: photo });

    stopCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-xl">
        <div
          className="relative w-full"
          style={{ aspectRatio: "16 / 9" }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded"
          />

          {/* Moldura RG */}
          <div
            className="absolute border-2 border-blue-500 pointer-events-none"
            style={{
              width: "65%",
              aspectRatio: "1.6",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={capturePhoto}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            Capturar RG
          </button>
          <button
            onClick={stopCamera}
            className="flex-1 bg-red-600 text-white py-2 rounded"
          >
            Cancelar
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
