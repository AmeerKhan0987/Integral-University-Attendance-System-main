import React from "react";
import {
  UserGroupIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/solid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AttendanceReportsProps {
  stats: {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    onLeave: number;
  };
  attendanceLog: any[];
  monthlyChart: any[];
}

export default function AttendanceReports({
  stats,
  attendanceLog,
  monthlyChart,
}: AttendanceReportsProps) {
  const BASE_URL =
    "http://localhost/zaphira-backend";

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Employee,Department,Check-In,Check-Out\r\n";
    attendanceLog.forEach((att) => {
      csvContent += `${att.employee_name},${att.department || ""},${
        att.checkin_time || ""
      },${att.checkout_time || ""}\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
      <div className={`p-3 rounded-full mr-4 ${color}`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Attendance Dashboard
        </h2>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString("en-GB")}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UserGroupIcon}
          title="Total Employees"
          value={stats.totalEmployees}
          color="bg-blue-500"
        />
        <StatCard
          icon={SunIcon}
          title="Present Today"
          value={stats.presentToday}
          color="bg-green-500"
        />
        <StatCard
          icon={MoonIcon}
          title="Absent Today"
          value={stats.absentToday}
          color="bg-red-500"
        />
        <StatCard
          icon={UserIcon}
          title="On Leave"
          value={stats.onLeave}
          color="bg-yellow-500"
        />
      </div>

      {/* Monthly Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Monthly Attendance Overview
        </h3>
        <div style={{ width: "100%", minHeight: "320px" }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />{" "}
              {/* ✅ 'name' backend se aa raha hai (day number) */}
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" name="Present" fill="#22c55e" />{" "}
              {/* ✅ Case-sensitive */}
              <Bar dataKey="Absent" name="Absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Today's Attendance Log
          </h3>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            Export Full Report (CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Employee
                </th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Department
                </th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Check-In
                </th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Check-In Image
                </th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Check-Out
                </th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Check-Out Image
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceLog.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-4 italic"
                  >
                    No records found for today
                  </td>
                </tr>
              ) : (
                attendanceLog.map((att, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">
                      {att.employee_name}
                    </td>
                    <td className="py-2 px-3">{att.department || "--"}</td>
                    <td className="py-2 px-3">{att.checkin_time || "--:--"}</td>
                    <td className="py-2 px-3">
                      {att.checkin_image ? (
                        <img
                          src={`${BASE_URL}/${att.checkin_image}`}
                          alt="Check-in"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {att.checkout_time || "--:--"}
                    </td>
                    <td className="py-2 px-3">
                      {att.checkout_image ? (
                        <img
                          src={`${BASE_URL}/${att.checkout_image}`}
                          alt="Check-out"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
