import { User, Role, Attendance, Leave, LeaveStatus, AttendanceStatus, Holiday, Notification } from './types';

export const USERS: User[] = [];


export const MOCK_ATTENDANCE: Attendance[] = [];

export const MOCK_LEAVES: Leave[] = [];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {id: 1, title: "System Maintenance", message: "The system will be down for maintenance on Sunday.", role: 'all', createdAt: '2024-07-20'},
    {id: 2, title: "Town Hall Meeting", message: "All hands meeting this Friday at 3 PM in the main conference room.", role: 'all', createdAt: '2024-07-18'},
];

export const DEPARTMENTS: string[] = ['Engineering', 'Marketing', 'Sales', 'HR', 'Management', 'Operations', 'Customer Support', 'Isavii', 'Content', 'Tech', 'Noor', 'R&D', 'Unassigned'];

export const HOLIDAYS: Holiday[] = [
    {date: '2024-01-01', name: 'New Year\'s Day'},
    {date: '2024-12-25', name: 'Christmas Day'},
];

export const OFFICE_COORDINATES = {
  latitude: 37.7749, // San Francisco City Hall
  longitude: -122.4194,
};

export const MAX_DISTANCE_METERS = 500; // 500 meters radius from office