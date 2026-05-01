import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaGift,
  FaWallet,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageProvider";
import useAuth from "../../hook/useAuth";

const API = import.meta.env.VITE_API_URL || "http://localhost:5007";

const money = (value) => {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

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
      <div className="min-h-screen flex items-center justify-center text-red-400 text-2xl text-center px-4">
        {isBangla
          ? "টার্নওভার লোড করতে সমস্যা হয়েছে"
          : "Failed to load turnover data"}
      </div>
    );
  }

  const turnovers = (turnoverData.data || []).filter((item) => {
    const requiredTurnover = Number(item.requiredTurnover || 0);
    const completedTurnover = Number(item.completedTurnover || 0);
    const remainingTurnover = Number(item.remainingTurnover || 0);

    const progress =
      requiredTurnover > 0 ? (completedTurnover / requiredTurnover) * 100 : 0;

    const isCompleted =
      remainingTurnover <= 0 || progress >= 100 || item.status === "completed";

    return !isCompleted;
  });
  const totalRemaining = Number(turnoverData.summary?.totalRemaining || 0);

  return (
    <div className="min-h-screen text-gray-100 py-8 px-4 mb-20">
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

        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-orange-800/40 shadow-xl">
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
              {money(totalRemaining)}
            </span>
          </p>
        </div>

        {turnovers.length === 0 ? (
          <p className="text-center text-gray-400 text-xl py-10">
            {isBangla ? "কোনো টার্নওভার নেই" : "No active turnovers found"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {turnovers.map((t) => {
              const requiredTurnover = Number(t.requiredTurnover || 0);
              const completedTurnover = Number(t.completedTurnover || 0);
              const remainingTurnover = Number(t.remainingTurnover || 0);

              const progress =
                requiredTurnover > 0
                  ? (completedTurnover / requiredTurnover) * 100
                  : 0;

              const isCompleted =
                remainingTurnover <= 0 ||
                progress >= 100 ||
                t.status === "completed";

              const isRedeemTurnover = t.sourceType === "refer-redeem";

              const title = isRedeemTurnover
                ? isBangla
                  ? "রিডিম টার্নওভার"
                  : "Redeem Turnover"
                : t.depositRequest?.method?.methodName?.[
                    isBangla ? "bn" : "en"
                  ] || "Deposit Turnover";

              const subTitle = isRedeemTurnover
                ? `${isBangla ? "রিডিম এমাউন্ট" : "Redeem Amount"}: ${money(
                    t.referRedeemHistory?.redeemAmount || t.depositAmount,
                  )}`
                : `TxID: ${
                    t.depositRequest?.transactionId
                      ? `${t.depositRequest.transactionId.slice(0, 12)}...`
                      : "-"
                  }`;

              return (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl overflow-hidden border shadow-lg ${
                    isCompleted
                      ? "bg-green-950/40 border-green-700/60"
                      : isRedeemTurnover
                        ? "bg-orange-950/40 border-orange-700/60"
                        : "bg-gray-900/60 border-orange-800/50"
                  }`}
                >
                  <div className="p-5 border-b border-gray-700/50">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isRedeemTurnover
                              ? "bg-orange-700/40 text-orange-300"
                              : "bg-green-700/30 text-green-300"
                          }`}
                        >
                          {isRedeemTurnover ? <FaGift /> : <FaWallet />}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-orange-200 text-lg truncate">
                            {title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1 truncate">
                            {subTitle}
                          </p>
                        </div>
                      </div>

                      {isCompleted && (
                        <FaCheckCircle className="text-green-400 text-2xl shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-orange-300">
                          {isBangla ? "পূরণ হয়েছে" : "Completed"}
                        </span>
                        <span className="font-medium">
                          {money(completedTurnover)} / {money(requiredTurnover)}
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
                        {Math.min(progress, 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoBox
                        label={
                          isRedeemTurnover
                            ? isBangla
                              ? "রিডিম"
                              : "Redeem"
                            : "Deposit"
                        }
                        value={money(t.depositAmount)}
                      />

                      <InfoBox label="Bonus" value={money(t.bonusAmount)} />

                      <InfoBox
                        label={isBangla ? "মাল্টিপ্লায়ার" : "Multiplier"}
                        value={`${Number(t.turnoverMultiplier || 0)}x`}
                      />

                      <InfoBox
                        label={isBangla ? "স্ট্যাটাস" : "Status"}
                        value={String(t.status || "active").toUpperCase()}
                        valueClass={
                          isCompleted ? "text-green-400" : "text-orange-300"
                        }
                      />

                      <InfoBox
                        label={isBangla ? "প্রয়োজন" : "Required"}
                        value={money(requiredTurnover)}
                        valueClass="text-orange-300"
                      />

                      <InfoBox
                        label={isBangla ? "বাকি" : "Remaining"}
                        value={money(remainingTurnover)}
                        valueClass={
                          isCompleted
                            ? "text-green-400"
                            : "text-red-400 font-bold"
                        }
                      />
                    </div>

                    {isRedeemTurnover && (
                      <div className="mt-4 rounded-xl border border-orange-700/30 bg-black/25 p-3 text-xs text-orange-100/80">
                        {isBangla
                          ? "এই টার্নওভারটি রেফার রিডিম থেকে তৈরি হয়েছে।"
                          : "This turnover was created from referral redeem."}
                      </div>
                    )}
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

const InfoBox = ({ label, value, valueClass = "text-gray-100" }) => {
  return (
    <div className="rounded-xl bg-black/20 border border-white/5 p-3">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className={`font-medium mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
};

export default Turnover;
