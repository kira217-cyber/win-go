// src/components/admin/WithdrawRequest.jsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const API = `${import.meta.env.VITE_API_URL}/api/withdraw-requests`;

const WithdrawRequest = () => {
  const queryClient = useQueryClient();

  // Local state for instant UI feedback
  const [localFilters, setLocalFilters] = useState({
    status: "all",
    search: "",
  });

  // Actual query filters (updated after debounce)
  const [queryFilters, setQueryFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    limit: 15,
  });

  const [approveModal, setApproveModal] = useState({
    open: false,
    id: null,
    note: "",
  });

  const [rejectModal, setRejectModal] = useState({
    open: false,
    id: null,
    reason: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryFilters((prev) => ({
        ...prev,
        search: localFilters.search.trim(),
        page: 1,
      }));
    }, 600);

    return () => clearTimeout(timer);
  }, [localFilters.search]);

  // Sync status change immediately
  useEffect(() => {
    setQueryFilters((prev) => ({
      ...prev,
      status: localFilters.status,
      page: 1,
    }));
  }, [localFilters.status]);

  // Fetch withdrawal requests
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["withdraw-requests", queryFilters],
    queryFn: () =>
      axios.get(API, { params: queryFilters }).then((res) => res.data),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, note }) => axios.put(`${API}/${id}/approve`, { note }),
    onSuccess: () => {
      toast.success("Withdrawal request approved!");
      queryClient.invalidateQueries(["withdraw-requests"]);
      setApproveModal({ open: false, id: null, note: "" });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      axios.put(`${API}/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success("Withdrawal request rejected & balance refunded!");
      queryClient.invalidateQueries(["withdraw-requests"]);
      setRejectModal({ open: false, id: null, reason: "" });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to reject"),
  });

  const handlePageChange = (newPage) => {
    setQueryFilters((prev) => ({ ...prev, page: newPage }));
  };

  const openApproveModal = (id) =>
    setApproveModal({ open: true, id, note: "" });
  const openRejectModal = (id) =>
    setRejectModal({ open: true, id, reason: "" });

  const confirmApprove = () => {
    if (!approveModal.id) return;
    approveMutation.mutate({
      id: approveModal.id,
      note: approveModal.note.trim(),
    });
  };

  const confirmReject = () => {
    if (!rejectModal.id) return;
    if (!rejectModal.reason.trim()) {
      return toast.error("Rejection reason is required");
    }
    rejectMutation.mutate({
      id: rejectModal.id,
      reason: rejectModal.reason.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-orange-300">
        <FaSpinner className="animate-spin text-5xl" />
        <span className="ml-4 text-xl">Loading withdrawal requests...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-red-400 text-xl font-medium">
        Failed to load withdrawal requests. Please try again later.
      </div>
    );
  }

  const { data: requests = [], pagination = {} } = data || {};
  const { totalPages = 1, page = 1 } = pagination;

  // Helper to format customFields for display
  const formatCustomFields = (fields) => {
    if (!fields || Object.keys(fields).length === 0) return "—";
    return Object.entries(fields)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent tracking-tight">
          Withdrawal Requests
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 text-lg pointer-events-none" />
            <input
              type="text"
              placeholder="Search by trx ID..."
              value={localFilters.search}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-12 pr-5 py-3.5 bg-black/50 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 transition-all"
            />
            {isFetching && localFilters.search && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <FaSpinner className="animate-spin text-orange-400 text-sm" />
              </div>
            )}
          </div>

          <select
            value={localFilters.status}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="px-6 py-3.5 bg-black/50 border border-red-800/50 rounded-xl text-orange-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 transition-all cursor-pointer min-w-[180px]"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-red-800/40 bg-gradient-to-b from-orange-950/60 to-red-950/50 shadow-2xl shadow-red-950/30">
          <table className="min-w-full divide-y divide-red-900/30">
            <thead className="bg-black/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                  Custom Fields
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                  Trx ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20">
              {requests.map((req) => (
                <tr
                  key={req._id}
                  className="hover:bg-red-950/50 transition-colors duration-150"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-100">
                      {req.user?.firstName} {req.user?.lastName || ""}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-lg font-bold text-orange-400">
                    {req.amount} BDT
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-orange-200">
                    {req.method?.methodName?.en ||
                      req.method?.methodName?.bn ||
                      "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-orange-200">
                    {formatCustomFields(req.customFields)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-orange-200 font-mono">
                    {req.transactionId || "N/A"}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`px-4 py-1.5 inline-flex text-xs font-semibold rounded-full border ${
                        req.status === "pending"
                          ? "bg-yellow-900/50 text-yellow-300 border-yellow-700/60"
                          : req.status === "approved"
                            ? "bg-green-900/50 text-green-300 border-green-700/60"
                            : "bg-red-900/50 text-red-300 border-red-700/60"
                      }`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    {req.status === "pending" && (
                      <div className="flex gap-4 justify-end items-center">
                        <button
                          onClick={() => openApproveModal(req._id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-medium transition-all shadow-sm shadow-green-900/40 hover:shadow-md hover:scale-105 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <FaCheck size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(req._id)}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 rounded-lg text-white font-medium transition-all shadow-sm shadow-red-900/40 hover:shadow-md hover:scale-105 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <FaTimes size={14} />
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
            <div
              key={req._id}
              className="bg-gradient-to-b from-orange-950/70 to-red-950/60 border border-red-800/40 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-red-900/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-orange-100">
                    {req.user?.firstName} {req.user?.lastName || ""}
                  </h3>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
                    req.status === "pending"
                      ? "bg-yellow-900/50 text-yellow-300 border-yellow-700/60"
                      : req.status === "approved"
                        ? "bg-green-900/50 text-green-300 border-green-700/60"
                        : "bg-red-900/50 text-red-300 border-red-700/60"
                  }`}
                >
                  {req.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-6 text-sm">
                <div>
                  <span className="text-orange-300 block mb-1">Amount</span>
                  <p className="text-2xl font-bold text-orange-400">
                    {req.amount} BDT
                  </p>
                </div>
                <div>
                  <span className="text-orange-300 block mb-1">Trx ID</span>
                  <p className="font-mono text-orange-200 truncate">
                    {req.transactionId || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-orange-300 block mb-1">Method</span>
                  <p className="text-orange-100">
                    {req.method?.methodName?.en ||
                      req.method?.methodName?.bn ||
                      "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-orange-300 block mb-1">
                    Custom Fields
                  </span>
                  <p className="text-orange-200 break-words">
                    {formatCustomFields(req.customFields)}
                  </p>
                </div>
              </div>

              {req.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-4 mt-5">
                  <button
                    onClick={() => openApproveModal(req._id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 py-3.5 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-medium transition-all shadow-md shadow-green-900/30 hover:shadow-lg hover:scale-[1.02] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FaCheck size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(req._id)}
                    disabled={rejectMutation.isPending}
                    className="flex-1 py-3.5 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 rounded-xl text-white font-medium transition-all shadow-md shadow-red-900/30 hover:shadow-lg hover:scale-[1.02] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FaTimes size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center mt-10 gap-6">
            <button
              onClick={() =>
                handlePageChange(Math.max(1, queryFilters.page - 1))
              }
              disabled={queryFilters.page === 1}
              className="px-8 py-3 bg-black/50 border border-red-800/50 rounded-xl text-orange-200 hover:text-orange-100 hover:bg-red-950/70 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed min-w-[120px]"
            >
              Previous
            </button>

            <span className="text-lg font-medium text-orange-300">
              Page {queryFilters.page} of {totalPages}
            </span>

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, queryFilters.page + 1))
              }
              disabled={queryFilters.page === totalPages}
              className="px-8 py-3 bg-black/50 border border-red-800/50 rounded-xl text-orange-200 hover:text-orange-100 hover:bg-red-950/70 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed min-w-[120px]"
            >
              Next
            </button>
          </div>
        )}

        {/* Approve Modal */}
        {approveModal.open && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-orange-950 to-red-950 border border-red-800/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-950/60">
              <h3 className="text-2xl font-bold text-orange-100 mb-5">
                Approve Withdrawal
              </h3>
              <p className="text-orange-200/90 mb-6">
                Are you sure you want to approve this withdrawal request?
              </p>
              <textarea
                value={approveModal.note}
                onChange={(e) =>
                  setApproveModal({ ...approveModal, note: e.target.value })
                }
                placeholder="Optional approval note..."
                className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all min-h-[100px]"
              />
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() =>
                    setApproveModal({ open: false, id: null, note: "" })
                  }
                  className="px-8 py-3 bg-gray-800/70 hover:bg-gray-700 rounded-xl text-orange-200 hover:text-orange-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={approveMutation.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-green-900/40 disabled:opacity-60 cursor-pointer"
                >
                  {approveMutation.isPending
                    ? "Approving..."
                    : "Confirm Approve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-orange-950 to-red-950 border border-red-800/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-950/60">
              <h3 className="text-2xl font-bold text-orange-100 mb-5">
                Reject Withdrawal
              </h3>
              <p className="text-orange-200/90 mb-6">
                This will refund the amount to the user's balance.
                <br />
                Please provide a reason.
              </p>
              <textarea
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal({ ...rejectModal, reason: e.target.value })
                }
                placeholder="Enter rejection reason..."
                className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all min-h-[120px]"
              />
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() =>
                    setRejectModal({ open: false, id: null, reason: "" })
                  }
                  className="px-8 py-3 bg-gray-800/70 hover:bg-gray-700 rounded-xl text-orange-200 hover:text-orange-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={
                    rejectMutation.isPending || !rejectModal.reason.trim()
                  }
                  className={`px-8 py-3 rounded-xl text-white font-medium transition-all shadow-lg shadow-red-900/40 cursor-pointer ${
                    rejectModal.reason.trim()
                      ? "bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600"
                      : "bg-red-900/50 cursor-not-allowed opacity-60"
                  }`}
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawRequest;
