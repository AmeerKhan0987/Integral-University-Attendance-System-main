import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { format } from "date-fns";

interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  checkin_time: string | null;
  checkout_time: string | null;
  checkin_image: string | null;
  checkout_image: string | null;
}

interface AttendanceTableProps {
  employeeId: number;
}

export default function AttendanceTable({ employeeId }: AttendanceTableProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get(
          `/get_attendance.php?employee_id=${employeeId}`
        );
        if (response.data.success) {
          setRecords(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="text-center py-4">Loading attendance records...</div>
    );
  }

  if (records.length === 0) {
    return <div className="text-center py-4">No attendance records found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-In Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-In Photo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-Out Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-Out Photo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(new Date(record.date), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(new Date(record.checkin_time), "hh:mm a")}
              </td>
              <td className="px-6 py-4">
                <img
                  src={record.checkin_image}
                  alt="Check-in"
                  className="w-24 h-24 object-cover rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {record.checkout_time
                  ? format(new Date(record.checkout_time), "hh:mm a")
                  : "-"}
              </td>
              <td className="px-6 py-4">
                {record.checkout_image ? (
                  <img
                    src={record.checkout_image}
                    alt="Check-out"
                    className="w-24 h-24 object-cover rounded"
                  />
                ) : (
                  "-"
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {record.checkout_time ? (
                  <span className="text-green-600">✅ Completed</span>
                ) : (
                  <span className="text-yellow-600">⏳ Checked In</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
