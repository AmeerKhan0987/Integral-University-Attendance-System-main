
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { api } from "../../services/api";
import { toast } from "react-toastify";

interface CameraCheckInProps {
  employeeId: number;
  isCheckout?: boolean; // ✅ new prop to decide check-in or check-out
  onSuccess?: (data: any) => void;
}

const videoConstraints = {
  width: 720,
  height: 480,
  facingMode: "user",
};

export default function CameraCheckIn({
  employeeId,
  isCheckout = false,
  onSuccess,
}: CameraCheckInProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // const handleCapture = useCallback(async () => {
  //   try {
  //     const imageSrc = webcamRef.current?.getScreenshot();
  //     if (!imageSrc) {
  //       toast.error("No image captured! Try again.");
  //       return;
  //     }

  //     setIsCapturing(true);
  //     const base64Image = imageSrc.split(",")[1];

  //     // ✅ Automatically decide API endpoint
  //     const endpoint = isCheckout ? "/checkout.php" : "/checkin.php";

  //     const response = await api.post(endpoint, {
  //       employee_id: employeeId,
  //       image_base64: base64Image,
  //     });

  //     if (response.data.success) {
  //       // ✅ Show proper message
  //       if (isCheckout) {
  //         toast.success("Checked out successfully!");
  //       } else {
  //         toast.success("Checked in successfully!");
  //       }

  //       // ✅ Send response back to parent component
  //       onSuccess?.(response.data.data);
  //     } else {
  //       toast.error(response.data.error || "Something went wrong!");
  //     }
  //   } catch (error: any) {
  //     toast.error(
  //       error.response?.data?.error ||
  //         (isCheckout ? "Failed to check out" : "Failed to check in")
  //     );
  //   } finally {
  //     setIsCapturing(false);
  //   }
  // }, [employeeId, onSuccess, isCheckout]);
  const handleCapture = useCallback(async () => {
    console.log("📸 Capture button clicked");
    toast.info(isCheckout ? "Checking out..." : "Checking in...");

    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        toast.error("No image captured! Try again.");
        return;
      }

      setIsCapturing(true);
      const base64Image = imageSrc.split(",")[1];
      const endpoint = isCheckout ? "/checkout.php" : "/checkin.php";

      console.log("📤 Sending to:", endpoint);

      const response = await api.post(endpoint, {
        employee_id: employeeId,
        image_base64: base64Image,
      });

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        toast.success(
          isCheckout ? "Checked out successfully!" : "Checked in successfully!"
        );
        onSuccess?.(response.data.data);
      } else {
        toast.error(response.data.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      toast.error("Server error");
    } finally {
      setIsCapturing(false);
    }
  }, [employeeId, onSuccess, isCheckout]);

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
        className={`px-6 py-2 text-white rounded-md font-medium transition ${
          isCheckout
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isCapturing ? "Processing..." : isCheckout ? "Check Out" : "Check In"}
      </button>
    </div>
  );
}
