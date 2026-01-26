// src/components/DepositHistory.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaHistory,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageProvider";
import useAuth from "../../hook/useAuth";

const API = `${import.meta.env.VITE_API_URL}`;

const DepositHistory = () => {
  const { isBangla } = useLanguage();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["deposit-history", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not found");

      const { data } = await axios.get(`${API}/api/deposit-requests/deposit-history/${userId}`);
      return data;
    },
    enabled: !!userId,
    retry: 1,
  });

  const deposits = response?.data || [];

  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        label: isBangla ? "অপেক্ষমাণ" : "Pending",
        color: "bg-yellow-900/50 text-yellow-300 border-yellow-600/60",
      },
      approved: {
        label: isBangla ? "অনুমোদিত" : "Approved",
        color: "bg-green-900/50 text-green-300 border-green-600/60",
      },
      rejected: {
        label: isBangla ? "প্রত্যাখ্যাত" : "Rejected",
        color: "bg-red-900/50 text-red-300 border-red-600/60",
      },
    };

    const style = styles[status?.toLowerCase()] || styles.pending;

    return (
      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border ${style.color}`}>
        {status === "pending" && <FaClock className="mr-1.5" />}
        {status === "approved" && <FaCheckCircle className="mr-1.5" />}
        {status === "rejected" && <FaTimesCircle className="mr-1.5" />}
        {style.label}
      </span>
    );
  };

  // ─── States ───
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-200 text-xl p-6 text-center">
        {isBangla ? "ইতিহাস দেখতে লগইন করুন" : "Please login to view history"}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-4">
        <FaSpinner className="animate-spin text-5xl text-orange-500" />
        <span className="text-2xl text-orange-200">
          {isBangla ? "লোড হচ্ছে..." : "Loading deposit history..."}
        </span>
      </div>
    );
  }

  if (isError) {
    const errMsg = error?.response?.data?.message || error?.message || "Unknown error";
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-xl px-4 py-8 text-center">
        <div className="max-w-md">
          <FaExclamationTriangle className="text-6xl mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">
            {isBangla ? "ত্রুটি ঘটেছে" : "Error"}
          </h2>
          <p>{errMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 py-10 px-4 sm:px-4 lg:px-4 mb-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-2xl shadow-red-950/40 p-4 border border-red-800/30"
        >
          {/* Back Button + Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-800/70 to-red-900/70 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-medium transition-all shadow-md hover:shadow-lg"
              >
                <FaArrowLeft />
                {isBangla ? "ফিরে যান" : "Back"}
              </button>

              <h1 className="text-xl md:text-2xl font-bold text-orange-200">
                {isBangla ? "ডিপোজিটের ইতিহাস" : "Deposit History"}
              </h1>
            </div>

            <div className="text-orange-300/80 text-lg font-medium">
              {deposits.length} {isBangla ? "টি রেকর্ড" : "records"}
            </div>
          </div>

          {/* No records state */}
          {deposits.length === 0 ? (
            <div className="bg-black/50 rounded-2xl p-12 text-center border border-red-800/40 shadow-inner">
              <FaHistory className="text-8xl text-orange-600/20 mx-auto mb-6" />
              <h3 className="text-2xl md:text-3xl font-semibold text-orange-100 mb-4">
                {isBangla ? "কোনো ডিপোজিট রেকর্ড নেই" : "No deposit records yet"}
              </h3>
              <p className="text-orange-300/70 text-lg max-w-md mx-auto">
                {isBangla
                  ? "আপনি এখনও কোনো ডিপোজিটের অনুরোধ করেননি"
                  : "You haven't made any deposit requests yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {deposits.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/60 rounded-xl p-6 border border-red-800/40 hover:border-orange-600/50 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-orange-900/40 flex items-center justify-center">
                        <FaMoneyBillWave className="text-orange-400 text-2xl" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-100">
                          ৳ {Number(req.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-orange-400/80 mt-1">
                          {new Date(req.createdAt).toLocaleString(isBangla ? "bn-BD" : "en-US")}
                        </p>
                      </div>
                    </div>

                    <div>{getStatusBadge(req.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                    <div>
                      <span className="text-orange-300 font-medium">
                        {isBangla ? "পদ্ধতি :" : "Method :"}
                      </span>{" "}
                      {req.method?.methodName?.[isBangla ? "bn" : "en"] ||
                        req.method?.methodName?.en ||
                        "—"}
                    </div>

                    <div>
                      <span className="text-orange-300 font-medium">
                        {isBangla ? "ট্রানজেকশন আইডি :" : "Trx ID :"}
                      </span>{" "}
                      <span className="font-mono">{req.transactionId}</span>
                    </div>
                  </div>

                  {/* Bonus & Turnover (optional - shown if exist) */}
                  {(req.bonusAmount > 0 || req.turnoverTargetAdded > 0) && (
                    <div className="mt-4 p-4 bg-green-950/40 rounded-lg border border-green-800/40 text-sm">
                      {req.bonusAmount > 0 && (
                        <p>
                          <span className="text-green-300 font-medium">
                            {isBangla ? "বোনাস :" : "Bonus :"}
                          </span>{" "}
                          ৳ {Number(req.bonusAmount).toLocaleString()}
                        </p>
                      )}
                      {req.turnoverTargetAdded > 0 && (
                        <p>
                          <span className="text-green-300 font-medium">
                            {isBangla ? "টার্নওভার যোগ :" : "Turnover Added :"}
                          </span>{" "}
                          ৳ {Number(req.turnoverTargetAdded).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reject reason */}
                  {req.rejectReason && req.status?.toLowerCase() === "rejected" && (
                    <div className="mt-4 p-4 bg-red-950/50 rounded-lg border border-red-800/40">
                      <p className="text-red-300 font-medium mb-1">
                        {isBangla ? "প্রত্যাখ্যানের কারণ :" : "Reject Reason :"}
                      </p>
                      <p className="text-red-200/90">{req.rejectReason}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DepositHistory;