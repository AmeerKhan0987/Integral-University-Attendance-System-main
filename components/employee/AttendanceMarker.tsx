import React, { useState, useEffect } from "react";
import { User, Attendance } from "../../types";
import { useData } from "../../context/DataContext";
import CameraCheckIn from "../employee/CameraCheckIn";
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

interface AttendanceMarkerProps {
  user: User;
}

export default function AttendanceMarker({ user }: AttendanceMarkerProps) {
  const { state } = useData();
  const [isScanning, setIsScanning] = useState(false);
  const [todaysAttendance, setTodaysAttendance] = useState<Attendance | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ Reusable function (moved outside useEffect)
  const fetchTodayAttendance = async () => {
    try {
      const res = await fetch(
        `http://localhost/zaphira-organic-farm-attendance-system-2/zaphira-backend/api/get_attendance.php?employee_id=${user.id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = data.data.find((a: any) =>
          a.date.startsWith(today)
        );
        setTodaysAttendance(todayRecord || null);
      }
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [user.id]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getButtonState = () => {
    if (!todaysAttendance) {
      return {
        text: "Scan Face to Check-In",
        action: () => setIsScanning(true),
        disabled: false,
      };
    }
    if (todaysAttendance.checkin_time && !todaysAttendance.checkout_time) {
      return {
        text: "Scan Face to Check-Out",
        action: () => setIsScanning(true),
        disabled: false,
      };
    }
    return {
      text: "Attendance Marked for Today",
      action: () => {},
      disabled: true,
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center">
      {/* ✅ Face Scan Modal */}
      {isScanning && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <CameraCheckIn
              employeeId={user.id}
              isCheckout={
                !!todaysAttendance?.checkin_time &&
                !todaysAttendance?.checkout_time
              }
              onSuccess={() => {
                fetchTodayAttendance(); // ✅ Refresh latest attendance from backend
                setStatusMessage({
                  type: "success",
                  text: !todaysAttendance
                    ? "Checked in successfully!"
                    : "Checked out successfully!",
                });
                setIsScanning(false);
              }}
            />
            <button
              onClick={() => setIsScanning(false)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Welcome Section */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {user?.name?.split(" ")[0] ?? "User"}!
      </h2>
      <p className="text-gray-500 mb-6">Ready to start your day?</p>

      {/* ✅ Clock */}
      <div className="text-5xl font-extrabold text-primary-700 tracking-wider mb-2">
        {currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
      <p className="text-lg text-gray-600 mb-8">{currentTime.toDateString()}</p>

      {/* ✅ Main Button */}
      <button
        onClick={buttonState.action}
        disabled={buttonState.disabled}
        className="flex items-center justify-center w-full max-w-sm px-8 py-4 bg-primary-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300"
      >
        <CameraIcon className="h-7 w-7 mr-3" />
        {buttonState.text}
      </button>

      {/* ✅ Status Message */}
      {statusMessage.text && (
        <div
          className={`mt-6 flex items-center p-3 rounded-lg ${
            statusMessage.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <XCircleIcon className="h-5 w-5 mr-2" />
          )}
          <p className="text-sm font-medium">{statusMessage.text}</p>
        </div>
      )}

      {/* ✅ Attendance Info Section */}
      <div className="w-full mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {/* Check-In */}
        <div>
          <p className="text-sm text-gray-500">Check-In</p>
          <p
            className={`text-2xl font-bold ${
              todaysAttendance?.checkin_time
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {todaysAttendance?.checkin_time || "--:--:--"}
          </p>
        </div>

        {/* Check-Out */}
        <div>
          <p className="text-sm text-gray-500">Check-Out</p>
          <p
            className={`text-2xl font-bold ${
              todaysAttendance?.checkout_time ? "text-red-500" : "text-gray-400"
            }`}
          >
            {todaysAttendance?.checkout_time || "--:--:--"}
          </p>
        </div>

        {/* Worked Hours */}
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Total Worked Hours</p>
          <p
            className={`text-2xl font-bold ${
              todaysAttendance?.worked_hours
                ? "text-primary-700"
                : "text-gray-400"
            }`}
          >
            {todaysAttendance?.worked_hours || "00h 00m"}
          </p>
        </div>
      </div>
    </div>
  );
}
