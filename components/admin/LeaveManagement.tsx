import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface Leave {
  id: number;
  employee_id: number;
  employee_name: string;
  date_from: string;
  date_to: string;
  reason: string;
  status: string;
}

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState<Leave[]>([]);

  // ✅ Fetch all leaves
  const fetchLeaves = async () => {
    try {
      const res = await axios.get(
        "http://localhost/zaphira-backend/api/get_leaves.php"
      );
      if (res.data.success) setLeaves(res.data.data);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  // ✅ Update leave status (approve/reject)
  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.post(
        "http://localhost/zaphira-backend/api/update_leave_status.php",
        { id, status },
        { headers: { "Content-Type": "application/json" } }
      );
      fetchLeaves();
    } catch (err) {
      console.error("Error updating leave status:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const otherLeaves = leaves.filter((l) => l.status !== "Pending");

  // ✅ Helper: Format date nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      {/* Pending Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Pending Leave Requests
        </h2>
        {pendingLeaves.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase">
                    Employee
                  </th>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase">
                    Dates
                  </th>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase">
                    Reason
                  </th>
                  <th className="py-3 px-5 text-center text-sm font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-5 font-medium text-gray-800">
                      {leave.employee_name || "Unknown"}
                    </td>
                    <td className="py-3 px-5 text-gray-700">
                      {formatDate(leave.date_from)} →{" "}
                      {formatDate(leave.date_to)}
                    </td>
                    <td className="py-3 px-5 text-gray-600">{leave.reason}</td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => updateStatus(leave.id, "Approved")}
                          className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-full"
                          title="Approve"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateStatus(leave.id, "Rejected")}
                          className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-full"
                          title="Reject"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No pending leave requests.</p>
        )}
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Leave History</h2>
        {otherLeaves.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase">
                    Employee
                  </th>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase">
                    Dates
                  </th>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {otherLeaves.map((leave) => (
                  <tr key={leave.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-5 font-medium text-gray-800">
                      {leave.employee_name || "Unknown"}
                    </td>
                    <td className="py-3 px-5 text-gray-700">
                      {formatDate(leave.date_from)} →{" "}
                      {formatDate(leave.date_to)}
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No leave history available.</p>
        )}
      </div>
    </div>
  );
}
