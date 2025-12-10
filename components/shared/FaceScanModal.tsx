import React, { useRef, useEffect, useState } from "react";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface FaceScanModalProps {
  onClose: () => void;
  onScanComplete: (success: boolean, imageBase64?: string) => void;
  purpose: "checkin" | "register";
}

export default function FaceScanModal({
  onClose,
  onScanComplete,
  purpose,
}: FaceScanModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Initializing camera...");
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stream: MediaStream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("Please position your face in the center.");

        // Start fake scanning + capture
        setTimeout(() => {
          setShowProgress(true);
          setStatus(
            purpose === "checkin"
              ? "Verifying identity..."
              : "Capturing face data..."
          );

          const interval = setInterval(() => {
            setProgress((prev) => {
              const next = prev + 20;
              if (next >= 100) {
                clearInterval(interval);
                setStatus("Completed!");

                // ✅ Capture the image
                const canvas = document.createElement("canvas");
                const video = videoRef.current;
                if (video) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  const ctx = canvas.getContext("2d");
                  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const capturedBase64 = canvas.toDataURL("image/jpeg");

                  // ✅ send image back to parent
                  setTimeout(() => onScanComplete(true, capturedBase64), 500);
                } else {
                  setTimeout(() => onScanComplete(false), 500);
                }

                return 100;
              }
              return next;
            });
          }, 400);
        }, 2000);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setStatus("Camera access denied. Please enable camera permissions.");
        setTimeout(() => onScanComplete(false), 2000);
      }
    };

    startCamera();

    // Stop camera when modal closes
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onScanComplete, purpose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 relative transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center">
          <CameraIcon className="h-12 w-12 text-primary-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">
            Face Recognition
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {purpose === "checkin"
              ? "Marking your attendance"
              : "Registering new employee"}
          </p>

          <div className="w-full h-64 bg-gray-900 rounded-lg my-4 overflow-hidden relative border-4 border-gray-300">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            ></video>
            <div
              className="absolute inset-0 border-8 border-primary-500/50 rounded-lg"
              style={{ clipPath: "ellipse(35% 45% at 50% 50%)" }}
            ></div>
          </div>

          <p className="text-md font-medium text-gray-700 h-6">{status}</p>

          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
