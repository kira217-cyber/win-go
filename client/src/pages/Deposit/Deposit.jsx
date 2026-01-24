// src/components/Deposit.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router"; 
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaHistory,
  FaPaperPlane,
  FaMoneyBillWave,
  FaSpinner,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageProvider";
import useAuth from "../../hook/useAuth";

const API = `${import.meta.env.VITE_API_URL}`;

const Deposit = () => {
  const { isBangla } = useLanguage();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedMethodType, setSelectedMethodType] = useState(null);
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Fetch deposit methods
  const {
    data: methods = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: () =>
      axios
        .get(`${API}/api/add-deposit`)
        .then((res) => res.data.data || res.data || []),
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: (payload) => axios.post(`${API}/api/deposit-requests`, payload),
    onSuccess: () => {
      toast.success(
        isBangla
          ? "ডিপোজিট রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!"
          : "Deposit request submitted successfully!",
        {
          position: "top-right",
          autoClose: 4000,
          theme: "dark",
        },
      );

      // Reset form
      setSelectedMethod(null);
      setSelectedMethodType(null);
      setAmount("");
      setTransactionId("");

      // Optional: Invalidate queries to refresh history
      queryClient.invalidateQueries(["deposit-history"]);

      // Navigate to history page
      navigate("/deposit-history"); // ← Change this path to match your routing
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        (isBangla
          ? "রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে"
          : "Failed to submit request");
      toast.error(msg, { theme: "dark" });
    },
  });

  // Form validation
  const isFormValid =
    !!selectedMethod?._id &&
    (selectedMethod.methodTypes?.length === 0 || !!selectedMethodType) &&
    Number(amount) >= 100 &&
    transactionId.trim().length > 0;

  const handleSubmit = () => {
    if (!selectedMethod?._id) {
      return toast.error(
        isBangla
          ? "ডিপোজিট পদ্ধতি নির্বাচন করুন"
          : "Please select a deposit method",
      );
    }
    if (selectedMethod.methodTypes?.length > 0 && !selectedMethodType) {
      return toast.error(
        isBangla ? "পদ্ধতির ধরন নির্বাচন করুন" : "Please select method type",
      );
    }
    if (!amount || Number(amount) < 100) {
      return toast.error(
        isBangla ? "সর্বনিম্ন ডিপোজিট ১০০ টাকা" : "Minimum deposit is 100 BDT",
      );
    }
    if (!transactionId.trim()) {
      return toast.error(
        isBangla ? "ট্রানজেকশন আইডি দিন" : "Transaction ID is required",
      );
    }

    mutation.mutate({
      userId,
      methodId: selectedMethod._id,
      methodType: selectedMethodType || null,
      amount: Number(amount),
      transactionId: transactionId.trim(),
    });
  };

  // ─── Loading ───
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-200 text-xl p-6 text-center">
        {isBangla
          ? "ডিপোজিট করতে লগইন করুন"
          : "Please log in to make a deposit"}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-4">
        <FaSpinner className="animate-spin text-4xl text-orange-500" />
        <span className="text-xl text-orange-200">
          {isBangla ? "লোড হচ্ছে..." : "Loading deposit methods..."}
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-xl p-6 text-center">
        {isBangla
          ? "ডিপোজিট পদ্ধতি লোড করতে সমস্যা হয়েছে"
          : "Failed to load deposit methods"}
        <br />
        {error?.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 py-10 px-4 sm:px-8 lg:px-4 ">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50/10 backdrop-blur-sm rounded-2xl shadow-2xl shadow-red-900/30 p-6 md:p-10 border border-white"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <h1 className="text-3xl md:text-4xl font-bold text-orange-200">
              {isBangla ? "ডিপোজিট করুন" : "Deposit Funds"}
            </h1>

            <button
              onClick={() => navigate("/deposit-history")}
              className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-purple-900/30"
            >
              <FaHistory /> {isBangla ? "ডিপোজিট ইতিহাস" : "Deposit History"}
            </button>
          </div>

          {/* Method Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-orange-200">
              {isBangla ? "পদ্ধতি নির্বাচন করুন" : "Choose Deposit Method"}
            </h2>

            {methods.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-lg">
                {isBangla
                  ? "কোনো ডিপোজিট পদ্ধতি উপলব্ধ নেই"
                  : "No deposit methods available right now"}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4 sm:gap-6">
                {methods.map((m) => (
                  <motion.div
                    key={m._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedMethod(m);
                      setSelectedMethodType(null);
                    }}
                    className={`cursor-pointer rounded-xl p-4 text-center transition-all duration-300 border-2 ${
                      selectedMethod?._id === m._id
                        ? "border-white bg-orange-950/40 shadow-lg shadow-orange-900/50"
                        : "border-white bg-black/40 hover:border-whiter hover:bg-black/60"
                    }`}
                  >
                    {m.image && (
                      <div className="h-20 flex items-center justify-center mb-3">
                        <img
                          src={`${API}${m.image}`}
                          alt={m.methodName?.en}
                          className="max-h-full object-contain"
                          onError={(e) =>
                            (e.target.src = "/placeholder-method.png")
                          }
                        />
                      </div>
                    )}
                    <p className="font-semibold text-orange-100">
                      {m.methodName?.en}
                    </p>
                    <p className="text-sm text-orange-300/80">
                      {m.methodName?.bn}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Deposit Form */}
          {selectedMethod && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-black/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-red-800/40 shadow-xl shadow-red-950/30"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-orange-200 text-center md:text-left">
                {selectedMethod.methodName?.en} /{" "}
                {selectedMethod.methodName?.bn}
              </h2>

              {selectedMethod.accountNumber && (
                <div className="mb-6 p-4 bg-black/60 rounded-xl border border-red-800/30">
                  <p className="text-lg text-orange-100">
                    <strong>
                      {isBangla ? "অ্যাকাউন্ট / ওয়ালেট:" : "Account / Wallet:"}
                    </strong>{" "}
                    {selectedMethod.accountNumber}
                  </p>
                </div>
              )}

              {/* Method Type */}
              {selectedMethod.methodTypes?.length > 0 && (
                <div className="mb-8">
                  <label className="block text-orange-300 mb-3 font-medium text-lg">
                    {isBangla
                      ? "পদ্ধতির ধরন নির্বাচন করুন"
                      : "Select Method Type"}
                  </label>
                  <select
                    value={
                      selectedMethodType
                        ? JSON.stringify(selectedMethodType)
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMethodType(val ? JSON.parse(val) : null);
                    }}
                    className="w-full max-w-md bg-black/60 border border-red-800/60 rounded-xl px-4 py-3 text-orange-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  >
                    <option value="">
                      {isBangla
                        ? "-- ধরন নির্বাচন করুন --"
                        : "-- Choose Method Type --"}
                    </option>
                    {selectedMethod.methodTypes.map((type, index) => (
                      <option key={index} value={JSON.stringify(type)}>
                        {type.en} / {type.bn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bonus & Turnover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-black/40 p-6 rounded-xl border border-red-800/30">
                <div>
                  <p className="text-orange-200 text-lg">
                    <strong>{isBangla ? "বোনাস:" : "Bonus:"}</strong>{" "}
                    {selectedMethod.bonusPercentage}%{" "}
                    {selectedMethod.bonusTitle?.en &&
                      `(${selectedMethod.bonusTitle.en})`}
                  </p>
                </div>
                <div>
                  <p className="text-orange-200 text-lg">
                    <strong>
                      {isBangla ? "টার্নওভার প্রয়োজন:" : "Turnover Required:"}
                    </strong>{" "}
                    {selectedMethod.turnoverMultiplier}x
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-8">
                <label className="block text-orange-300 mb-3 font-medium text-lg">
                  {isBangla ? "পরিমাণ (টাকা)" : "Amount (BDT)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {[200, 400, 600, 800, 1000, 1500, 2000, 3000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className={`py-3 px-5 rounded-lg font-medium transition-all ${
                        amount === val.toString()
                          ? "bg-orange-600 text-white border-orange-600 shadow-md"
                          : "bg-black/50 border border-red-800/60 text-orange-200 hover:bg-orange-950/40 hover:border-orange-500"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    isBangla
                      ? "কাস্টম পরিমাণ লিখুন (সর্বনিম্ন ১০০)"
                      : "Enter custom amount (min 100)"
                  }
                  className="w-full bg-black/60 border border-red-800/60 rounded-xl px-4 py-3 text-orange-100 placeholder-orange-400/60 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  min="100"
                />
              </div>

              {/* Transaction ID */}
              <div className="mb-8">
                <label className="block text-orange-300 mb-3 font-medium text-lg">
                  {isBangla
                    ? "ট্রানজেকশন আইডি / রেফারেন্স"
                    : "Transaction ID / Reference Number"}
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={
                    isBangla
                      ? "আপনার পেমেন্টের ট্রানজেকশন আইডি দিন"
                      : "Enter your payment transaction ID / reference"
                  }
                  className="w-full bg-black/60 border border-red-800/60 rounded-xl px-4 py-3 text-orange-100 placeholder-orange-400/60 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                />
                <p className="text-sm text-orange-400/70 mt-2">
                  {isBangla
                    ? "আবশ্যক — পেমেন্ট অ্যাপ/ব্যাংক স্টেটমেন্ট থেকে কপি করুন"
                    : "Required — copy from your payment app / bank statement"}
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending || !isFormValid}
                className={`w-full py-4  rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  mutation.isPending || !isFormValid
                    ? "bg-gray-700 cursor-not-allowed text-gray-400"
                    : "bg-gradient-to-r cursor-pointer from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white shadow-lg shadow-green-900/40 hover:shadow-xl"
                }`}
              >
                {mutation.isPending ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {isBangla ? "পাঠানো হচ্ছে..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    {isBangla
                      ? "ডিপোজিট রিকোয়েস্ট পাঠান"
                      : "Submit Deposit Request"}
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Deposit;
