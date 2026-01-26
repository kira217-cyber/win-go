import React from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  FaUsers,
  FaGamepad,
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

// Fetch total users
const fetchUserCount = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/user/count`,
  );
  return data.totalUsers || 0;
};

// Fetch total games
const fetchGameCount = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/games/count`,
  );
  return data.totalGames || 0;
};

const fetchPendingDepositCount = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/deposit-requests/pending/count`,
  );
  return data.pendingDepositRequests || 0;
};

const fetchPendingWithdrawCount = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/withdraw-requests/pending/count`,
  );
  return data.pendingWithdrawRequests || 0;
};

// Dashboard.jsx এর জন্য
const fetchApprovedDepositBalance = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/deposit-requests/total-approved-balance`,
  );
  return data.totalDepositBalance || 0;
};

// Dashboard.jsx এর জন্য
const fetchApprovedWithdrawBalance = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/withdraw-requests/total-approved-balance`,
  );
  return data.totalWithdrawBalance || 0;
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Users count query
  const {
    data: totalUsers = 0,
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ["userCount"],
    queryFn: fetchUserCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Games count query
  const {
    data: totalGames = 0,
    isLoading: gamesLoading,
    isError: gamesError,
  } = useQuery({
    queryKey: ["gameCount"],
    queryFn: fetchGameCount,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  //   Pending Deposit
  const { data: pendingDeposits = 0, isLoading: pendingLoading } = useQuery({
    queryKey: ["pendingDepositCount"],
    queryFn: fetchPendingDepositCount,
    staleTime: 5 * 60 * 1000,
  });

  const { data: pendingWithdraws = 0, isLoading: pendingWithdrawLoading } =
    useQuery({
      queryKey: ["pendingWithdrawCount"],
      queryFn: fetchPendingWithdrawCount,
      staleTime: 5 * 60 * 1000,
    });

  const { data: totalWithdrawBalance = 0, isLoading: withdrawLoading } =
    useQuery({
      queryKey: ["approvedWithdrawBalance"],
      queryFn: fetchApprovedWithdrawBalance,
      staleTime: 5 * 60 * 1000,
    });

  const { data: totalDepositBalance = 0, isLoading: depositLoading } = useQuery(
    {
      queryKey: ["approvedDepositBalance"],
      queryFn: fetchApprovedDepositBalance,
      staleTime: 5 * 60 * 1000,
    },
  );

  const stats = [
    {
      title: "All Users",
      amount: usersLoading
        ? "..."
        : usersError
          ? "Error"
          : totalUsers.toLocaleString(),
      icon: <FaUsers className="text-4xl text-orange-400" />,
      path: "/all-user",
      color: "from-orange-600/20 to-red-600/10",
    },
    {
      title: "All Game",
      amount: gamesLoading
        ? "..."
        : gamesError
          ? "Error"
          : totalGames.toLocaleString(),
      icon: <FaGamepad className="text-4xl text-orange-400" />,
      path: "/add-game",
      color: "from-orange-600/20 to-red-600/10",
    },
    {
      title: "Pending Deposit Request",
      amount: pendingLoading ? "..." : pendingDeposits.toLocaleString(),
      icon: <FaClock className="text-4xl text-yellow-400" />,
      path: "/deposit-request",
      color: "from-yellow-600/20 to-amber-600/10",
    },
    {
      title: "Pending Withdraw Request",
      amount: pendingWithdrawLoading
        ? "..."
        : pendingWithdraws.toLocaleString(),
      icon: <FaExclamationTriangle className="text-4xl text-red-400" />,
      path: "/withdraw-request",
      color: "from-red-600/20 to-rose-600/10",
    },
    {
      title: "All Deposit Balance",
      amount: depositLoading
        ? "..."
        : `৳ ${totalDepositBalance.toLocaleString()}`,
      icon: <FaMoneyBillWave className="text-4xl text-green-400" />,
      color: "from-green-600/20 to-emerald-600/10",
    },
    {
      title: "All Withdraw Balance",
      amount: withdrawLoading
        ? "..."
        : `৳ ${totalWithdrawBalance.toLocaleString()}`,
      icon: <FaHandHoldingUsd className="text-4xl text-purple-400" />,
      color: "from-purple-600/20 to-indigo-600/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 md:p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-orange-300/80 mt-2 text-lg">
          Overview of platform statistics
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.path)}
            className={`
              bg-black/40 backdrop-blur-sm border border-red-800/40 
              rounded-2xl shadow-xl shadow-red-900/30 px-6 py-16 
              cursor-pointer overflow-hidden relative
              hover:border-orange-500/60 transition-all duration-300
            `}
          >
            {/* Gradient background effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-30 pointer-events-none`}
            />

            <div className="relative z-10 flex items-start justify-between">
              {/* Left - Icon & Title */}
              <div>
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-3xl md:text-4xl font-extrabold text-orange-400">
                  {item.amount}
                </p>
              </div>

              {/* Right - Arrow indicator */}
              <div className="text-orange-400/70 text-3xl mt-2">→</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
