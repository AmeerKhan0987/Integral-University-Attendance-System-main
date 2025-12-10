import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { api } from "../../services/api";
import { toast } from "react-toastify";

interface CameraCheckOutProps {
  employeeId: number;
  onSuccess?: (data: any) => void;
}

const videoConstraints = {
  width: 720,
  height: 480,
  facingMode: "user",
};

export default function CameraCheckOut({
  employeeId,
  onSuccess,
}: CameraCheckOutProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const handleCapture = useCallback(async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      setIsCapturing(true);
      const base64Image = imageSrc.split(",")[1];

      const response = await api.post("/checkout.php", {
        employee_id: employeeId,
        image_base64: base64Image,
      });

      if (response.data.success) {
        toast.success("Check-out successful!");
        onSuccess?.(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to check out");
    } finally {
      setIsCapturing(false);
    }
  }, [employeeId, onSuccess]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="rounded-lg shadow-lg"
        mirrored={true}
        imageSmoothing={true}
        disablePictureInPicture={false}
        forceScreenshotSourceSize={false}
        onUserMedia={() => {}}
        onUserMediaError={() => {}}
        screenshotQuality={1}
      />
      <button
        onClick={handleCapture}
        disabled={isCapturing}
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCapturing ? "Processing..." : "Check Out"}
      </button>
    </div>
  );
}
