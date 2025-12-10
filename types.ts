
export enum Role {
  Admin = 'admin',
  Employee = 'employee',
}

export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  Late = 'Late',
  OnLeave = 'OnLeave',
}

export enum LeaveStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Should be encrypted in a real app
  role: Role;
  department: string;
  designation: string;
  profileImage: string;
  faceData: any; // Placeholder for face embedding
  createdAt: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  date: string; // YYYY-MM-DD
  checkInTime: string | null; // HH:mm:ss
  checkOutTime: string | null; // HH:mm:ss
  workedHours: string | null; // e.g., "8h 30m"
  status: AttendanceStatus;
}

export interface Leave {
  id: number;
  employeeId: number;
  reason: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  status: LeaveStatus;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  role: Role | 'all';
  createdAt: string;
}

export interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
}
