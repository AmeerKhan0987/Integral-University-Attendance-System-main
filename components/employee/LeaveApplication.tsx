import React, { useState, useEffect } from "react";
import axios from "axios";
import { User } from "../../types";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface LeaveApplicationProps {
  user: User;
}

interface LeaveStatusData {
  id: number;
  date_from: string;
  date_to: string;
  reason: string;
  status: string;
}

export default function LeaveApplication({ user }: LeaveApplicationProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pendingLeave, setPendingLeave] = useState<LeaveStatusData | null>(
    null
  );

  // ✅ Fetch current pending leave for logged-in employee
  const fetchPendingLeave = async () => {
    try {
      const res = await axios.get(
        `http://localhost/zaphira-organic-farm-attendance-system-2/zaphira-backend/api/get_employee_leaves.php?employee_id=${user.id}`
      );
      if (res.data.success && res.data.data.length > 0) {
        const pending = res.data.data.find(
          (l: LeaveStatusData) => l.status === "Pending"
        );
        setPendingLeave(pending || null);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  useEffect(() => {
    fetchPendingLeave();
    const interval = setInterval(fetchPendingLeave, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // ✅ Handle leave submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateFrom || !dateTo || !reason) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost/zaphira-organic-farm-attendance-system-2/zaphira-backend/api/apply_leave.php",
        {
          employee_id: user.id,
          date_from: dateFrom,
          date_to: dateTo,
          reason: reason,
        }
      );

      if (res.data.success) {
        setMessage("Leave application submitted! Waiting for approval.");
        setPendingLeave({
          id: Date.now(),
          date_from: dateFrom,
          date_to: dateTo,
          reason,
          status: "Pending",
        });
        setDateFrom("");
        setDateTo("");
        setReason("");
      } else {
        setMessage("❌ " + res.data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Failed to submit leave.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        Apply for Leave
      </h2>

      {/* 🟡 Pending Leave Notification */}
      {pendingLeave && pendingLeave.status === "Pending" && (
        <div className="flex items-center bg-yellow-100 text-yellow-700 p-3 rounded-md mb-4">
          ⏳ Your leave from <b className="mx-1">{pendingLeave.date_from}</b> to{" "}
          <b className="mx-1">{pendingLeave.date_to}</b> is{" "}
          <b>pending approval</b>.
        </div>
      )}

      {/* 🟢 Approved Notification */}
      {pendingLeave && pendingLeave.status === "Approved" && (
        <div className="flex items-center bg-green-100 text-green-700 p-3 rounded-md mb-4">
          ✅ Your leave from {pendingLeave.date_from} to {pendingLeave.date_to}{" "}
          has been <b>approved</b>.
        </div>
      )}

      {/* 🔴 Rejected Notification */}
      {pendingLeave && pendingLeave.status === "Rejected" && (
        <div className="flex items-center bg-red-100 text-red-700 p-3 rounded-md mb-4">
          ❌ Your leave request was <b>rejected</b>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="dateFrom"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              From
            </label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="dateTo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              To
            </label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason for Leave
          </label>
          <textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div className="flex items-center justify-end">
          {message && (
            <p
              className={`text-sm mr-4 ${
                message.includes("Waiting")
                  ? "text-yellow-600"
                  : message.includes("approved")
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}
