// src/components/Withdraw.jsx
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import useAuth from "../../hook/useAuth";

const API = `${import.meta.env.VITE_API_URL}`;

const Withdraw = () => {
  const { user, userId } = useAuth();

  if (!user || !userId) {
    return (
      <div className="text-center py-16 text-2xl font-bold text-red-600">
        Please log in to withdraw
      </div>
    );
  }

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formData, setFormData] = useState({});
  const [amount, setAmount] = useState("");

  // Fetch withdrawal methods
  const { data: methods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ["withdraw-methods"],
    queryFn: () =>
      axios.get(`${API}/api/add-withdraw`).then((res) => res.data.data || []),
  });

  // Fetch user info (balance & turnover)
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["user-info", userId],
    queryFn: () =>
      axios
        .get(`${API}/api/user/me`, {
          params: { userId }, // userId as query param
        })
        .then((res) => res.data.data), // assuming response has { success: true, data: {...} }
    enabled: !!userId,
  });

  // Submit withdrawal request
  const withdrawalMutation = useMutation({
    mutationFn: (payload) =>
      axios.post(`${API}/api/withdraw-requests`, payload),
    onSuccess: () => {
      toast.success("Withdrawal request submitted! Waiting for admin approval.");
      setSelectedMethod(null);
      setFormData({});
      setAmount("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit withdrawal");
    },
  });

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setFormData({}); // reset custom fields
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = () => {
    if (!selectedMethod) return toast.error("Please select a withdrawal method");

    // Validate custom fields
    const missing = selectedMethod.customFields?.find(
      (f) => f.required && !formData[f.label?.en]
    );
    if (missing) {
      return toast.error(`Please fill ${missing.label?.en || "required field"}`);
    }

    if (!amount || Number(amount) <= 0) {
      return toast.error("Enter a valid amount");
    }

    // Turnover check
    const remaining = (userData?.turnoverTarget || 0) - (userData?.turnoverCompleted || 0);
    if (remaining > 0) {
      return toast.error(`You need to complete ${remaining} BDT turnover to withdraw`);
    }

    // Check balance
    if (Number(amount) > (userData?.balance || 0)) {
      return toast.error("Insufficient balance");
    }

    withdrawalMutation.mutate({
      userId,
      methodId: selectedMethod._id,
      amount: Number(amount),
      customFields: formData,
    });
  };

  if (methodsLoading || userLoading) {
    return <div className="text-center py-20 text-xl">Loading...</div>;
  }

  const remainingTurnover = (userData?.turnoverTarget || 0) - (userData?.turnoverCompleted || 0);
  const isEligible = remainingTurnover <= 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center md:text-left">
        Withdraw Funds
      </h1>

      {/* Turnover Eligibility Card */}
      <div className={`rounded-2xl p-6 mb-10 shadow-lg ${
        isEligible ? "bg-gradient-to-r from-green-50 to-emerald-50" : "bg-gradient-to-r from-red-50 to-rose-50"
      }`}>
        <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
          Withdrawal Eligibility
        </h2>

        {isEligible ? (
          <div className="text-center md:text-left">
            <p className="text-xl font-semibold text-green-700 mb-2">
              You are eligible to withdraw!
            </p>
            <p className="text-lg text-gray-800">
              Current Balance: <span className="font-bold">{userData?.balance || 0} BDT</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              You can withdraw any amount up to your balance.
            </p>
          </div>
        ) : (
          <div className="text-center md:text-left">
            <p className="text-xl font-semibold text-red-700 mb-2">
              Not eligible yet
            </p>
            <p className="text-lg text-gray-800">
              Remaining Turnover Required:{" "}
              <span className="font-bold">{remainingTurnover.toFixed(2)} BDT</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Play more games to complete the turnover requirement.
            </p>
          </div>
        )}
      </div>

      {/* Withdrawal Methods */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">
          Select Withdrawal Method
        </h2>

        {methods.length === 0 ? (
          <p className="text-center text-gray-600 py-8 text-lg">
            No withdrawal methods available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {methods.map((m) => (
              <div
                key={m._id}
                onClick={() => handleSelectMethod(m)}
                className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-xl hover:border-indigo-400 ${
                  selectedMethod?._id === m._id
                    ? "border-indigo-600 shadow-lg bg-indigo-50 scale-105"
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

      {/* Withdrawal Form */}
      {selectedMethod && (
        <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8 border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
            Withdraw via {selectedMethod.methodName?.en}
          </h2>

          {/* Custom Fields */}
          {selectedMethod.customFields?.length > 0 && (
            <div className="mb-8 space-y-6">
              {selectedMethod.customFields.map((field, index) => (
                <div key={index}>
                  <label className="block text-lg font-medium mb-2">
                    {field.label?.en} / {field.label?.bn}
                    {field.required && <span className="text-red-600 ml-1">*</span>}
                  </label>

                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={formData[field.label?.en] || ""}
                    onChange={(e) => handleCustomFieldChange(field.label?.en, e.target.value)}
                    placeholder={field.placeholder?.en || ""}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-8">
            <label className="block text-lg font-medium mb-3">
              Withdrawal Amount (BDT)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="100"
              step="1"
            />
            <p className="text-sm text-gray-500 mt-2">
              Available Balance: {userData?.balance || 0} BDT
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={withdrawalMutation.isPending || !amount || Number(amount) <= 0 || !isEligible}
            className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-200 ${
              withdrawalMutation.isPending || !amount || Number(amount) <= 0 || !isEligible
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {withdrawalMutation.isPending ? "Submitting..." : "Submit Withdrawal Request"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Withdraw;