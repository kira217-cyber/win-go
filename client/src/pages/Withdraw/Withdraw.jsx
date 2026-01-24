// src/components/Withdraw.jsx
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
  FaExclamationTriangle,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageProvider";
import useAuth from "../../hook/useAuth";

const API = `${import.meta.env.VITE_API_URL}`;

const Withdraw = () => {
  const { isBangla } = useLanguage();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formData, setFormData] = useState({});
  const [amount, setAmount] = useState("");

  // Fetch withdrawal methods
  const { data: methods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ["withdraw-methods"],
    queryFn: () =>
      axios.get(`${API}/api/add-withdraw`).then((res) => res.data.data || []),
    enabled: !!userId,
  });

  // Fetch user info (balance & turnover)
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["user-info", userId],
    queryFn: () =>
      axios
        .get(`${API}/api/user/me`, { params: { userId } })
        .then((res) => res.data.data || res.data),
    enabled: !!userId,
  });

  const withdrawalMutation = useMutation({
    mutationFn: (payload) =>
      axios.post(`${API}/api/withdraw-requests`, payload),
    onSuccess: () => {
      toast.success(
        isBangla
          ? "উত্তোলনের অনুরোধ সফলভাবে পাঠানো হয়েছে!"
          : "Withdrawal request submitted successfully!",
        { theme: "dark", position: "top-right", autoClose: 4000 },
      );

      // Reset form
      setSelectedMethod(null);
      setFormData({});
      setAmount("");

      // Refresh history if you have a query for it
      queryClient.invalidateQueries(["withdraw-history"]);

      // Navigate to history
      navigate("/withdraw-history"); // ← adjust route path as needed
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        (isBangla
          ? "অনুরোধ পাঠাতে ব্যর্থ হয়েছে"
          : "Failed to submit withdrawal");
      toast.error(msg, { theme: "dark" });
    },
  });

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setFormData({});
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = () => {
    if (!selectedMethod) {
      return toast.error(
        isBangla
          ? "উত্তোলন পদ্ধতি নির্বাচন করুন"
          : "Please select a withdrawal method",
      );
    }

    // Check required custom fields
    const missing = selectedMethod.customFields?.find(
      (f) => f.required && !formData[f.label?.en],
    );
    if (missing) {
      return toast.error(
        isBangla
          ? `${missing.label?.bn || missing.label?.en} পূরণ করুন`
          : `Please fill ${missing.label?.en || "required field"}`,
      );
    }

    if (!amount || Number(amount) <= 0) {
      return toast.error(isBangla ? "বৈধ পরিমাণ দিন" : "Enter a valid amount");
    }

    const remainingTurnover =
      (userData?.turnoverTarget || 0) - (userData?.turnoverCompleted || 0);
    if (remainingTurnover > 0) {
      return toast.error(
        isBangla
          ? `উত্তোলনের জন্য ${remainingTurnover.toFixed(2)} টাকা টার্নওভার সম্পূর্ণ করতে হবে`
          : `You need to complete ${remainingTurnover.toFixed(2)} BDT turnover`,
      );
    }

    if (Number(amount) > (userData?.balance || 0)) {
      return toast.error(
        isBangla ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance",
      );
    }

    withdrawalMutation.mutate({
      userId,
      methodId: selectedMethod._id,
      amount: Number(amount),
      customFields: formData,
    });
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-200 text-xl p-6 text-center">
        {isBangla ? "উত্তোলন করতে লগইন করুন" : "Please log in to withdraw"}
      </div>
    );
  }

  if (methodsLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-4">
        <FaSpinner className="animate-spin text-4xl text-orange-500" />
        <span className="text-xl text-orange-200">
          {isBangla ? "লোড হচ্ছে..." : "Loading..."}
        </span>
      </div>
    );
  }

  const remainingTurnover =
    (userData?.turnoverTarget || 0) - (userData?.turnoverCompleted || 0);
  const isEligible = remainingTurnover <= 0;

  return (
    <div className="min-h-screen text-gray-100 py-10 px-4 sm:px-8 lg:px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50/10 backdrop-blur-sm rounded-2xl shadow-2xl shadow-red-900/30 p-6 md:p-10 border border-red-800/30"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <h1 className="text-2xl md:text-2xl font-bold text-orange-200">
              {isBangla ? "উত্তোলন করুন" : "Withdraw Funds"}
            </h1>

            <button
              onClick={() => navigate("/withdraw-history")}
              className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-purple-900/30"
            >
              <FaHistory />{" "}
              {isBangla ? "উত্তোলনের ইতিহাস" : "Withdrawal History"}
            </button>
          </div>

          {/* Turnover / Eligibility Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-6 mb-10 border ${
              isEligible
                ? "bg-green-950/30 border-green-800/40 shadow-green-900/20"
                : "bg-red-950/30 border-red-800/40 shadow-red-900/20"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4 text-orange-200 text-center md:text-left">
              {isBangla ? "উত্তোলনের যোগ্যতা" : "Withdrawal Eligibility"}
            </h2>

            {isEligible ? (
              <div className="text-center md:text-left">
                <p className="text-xl font-semibold text-green-400 mb-2">
                  {isBangla
                    ? "আপনি উত্তোলন করতে পারবেন!"
                    : "You are eligible to withdraw!"}
                </p>
                <p className="text-lg text-orange-100">
                  {isBangla ? "বর্তমান ব্যালেন্স:" : "Current Balance:"}{" "}
                  <span className="font-bold text-green-300">
                    ৳ {Number(userData?.balance || 0).toFixed(2)}
                  </span>
                </p>
              </div>
            ) : (
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <FaExclamationTriangle className="text-2xl text-red-400" />
                  <p className="text-xl font-semibold text-red-400">
                    {isBangla ? "এখনও যোগ্য নন" : "Not eligible yet"}
                  </p>
                </div>
                <p className="text-lg text-orange-100">
                  {isBangla
                    ? "বাকি টার্নওভার প্রয়োজন:"
                    : "Remaining Turnover Required:"}{" "}
                  <span className="font-bold text-red-300">
                    ৳ {remainingTurnover.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-orange-400/80 mt-2">
                  {isBangla
                    ? "আরও গেম খেলে টার্নওভার সম্পূর্ণ করুন"
                    : "Play more games to complete the turnover requirement."}
                </p>
              </div>
            )}
          </motion.div>

          {/* Methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-orange-200">
              {isBangla
                ? "উত্তোলন পদ্ধতি নির্বাচন করুন"
                : "Select Withdrawal Method"}
            </h2>

            {methods.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-lg">
                {isBangla
                  ? "কোনো উত্তোলন পদ্ধতি উপলব্ধ নেই"
                  : "No withdrawal methods available at the moment."}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4 sm:gap-6">
                {methods.map((m) => (
                  <motion.div
                    key={m._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectMethod(m)}
                    className={`cursor-pointer rounded-xl p-4 text-center transition-all duration-300 border-2 ${
                      selectedMethod?._id === m._id
                        ? "border-orange-500 bg-orange-950/40 shadow-lg shadow-orange-900/50"
                        : "border-red-800/40 bg-black/40 hover:border-orange-600/60 hover:bg-black/60"
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

          {/* Form */}
          {selectedMethod && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-black/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-red-800/40 shadow-xl shadow-red-950/30"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-orange-200 text-center md:text-left">
                {isBangla ? "উত্তোলন করুন" : "Withdraw via"}{" "}
                {selectedMethod.methodName?.en}
              </h2>

              {/* Custom Fields */}
              {selectedMethod.customFields?.length > 0 && (
                <div className="mb-8 space-y-6">
                  {selectedMethod.customFields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-orange-300 mb-2 font-medium">
                        {field.label?.en} / {field.label?.bn}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={formData[field.label?.en] || ""}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            field.label?.en,
                            e.target.value,
                          )
                        }
                        placeholder={
                          field.placeholder?.en || field.placeholder?.bn || ""
                        }
                        className="w-full bg-black/60 border border-red-800/60 rounded-xl px-4 py-3 text-orange-100 placeholder-orange-400/60 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                        required={field.required}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Amount */}
              <div className="mb-8">
                <label className="block text-orange-300 mb-3 font-medium text-lg">
                  {isBangla
                    ? "উত্তোলনের পরিমাণ (টাকা)"
                    : "Withdrawal Amount (BDT)"}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    isBangla
                      ? "উত্তোলনের পরিমাণ লিখুন"
                      : "Enter amount to withdraw"
                  }
                  className="w-full bg-black/60 border border-red-800/60 rounded-xl px-4 py-3 text-orange-100 placeholder-orange-400/60 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  min="100"
                  step="1"
                />
                <p className="text-sm text-orange-400/80 mt-2">
                  {isBangla ? "উপলব্ধ ব্যালেন্স:" : "Available Balance:"} ৳{" "}
                  {Number(userData?.balance || 0).toFixed(2)}
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={
                  withdrawalMutation.isPending ||
                  !amount ||
                  Number(amount) <= 0 ||
                  !isEligible ||
                  withdrawalMutation.isLoading
                }
                className={`w-full py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  withdrawalMutation.isPending ||
                  !amount ||
                  Number(amount) <= 0 ||
                  !isEligible
                    ? "bg-gray-700 cursor-not-allowed text-gray-400"
                    : "bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-900/40 hover:shadow-xl"
                }`}
              >
                {withdrawalMutation.isPending ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {isBangla ? "পাঠানো হচ্ছে..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    {isBangla
                      ? "অনুরোধ পাঠান"
                      : "Submit Request"}
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

export default Withdraw;
