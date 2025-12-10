import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { User } from "../../types";

interface AttendanceHistoryProps {
  user: User;
}

export default function AttendanceHistory({ user }: AttendanceHistoryProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  // ✅ Fetch attendance from backend
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(
          `http://localhost/zaphira-backend/api/get_attendance.php?employee_id=${user.id}`
        );
        const data = await res.json();
        if (data.success) setAttendanceData(data.data);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };
    fetchAttendance();
  }, [user.id]);

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays: React.ReactNode[] = [];

  // ✅ Convert fetched data into map { "2025-11-08": {checkin_time, checkout_time, ...} }
  const attendanceMap: Record<string, any> = {};
  attendanceData.forEach((rec) => {
    attendanceMap[rec.date] = rec;
  });

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const record = attendanceMap[dateStr];
    let status = "No Record";
    let bg = "bg-gray-100 text-gray-700";
// set the Attendence Time Here......
    if (record) {
      if (record.checkin_time) {
        const checkinHour = parseInt(record.checkin_time.split(":")[0]);
        const checkinMin = parseInt(record.checkin_time.split(":")[1]);
        if (checkinHour > 9 || (checkinHour === 9 && checkinMin > 30)) {
          status = "Late";
          bg = "bg-orange-400 text-orange-800";
        } else {
          status = "Present";
          bg = "bg-green-300 text-green-800";
        }
      }
      if (!record.checkout_time) {
        status = "Half Day";
        bg = "bg-yellow-300 text-yellow-800";
      }
    } else {
      const today = new Date();
      const compare = new Date(dateStr);
      if (compare < today) {
        status = "Absent";
        bg = "bg-red-300 text-red-800";
      }
    }

    calendarDays.push(
      <div
        key={day}
        className={`text-center py-2 rounded-lg flex flex-col items-center justify-center h-20 ${bg}`}
      >
        <span className="font-bold text-lg">{day}</span>
        <span className="text-xs font-semibold mt-1">{status}</span>
      </div>
    );
  }

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center">
      <span className={`w-4 h-4 rounded-full mr-2 ${color}`}></span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          My Attendance Calendar
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold w-32 text-center">
            {monthName} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{calendarDays}</div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4">
        <LegendItem color="bg-green-200" label="Present" />
        <LegendItem color="bg-orange-200" label="Late" />
        <LegendItem color="bg-yellow-200" label="Half Day" />
        <LegendItem color="bg-red-200" label="Absent" />
        <LegendItem color="bg-gray-100" label="No Record" />
      </div>
    </div>
  );
}
