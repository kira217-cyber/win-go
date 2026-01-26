// src/components/Deposit.jsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaHistory, FaPaperPlane, FaSpinner } from "react-icons/fa";
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

  // Auto-select method type if only one exists
  useEffect(() => {
    if (selectedMethod && selectedMethod.methodTypes?.length === 1) {
      // Automatically select the only available type
      setSelectedMethodType(selectedMethod.methodTypes[0]);
    } else if (selectedMethod && selectedMethod.methodTypes?.length > 1) {
      // If multiple, reset to allow manual selection (dropdown will show)
      setSelectedMethodType(null);
    } else {
      // No types → null
      setSelectedMethodType(null);
    }
  }, [selectedMethod]);

  const mutation = useMutation({
    mutationFn: (payload) => axios.post(`${API}/api/deposit-requests`, payload),
    onSuccess: () => {
      toast.success(
        isBangla
          ? "ডিপোজিট রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!"
          : "Deposit request submitted successfully!",
        { position: "top-right", autoClose: 4000, theme: "dark" }
      );
      setSelectedMethod(null);
      setSelectedMethodType(null);
      setAmount("");
      setTransactionId("");
      queryClient.invalidateQueries(["deposit-history"]);
      navigate("/deposit-history");
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        (isBangla ? "রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে" : "Failed to submit request");
      toast.error(msg, { theme: "dark" });
    },
  });

  const minDeposit = selectedMethod?.minDeposit || 100;
  const maxDeposit = selectedMethod?.maxDeposit || 999999;

  const isFormValid =
    !!selectedMethod?._id &&
    Number(amount) >= minDeposit &&
    Number(amount) <= maxDeposit &&
    transactionId.trim().length > 0;

  const handleSubmit = () => {
    if (!selectedMethod?._id) {
      return toast.error(
        isBangla ? "ডিপোজিট পদ্ধতি নির্বাচন করুন" : "Please select a deposit method"
      );
    }
    if (!amount || Number(amount) < minDeposit) {
      return toast.error(
        isBangla
          ? `সর্বনিম্ন ডিপোজিট ${minDeposit} টাকা`
          : `Minimum deposit is ${minDeposit} BDT`
      );
    }
    if (Number(amount) > maxDeposit) {
      return toast.error(
        isBangla
          ? `সর্বোচ্চ ডিপোজিট ${maxDeposit} টাকা`
          : `Maximum deposit is ${maxDeposit} BDT`
      );
    }
    if (!transactionId.trim()) {
      return toast.error(
        isBangla ? "ট্রানজেকশন আইডি দিন" : "Transaction ID is required"
      );
    }

    // Fixed: methodType সঠিকভাবে {en, bn} অবজেক্ট হিসেবে পাঠানো হচ্ছে
    const payload = {
      userId,
      methodId: selectedMethod._id,
      methodType: selectedMethodType
        ? {
            en: selectedMethodType.en || "",
            bn: selectedMethodType.bn || "",
          }
        : null,
      amount: Number(amount),
      transactionId: transactionId.trim(),
    };

    mutation.mutate(payload);
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl p-6 text-center">
        {isBangla ? "ডিপোজিট করতে লগইন করুন" : "Please log in to make a deposit"}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-4">
        <FaSpinner className="animate-spin text-4xl text-orange-500" />
        <span className="text-xl text-white">
          {isBangla ? "লোড হচ্ছে..." : "Loading deposit methods..."}
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-xl p-6 text-center">
        {isBangla ? "ডিপোজিট পদ্ধতি লোড করতে সমস্যা হয়েছে" : "Failed to load deposit methods"}
        <br />
        {error?.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white py-8 px-2 md:px-4 mb-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50/10 backdrop-blur-sm rounded-md shadow-2xl shadow-red-900/20 px-2 py-4 border border-white/20"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-5">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {isBangla ? "ডিপোজিট করুন" : "Deposit Funds"}
            </h1>
            <button
              onClick={() => navigate("/deposit-history")}
              className="flex cursor-pointer items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 rounded-lg text-white font-medium transition-all shadow-md border border-white/30"
            >
              <FaHistory size={18} /> {isBangla ? "ইতিহাস" : "History"}
            </button>
          </div>

          {/* Method Selection */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-5 text-white">
              {isBangla ? "পদ্ধতি নির্বাচন করুন" : "Choose Deposit Method"}
            </h2>
            {methods.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-lg">
                {isBangla ? "কোনো পদ্ধতি উপলব্ধ নেই" : "No deposit methods available"}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {methods.map((m) => (
                  <motion.div
                    key={m._id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedMethod(m);
                      setAmount("");
                      // Auto-selection handled in useEffect
                    }}
                    className={`cursor-pointer rounded-xl px-2 md:px-4 text-center transition-all duration-300 border border-white/30 relative overflow-hidden ${
                      selectedMethod?._id === m._id
                        ? "bg-orange-900/40 shadow-lg shadow-orange-800/40 border-white/60"
                        : "bg-black/40 hover:bg-black/60 hover:border-white/50"
                    }`}
                  >
                    {m.bonusPercentage > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-br from-yellow-500 to-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                        +{m.bonusPercentage}%
                      </div>
                    )}

                    {m.image && (
                      <div className="h-16 flex items-center justify-center mb-2">
                        <img
                          src={`${API}${m.image}`}
                          alt={isBangla ? m.methodName?.bn : m.methodName?.en}
                          className="max-h-full object-contain"
                          onError={(e) => (e.target.src = "/placeholder-method.png")}
                        />
                      </div>
                    )}
                    <p className="font-semibold text-white text-base">
                      {isBangla ? m.methodName?.bn : m.methodName?.en}
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
              className="bg-black/40 backdrop-blur-md rounded-sm px-4 py-8 border border-white/30 shadow-xl shadow-red-950/30"
            >
              <h2 className="text-2xl font-bold mb-5 text-white text-center md:text-left">
                {isBangla ? selectedMethod.methodName?.bn : selectedMethod.methodName?.en}
              </h2>

              {/* Account + Auto-selected Method Type + Min/Max */}
              <div className="mb-5 p-2 bg-black/60 rounded-xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-base text-white">
                    <strong>{isBangla ? "অ্যাকাউন্ট:" : "Account:"}</strong>{" "}
                    {selectedMethod.accountNumber || "—"}
                  </p>

                  {/* Show selected / auto-selected type */}
                  {selectedMethod.methodTypes?.length > 0 && (
                    <p className="text-sm text-gray-300 mt-1">
                      <strong>{isBangla ? "ধরন:" : "Type:"}</strong>{" "}
                      {selectedMethodType
                        ? (isBangla ? selectedMethodType.bn : selectedMethodType.en)
                        : (isBangla ? "কোনো ধরন নেই" : "No type selected")}
                    </p>
                  )}
                </div>

                <div className="text-right text-sm text-gray-300">
                  <p>Min: {selectedMethod.minDeposit || 100} ৳</p>
                  <p>Max: {selectedMethod.maxDeposit || "—"} ৳</p>
                </div>
              </div>

              {/* If multiple types → show dropdown, else auto-selected (no dropdown) */}
              {selectedMethod.methodTypes?.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm text-gray-300 mb-2">
                    {isBangla ? "ধরন নির্বাচন করুন:" : "Select Type:"}
                  </label>
                  <select
                    value={selectedMethodType ? JSON.stringify(selectedMethodType) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMethodType(val ? JSON.parse(val) : null);
                    }}
                    className="w-full bg-black/70 border border-white/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/60"
                  >
                    <option value="">
                      {isBangla ? "-- ধরন নির্বাচন করুন --" : "-- Select Type --"}
                    </option>
                    {selectedMethod.methodTypes.map((type, index) => (
                      <option key={index} value={JSON.stringify(type)}>
                        {isBangla ? type.bn : type.en}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bonus Section */}
              <div className="mb-6 p-5 rounded-xl border border-white/20 gradient-animate">
                <p className="text-lg font-semibold text-center text-white mb-2">
                  {isBangla ? "বোনাস" : "Bonus"}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-base">
                  <span className="text-3xl font-extrabold text-yellow-300 drop-shadow-md">
                    {selectedMethod.bonusPercentage}%
                  </span>
                  {selectedMethod.bonusTitle && (
                    <span className="text-gray-200">
                      ({isBangla ? selectedMethod.bonusTitle.bn : selectedMethod.bonusTitle.en})
                    </span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-medium">
                  {isBangla ? "পরিমাণ (টাকা)" : "Amount (BDT)"}
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {[200, 500, 1000, 2000, 3000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className={`py-2.5 cursor-pointer px-3 rounded-lg text-sm font-medium border border-white/30 transition-all ${
                        amount === val.toString()
                          ? "bg-orange-600 text-white"
                          : "bg-black/50 text-white hover:bg-orange-900/50 hover:border-white/50"
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
                      ? `কাস্টম পরিমাণ (${minDeposit} - ${maxDeposit})`
                      : `Custom amount (${minDeposit} - ${maxDeposit})`
                  }
                  min={minDeposit}
                  max={maxDeposit}
                  className="w-full bg-black/60 border border-white/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-white/60 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              {/* Transaction ID */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-medium">
                  {isBangla ? "ট্রানজেকশন আইডি" : "Transaction ID"}
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={
                    isBangla ? "ট্রানজেকশন আইডি দিন" : "Enter Transaction ID"
                  }
                  className="w-full bg-black/60 border border-white/30 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-white/60 focus:ring-1 focus:ring-white/20 transition-all"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  {isBangla
                    ? "পেমেন্ট অ্যাপ থেকে কপি করুন"
                    : "Copy from your payment app"}
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending || !isFormValid}
                className={`w-full cursor-pointer py-3.5 rounded-lg text-base font-bold transition-all flex items-center justify-center gap-2 border border-white/30 ${
                  mutation.isPending || !isFormValid
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {mutation.isPending ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {isBangla ? "পাঠানো হচ্ছে..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <FaPaperPlane size={16} />
                    {isBangla ? "রিকোয়েস্ট পাঠান" : "Submit Request"}
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