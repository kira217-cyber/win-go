// src/components/admin/WithdrawRequest.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const API = `${import.meta.env.VITE_API_URL}/api/withdraw-requests`;

const WithdrawRequest = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    limit: 15,
  });

  const [approveModal, setApproveModal] = useState({ open: false, id: null, note: "" });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: "" });

  // Fetch withdrawal requests
  const { data, isLoading, isError } = useQuery({
    queryKey: ["withdraw-requests", filters],
    queryFn: () =>
      axios.get(API, { params: filters }).then((res) => res.data),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, note }) =>
      axios.put(`${API}/${id}/approve`, { note }),
    onSuccess: () => {
      toast.success("Withdrawal request approved!");
      queryClient.invalidateQueries(["withdraw-requests"]);
      setApproveModal({ open: false, id: null, note: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to approve");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      axios.put(`${API}/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success("Withdrawal request rejected & balance refunded!");
      queryClient.invalidateQueries(["withdraw-requests"]);
      setRejectModal({ open: false, id: null, reason: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reject");
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const openApproveModal = (id) => {
    setApproveModal({ open: true, id, note: "" });
  };

  const openRejectModal = (id) => {
    setRejectModal({ open: true, id, reason: "" });
  };

  const confirmApprove = () => {
    if (!approveModal.id) return;
    approveMutation.mutate({ id: approveModal.id, note: approveModal.note.trim() });
  };

  const confirmReject = () => {
    if (!rejectModal.id) return;
    if (!rejectModal.reason.trim()) {
      return toast.error("Rejection reason is required");
    }
    rejectMutation.mutate({ id: rejectModal.id, reason: rejectModal.reason.trim() });
  };

  if (isLoading) {
    return <div className="text-center py-10 text-xl">Loading withdrawal requests...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 py-10 text-xl">
        Failed to load withdrawal requests
      </div>
    );
  }

  const { data: requests = [], pagination = {} } = data || {};
  const { totalPages = 1, page = 1 } = pagination;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Withdrawal Requests
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 rounded-lg shadow ">
        <input
          type="text"
          placeholder="Search by phone / name / trx ID"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trx ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req._id} className=" transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {req.user?.firstName} {req.user?.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {req.user?.phone || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {req.amount} BDT
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {req.method?.methodName?.en || req.method?.methodName?.bn || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {req.transactionId || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      req.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : req.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {req.status === "pending" && (
                    <div className="flex gap-5 justify-end">
                      <button
                        onClick={() => openApproveModal(req._id)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(req._id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-5">
        {requests.map((req) => (
          <div key={req._id} className=" rounded-xl shadow-md p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {req.user?.firstName} {req.user?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{req.user?.phone || "N/A"}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  req.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : req.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {req.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="font-medium">Amount:</span>
                <p className="text-lg font-bold">{req.amount} BDT</p>
              </div>
              <div>
                <span className="font-medium">Trx ID:</span>
                <p>{req.transactionId || "—"}</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Method:</span>
                <p>{req.method?.methodName?.en || req.method?.methodName?.bn || "N/A"}</p>
              </div>
            </div>

            {req.status === "pending" && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => openApproveModal(req._id)}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => openRejectModal(req._id)}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-5">
          <button
            onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            className="px-6 py-2.5 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Previous
          </button>
          <span className="font-medium text-lg">
            Page {filters.page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, filters.page + 1))}
            disabled={filters.page === totalPages}
            className="px-6 py-2.5 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className=" rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Approve Withdrawal Request</h3>
            <p className="text-gray-600 mb-5">
              Are you sure you want to approve this withdrawal?
            </p>
            <textarea
              value={approveModal.note}
              onChange={(e) =>
                setApproveModal({ ...approveModal, note: e.target.value })
              }
              placeholder="Optional approval note..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-5 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setApproveModal({ open: false, id: null, note: "" })}
                className="px-5 py-2.5 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reject Withdrawal Request</h3>
            <p className="text-gray-600 mb-5">
              This will refund the amount to the user's balance.
            </p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-5 min-h-[110px] focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setRejectModal({ open: false, id: null, reason: "" })}
                className="px-5 py-2.5 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectModal.reason.trim()}
                className={`px-5 py-2.5 rounded-lg text-white transition ${
                  rejectModal.reason.trim()
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-400 cursor-not-allowed"
                }`}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawRequest;