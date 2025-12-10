import React, { useState, useEffect } from "react";
import { User } from "../../types";
import DashboardLayout from "../shared/DashboardLayout";
import {
  UsersIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BellAlertIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import EmployeeManagement from "./EmployeeManagement";
import AttendanceReports from "./AttendanceReports";
import LeaveManagement from "./LeaveManagement";
import Announcements from "./Announcements";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  logoUrl: string;
  backgroundUrl: string;
}

type AdminView = "employees" | "reports" | "leaves" | "announcements";

export default function AdminDashboard({
  user,
  onLogout,
  logoUrl,
  backgroundUrl,
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>("reports");

  // ✅ Dashboard Data States
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeave: 0,
  });
  const [attendanceLog, setAttendanceLog] = useState<any[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch Dashboard Data Function (reusable)
  const fetchDashboardData = async () => {
    try {
      // 🟢 Fetch Stats
      const statsRes = await fetch(
        "http://localhost/zaphira-organic-farm-attendance-system-2/zaphira-backend/api/get_dashboard_stats.php"
      );
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      // 🟠 Fetch Today Attendance Log
      const logRes = await fetch(
        "http://localhost/zaphira-organic-farm-attendance-system-2/zaphira-backend/api/get_attendance_log.php"
      );
      const logData = await logRes.json();
      if (logData.success) setAttendanceLog(logData.data);

      // 🔵 Fetch Monthly Chart
      const chartRes = await fetch(
        "http://localhost/zaphira-organic-farm-attendance-system-2/zaphira-backend/api/get_monthly_chart.php"
      );
      const chartData = await chartRes.json();
      if (chartData.success) setMonthlyChart(chartData.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  // ✅ Auto fetch when Reports view active
  useEffect(() => {
    if (activeView === "reports") fetchDashboardData();
  }, [activeView]);

  // ✅ Manual Refresh Handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ✅ Render correct view
  const renderView = () => {
    switch (activeView) {
      case "employees":
        return <EmployeeManagement />;
      case "reports":
        return (
          <AttendanceReports
            stats={stats}
            attendanceLog={attendanceLog}
            monthlyChart={monthlyChart}
          />
        );
      case "leaves":
        return <LeaveManagement />;
      case "announcements":
        return <Announcements />;
      default:
        return (
          <AttendanceReports
            stats={stats}
            attendanceLog={attendanceLog}
            monthlyChart={monthlyChart}
          />
        );
    }
  };

  // ✅ Sidebar Item Component
  const SideNavItem = ({
    view,
    label,
    icon: Icon,
  }: {
    view: AdminView;
    label: string;
    icon: React.ElementType;
  }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center p-3 my-1 rounded-lg w-full text-left transition-colors duration-200 ${
        activeView === view
          ? "bg-primary-600 text-white shadow-md"
          : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
      }`}
    >
      <Icon className="h-6 w-6 mr-3" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      logoUrl={logoUrl}
      backgroundUrl={backgroundUrl}
    >
      {/* ✅ Header with Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {activeView === "reports"
            ? "Dashboard & Reports"
            : activeView === "employees"
            ? "Employee Management"
            : activeView === "leaves"
            ? "Leave Management"
            : "Announcements"}
        </h1>

        <button
          onClick={handleRefresh}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white ${
            refreshing
              ? "bg-green-700 animate-pulse"
              : "bg-green-600 hover:bg-green-700"
          } transition duration-200`}
        >
          <ArrowPathIcon
            className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <nav>
              <SideNavItem
                view="reports"
                label="Dashboard & Reports"
                icon={ChartBarIcon}
              />
              <SideNavItem
                view="employees"
                label="Employee Management"
                icon={UsersIcon}
              />
              <SideNavItem
                view="leaves"
                label="Leave Management"
                icon={CalendarDaysIcon}
              />
              <SideNavItem
                view="announcements"
                label="Announcements"
                icon={BellAlertIcon}
              />
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:col-span-9">{renderView()}</div>
      </div>
    </DashboardLayout>
  );
}
