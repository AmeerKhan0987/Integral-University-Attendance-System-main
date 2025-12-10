import React, { useState, useEffect } from "react";
import { User } from "../../types";
import DashboardLayout from "../shared/DashboardLayout";
import {
  ClockIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import AttendanceMarker from "./AttendanceMarker";
import LeaveApplication from "./LeaveApplication";
import AttendanceHistory from "./AttendanceHistory";
import Profile from "./Profile";

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
  logoUrl: string;
  backgroundUrl: string;
}

type EmployeeView = "attendance" | "leave" | "history" | "profile";

export default function EmployeeDashboard({
  user,
  onLogout,
  logoUrl,
  backgroundUrl,
}: EmployeeDashboardProps) {
  const [activeView, setActiveView] = useState<EmployeeView>("attendance");

  // ✅ Maintain profile image state (for header sync)
  const [profileImage, setProfileImage] = useState<string>(
    user.profileImage || ""
  );

  // ✅ Load persisted image if available
  useEffect(() => {
    const savedImage = localStorage.getItem("currentUserImage");
    if (savedImage) {
      try {
        const { id, url } = JSON.parse(savedImage);
        if (id === user.id) setProfileImage(url);
      } catch (e) {
        console.error("Failed to parse saved image", e);
      }
    }
  }, [user.id]);

  // ✅ Render views
  const renderView = () => {
    switch (activeView) {
      case "attendance":
        return <AttendanceMarker user={user} />;
      case "leave":
        return <LeaveApplication user={user} />;
      case "history":
        return <AttendanceHistory user={user} />;
      case "profile":
        // ✅ Pass onImageChange to sync Header instantly
        return (
          <Profile
            user={user}
            onImageChange={(url) => {
              setProfileImage(url);
              localStorage.setItem(
                "currentUserImage",
                JSON.stringify({ id: user.id, url })
              );
            }}
          />
        );
      default:
        return <AttendanceMarker user={user} />;
    }
  };

  const NavItem = ({
    view,
    icon: Icon,
    label,
  }: {
    view: EmployeeView;
    icon: React.ElementType;
    label: string;
  }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 w-full text-center ${
        activeView === view
          ? "bg-primary-600 text-white shadow-lg"
          : "bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600"
      }`}
    >
      <Icon className="h-7 w-7 mb-1" />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );

  return (
    <DashboardLayout
      // ✅ Pass updated image to header
      user={{ ...user, profileImage }}
      onLogout={onLogout}
      logoUrl={logoUrl}
      backgroundUrl={backgroundUrl}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow space-y-3">
            <NavItem
              view="attendance"
              icon={ClockIcon}
              label="Mark Attendance"
            />
            <NavItem
              view="leave"
              icon={DocumentTextIcon}
              label="Apply for Leave"
            />
            <NavItem
              view="history"
              icon={CalendarDaysIcon}
              label="Attendance History"
            />
            <NavItem view="profile" icon={UserIcon} label="My Profile" />
          </div>
        </div>
        <div className="lg:col-span-9">{renderView()}</div>
      </div>
    </DashboardLayout>
  );
}
