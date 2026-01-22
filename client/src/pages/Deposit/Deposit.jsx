// src/components/Deposit.jsx
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import useAuth from "../../hook/useAuth";

const API = `${import.meta.env.VITE_API_URL}`;

const Deposit = () => {
  const { user, userId } = useAuth();

  if (!user || !userId) {
    return (
      <div className="text-center py-16 text-2xl font-bold text-red-600">
        Please log in to make a deposit
      </div>
    );
  }

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
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      axios.post(`${API}/api/deposit-requests`, payload),
    onSuccess: () => {
      toast.success("Deposit request submitted! Waiting for admin approval.");
      setSelectedMethod(null);
      setSelectedMethodType(null);
      setAmount("");
      setTransactionId("");
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit request. Try again.";
      toast.error(msg);
    },
  });

  // Form validation helper
  const isFormValid =
    !!selectedMethod?._id &&
    (selectedMethod.methodTypes?.length === 0 || !!selectedMethodType) &&
    Number(amount) >= 100 &&
    transactionId.trim().length > 0;

  const handleSubmit = () => {
    if (!selectedMethod?._id) return toast.error("Please select a deposit method");
    if (selectedMethod.methodTypes?.length > 0 && !selectedMethodType) {
      return toast.error("Please select a method type");
    }
    if (!amount || Number(amount) < 100) {
      return toast.error("Minimum deposit amount is 100 BDT");
    }
    if (!transactionId.trim()) {
      return toast.error("Transaction ID is required");
    }

    mutation.mutate({
      userId,
      methodId: selectedMethod._id,
      methodType: selectedMethodType || null,
      amount: Number(amount),
      transactionId: transactionId.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-xl">
        Loading deposit methods...
      </div>
    );
  }

  if (isError || !Array.isArray(methods)) {
    return (
      <div className="text-center py-12 text-red-600 text-xl">
        Failed to load deposit methods.
        <br />
        {error?.message || "Please check your internet connection."}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center md:text-left">
        Deposit Funds
      </h1>

      {/* Method Cards */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">
          Choose Deposit Method
        </h2>

        {methods.length === 0 ? (
          <p className="text-center text-gray-600 py-10 text-lg">
            No deposit methods available right now.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {methods.map((m) => (
              <div
                key={m._id}
                onClick={() => {
                  setSelectedMethod(m);
                  setSelectedMethodType(null);
                }}
                className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-xl hover:border-blue-400 ${
                  selectedMethod?._id === m._id
                    ? "border-blue-600 shadow-lg bg-blue-50 scale-105"
                    : "border-gray-200 hover:scale-102"
                }`}
              >
                {m.image && (
                  <div className="h-20 sm:h-24 flex items-center justify-center mb-3">
                    <img
                      src={`${API}${m.image}`}
                      alt={m.methodName?.en}
                      className="max-h-full object-contain"
                      onError={(e) => (e.target.src = "/placeholder-method.png")}
                    />
                  </div>
                )}
                <p className="font-semibold text-gray-800">{m.methodName?.en}</p>
                <p className="text-sm text-gray-600">{m.methodName?.bn}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Form */}
      {selectedMethod && (
        <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8 border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
            {selectedMethod.methodName?.en} / {selectedMethod.methodName?.bn}
          </h2>

          {selectedMethod.accountNumber && (
            <p className="mb-5 text-lg md:text-xl bg-gray-50 p-4 rounded-lg">
              <strong>Account / Wallet:</strong> {selectedMethod.accountNumber}
            </p>
          )}

          {/* Method Type Dropdown - FIXED */}
          {selectedMethod.methodTypes?.length > 0 && (
            <div className="mb-8">
              <label className="block text-lg font-medium mb-3">
                Select Method Type / পদ্ধতির ধরন
              </label>
              <select
                value={selectedMethodType ? JSON.stringify(selectedMethodType) : ""}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected) {
                    try {
                      const parsed = JSON.parse(selected);
                      setSelectedMethodType(parsed);
                    } catch (err) {
                      console.error("Parse error:", err);
                      setSelectedMethodType(null);
                    }
                  } else {
                    setSelectedMethodType(null);
                  }
                }}
                className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Method Type --</option>
                {selectedMethod.methodTypes.map((type, index) => (
                  <option key={index} value={JSON.stringify(type)}>
                    {type.en} / {type.bn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bonus & Turnover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-xl">
            <div>
              <p className="text-gray-700 text-lg">
                <strong>Bonus:</strong> {selectedMethod.bonusPercentage}%{" "}
                {selectedMethod.bonusTitle?.en && `(${selectedMethod.bonusTitle.en})`}
              </p>
            </div>
            <div>
              <p className="text-gray-700 text-lg">
                <strong>Turnover Required:</strong> {selectedMethod.turnoverMultiplier}x
              </p>
            </div>
          </div>

          {/* Amount Selection */}
          <h3 className="text-xl md:text-2xl font-semibold mb-5">Select Amount (BDT)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[200, 400, 600, 800, 1000, 1500, 2000, 3000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-3 px-5 border-2 rounded-lg font-medium transition-all duration-200 ${
                  amount === val
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter custom amount (min 100)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
            />
          </div>

          {/* Transaction ID */}
          <div className="mb-8">
            <label className="block text-lg font-medium mb-3">
              Transaction ID / TrxID / Reference Number
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter your payment transaction ID / reference"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Required — copy from your payment app/bank statement
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending || !isFormValid}
            className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-200 ${
              mutation.isPending || !isFormValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {mutation.isPending ? "Submitting..." : "Submit Deposit Request"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Deposit;