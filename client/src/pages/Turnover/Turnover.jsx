// src/pages/TurnoverDetails.jsx   (অথবা src/components/TurnoverDetails.jsx)
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import axios from "axios";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCheckCircle, FaSpinner } from "react-icons/fa";


import { useLanguage } from "../../context/LanguageProvider";
import useAuth from "../../hook/useAuth";

const API = `${import.meta.env.VITE_API_URL}`;

const Turnover = () => {
  const { isBangla } = useLanguage();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const {
    data: turnoverData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-turnovers", userId],
    queryFn: () =>
      axios
        .get(`${API}/api/user/my-turnovers`, { params: { userId } })
        .then((res) => res.data),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-5xl text-orange-500" />
      </div>
    );
  }

  if (isError || !turnoverData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-2xl">
        {isBangla
          ? "টার্নওভার লোড করতে সমস্যা হয়েছে"
          : "Failed to load turnover data"}
      </div>
    );
  }

  const turnovers = turnoverData.data || [];
  const totalRemaining = turnoverData.summary?.totalRemaining || 0;

  return (
    <div className="min-h-screen text-gray-100 py-10 px-4 sm:px-4 lg:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 cursor-pointer bg-gray-800/60 rounded-full hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="text-orange-400" />
          </button>
          <h1 className="text-3xl font-bold text-orange-200">
            {isBangla ? "টার্নওভারের বিস্তারিত" : "Turnover Details"}
          </h1>
        </div>

        {/* মোট সারাংশ (অপশনাল) */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 mb-10 border border-orange-800/40 shadow-xl">
          <h2 className="text-2xl font-bold text-orange-200 mb-4">
            {isBangla ? "মোট অবস্থা" : "Overall Status"}
          </h2>
          <p className="text-xl">
            {isBangla ? "বাকি টার্নওভার:" : "Total Remaining:"}{" "}
            <span
              className={
                totalRemaining > 0
                  ? "text-red-400 font-bold"
                  : "text-green-400 font-bold"
              }
            >
              ৳ {totalRemaining.toFixed(2)}
            </span>
          </p>
        </div>

        {/* Individual Turnover Progress Cards */}
        {turnovers.length === 0 ? (
          <p className="text-center text-gray-400 text-xl py-10">
            {isBangla ? "কোনো টার্নওভার নেই" : "No active turnovers found"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {turnovers.map((t) => {
              const progress = (t.completedTurnover / t.requiredTurnover) * 100;
              const isCompleted = t.remainingTurnover <= 0 || progress >= 100;

              return (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl overflow-hidden border shadow-lg ${
                    isCompleted
                      ? "bg-green-950/40 border-green-700/60"
                      : "bg-gray-900/60 border-orange-800/50"
                  }`}
                >
                  {/* Header */}
                  <div className="p-5 border-b border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-orange-200 text-lg">
                          {t.depositRequest?.method?.methodName?.[
                            isBangla ? "bn" : "en"
                          ] || "Deposit"}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          TxID: {t.depositRequest?.transactionId?.slice(0, 12)}
                          ...
                        </p>
                      </div>
                      {isCompleted && (
                        <FaCheckCircle className="text-green-400 text-2xl" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar Section */}
                  <div className="p-5">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-orange-300">
                          {isBangla ? "পূরণ হয়েছে" : "Completed"}
                        </span>
                        <span className="font-medium">
                          ৳ {t.completedTurnover.toFixed(2)} /{" "}
                          {t.requiredTurnover.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${
                            isCompleted ? "bg-green-500" : "bg-orange-500"
                          }`}
                        />
                      </div>

                      <p className="text-right text-xs mt-1 text-gray-400">
                        {progress.toFixed(1)}%
                      </p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Deposit</p>
                        <p className="font-medium">
                          ৳ {t.depositAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Bonus</p>
                        <p className="font-medium">
                          ৳ {t.bonusAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Required</p>
                        <p className="font-medium text-orange-300">
                          ৳ {t.requiredTurnover.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Remaining</p>
                        <p
                          className={
                            isCompleted
                              ? "text-green-400"
                              : "text-red-400 font-bold"
                          }
                        >
                          ৳ {t.remainingTurnover.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Turnover;
