import React, { useMemo, useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaPencilAlt,
  FaUser,
  FaPhone,
  FaWallet,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_URL;
const USERS_PER_PAGE = 15;

const fetchUsers = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/user/admin`);
  return Array.isArray(data) ? data : data?.users || [];
};

const updateUserStatus = async ({ id, status }) => {
  const { data } = await axios.patch(
    `${BASE_URL}/api/user/admin/${id}/status`,
    { status },
  );
  return data;
};

const AllUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return users.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [users, currentPage]);

  const mutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: (err) => {
      const message =
        err.response?.data?.message || "Failed to update user status";
      toast.error(message, {
        position: "top-right",
        autoClose: 4000,
      });
    },
  });

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxButtons = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-orange-300/80">
          Showing{" "}
          <span className="font-semibold text-orange-200">
            {(currentPage - 1) * USERS_PER_PAGE + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-orange-200">
            {Math.min(currentPage * USERS_PER_PAGE, users.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-orange-200">{users.length}</span>{" "}
          users
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-black/50 border border-red-800/50 text-orange-200 hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaChevronLeft />
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-10 h-10 rounded-lg border font-semibold cursor-pointer ${
                currentPage === page
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-500"
                  : "bg-black/50 border-red-800/50 text-orange-200 hover:bg-red-900/50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-black/50 border border-red-800/50 text-orange-200 hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-orange-300 text-xl font-medium flex items-center gap-3">
          <div className="w-5 h-5 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-400 font-medium text-xl">
        Error: {error.message || "Failed to load users"}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 p-4 md:p-6"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent tracking-tight">
          All Users
        </h1>

        <div className="text-sm text-orange-300/80">
          Total:{" "}
          <span className="font-semibold text-orange-200">
            {users.length || 0}
          </span>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-red-800/40 shadow-2xl shadow-red-950/40 bg-black/40 backdrop-blur-sm">
        <table className="min-w-full divide-y divide-red-900/50">
          <thead className="bg-gradient-to-r from-red-950/80 to-black/80">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 tracking-wide">
                <div className="flex items-center gap-2">
                  <FaUser className="text-orange-400" /> User
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 tracking-wide">
                <div className="flex items-center gap-2">
                  <FaPhone className="text-orange-400" /> Phone
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 tracking-wide">
                <div className="flex items-center gap-2">
                  <FaWallet className="text-orange-400" /> Balance
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 tracking-wide">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-red-900/30">
            {paginatedUsers.map((user) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-red-950/40 transition-colors duration-200"
              >
                <td className="px-6 py-4 font-medium text-orange-100">
                  {user.firstName} {user.lastName}
                </td>

                <td className="px-6 py-4 text-gray-300">{user.phone}</td>

                <td className="px-6 py-4">
                  <span className="font-semibold text-green-400">
                    ৳ {Number(user.balance || 0).toFixed(2)}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <select
                    value={user.status || "active"}
                    disabled={mutation.isPending}
                    onChange={(e) =>
                      mutation.mutate({
                        id: user._id,
                        status: e.target.value,
                      })
                    }
                    className="bg-black/60 border border-red-800/70 text-orange-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer hover:border-orange-600 transition-all disabled:opacity-60"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/user-details/${user._id}`)}
                    className="bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-red-900/40 hover:shadow-lg hover:shadow-red-800/50 cursor-pointer font-medium"
                  >
                    <FaPencilAlt className="w-4 h-4" />
                    Details
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-5">
        {paginatedUsers.map((user) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-red-950/70 via-black/80 to-orange-950/40 rounded-xl border border-red-800/40 p-5 shadow-xl shadow-red-950/30 hover:shadow-red-900/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4 gap-3">
              <h2 className="text-xl font-bold text-orange-100">
                {user.firstName} {user.lastName}
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.status === "active"
                    ? "bg-green-900/60 text-green-300 border border-green-700/40"
                    : user.status === "inactive"
                      ? "bg-yellow-900/60 text-yellow-300 border border-yellow-700/40"
                      : "bg-red-900/60 text-red-300 border border-red-700/40"
                }`}
              >
                {user.status || "active"}
              </span>
            </div>

            <div className="space-y-3 text-gray-300 mb-5">
              <p className="flex items-center gap-2">
                <FaPhone className="text-orange-400" />
                <span>{user.phone}</span>
              </p>

              <p className="flex items-center gap-2">
                <FaWallet className="text-green-400" />
                <span className="font-semibold">
                  ৳ {Number(user.balance || 0).toFixed(2)}
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={user.status || "active"}
                disabled={mutation.isPending}
                onChange={(e) =>
                  mutation.mutate({
                    id: user._id,
                    status: e.target.value,
                  })
                }
                className="flex-1 bg-black/60 border border-red-800/70 text-orange-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer hover:border-orange-600 transition-all disabled:opacity-60"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>

              <button
                onClick={() => navigate(`/user-details/${user._id}`)}
                className="flex-1 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-red-900/40 hover:shadow-lg hover:shadow-red-800/50 font-medium cursor-pointer"
              >
                <FaPencilAlt />
                Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {users.length > 0 && <Pagination />}

      {users.length === 0 && !isLoading && (
        <div className="text-center py-20 text-orange-300/70 text-xl font-medium">
          No users found.
        </div>
      )}
    </motion.div>
  );
};

export default AllUser;
