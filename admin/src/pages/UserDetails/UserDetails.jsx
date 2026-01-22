import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaSave,
  FaArrowLeft,
  FaUserEdit,
  FaPhone,
  FaWallet,
  FaLock,
  FaUserShield,
  FaUser,
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5007";

// ────────────────────────────────────────────────
// API Functions
// ────────────────────────────────────────────────

const fetchUser = async (id) => {
  const response = await axios.get(`${BASE_URL}/api/user/admin/${id}`);
  return response.data;
};

const updateUser = async ({ id, formData }) => {
  const response = await axios.put(
    `${BASE_URL}/api/user/admin/${id}`,
    formData,
  );
  return response.data;
};

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      balance: 0,
      status: "active",
      password: "",
    },
  });

  const {
    data: user,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: () => fetchUser(id),
    retry: 1,
    staleTime: 3 * 60 * 1000,
  });

  useEffect(() => {
    if (isSuccess && user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        balance: Number(user.balance ?? 0),
        status: user.status || "active",
        password: "",
      });
    }
  }, [isSuccess, user, reset]);

  const mutation = useMutation({
    mutationFn: ({ id, formData }) => updateUser({ id, formData }),
    onSuccess: () => {
      toast.success("User updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-detail", id] });
      navigate("/all-user");
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to update user";
      toast.error(msg, { position: "top-right", autoClose: 4000 });
    },
  });

  const onSubmit = async (formData) => {
    const cleanData = {
      firstName: formData.firstName?.trim() || "",
      lastName: formData.lastName?.trim() || "",
      phone: formData.phone?.trim() || "",
      balance: Number(formData.balance ?? 0),
      status: formData.status,
    };

    if (formData.password?.trim()) {
      cleanData.password = formData.password.trim();
    }

    mutation.mutate({ id, formData: cleanData });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-red-950 to-black">
        <div className="flex items-center gap-4 text-orange-300 text-xl font-medium">
          <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          Loading user details...
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-red-950 to-black p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-black/40 backdrop-blur-md border border-red-800/40 rounded-xl p-8 shadow-2xl shadow-red-950/50"
        >
          <div className="text-red-400 text-7xl mb-6">!</div>
          <h2 className="text-2xl font-bold text-orange-100 mb-4">
            Error Loading User
          </h2>
          <p className="text-orange-200/80 mb-8">
            {error?.response?.data?.message ||
              error?.message ||
              "Couldn't load user information"}
          </p>
          <button
            onClick={() => navigate("/all-user")}
            className="bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-red-900/40 transition-all"
          >
            Back to Users
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 p-4 md:p-6 lg:p-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* Card container */}
        <div className="bg-gradient-to-br from-red-950/70 via-black/80 to-orange-950/40 rounded-2xl border border-red-800/40 shadow-2xl shadow-red-950/40 overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="px-6 py-6 md:px-8 border-b border-red-800/50 bg-gradient-to-r from-red-950/60 to-black/60">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-3 cursor-pointer rounded-xl hover:bg-red-900/40 text-orange-300 hover:text-orange-100 transition-all"
              >
                <FaArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <FaUserEdit className="text-3xl text-orange-400" />
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
                    Edit User
                  </h1>
                </div>
                <p className="mt-1 text-sm text-orange-200/70">
                  ID: <span className="font-mono text-orange-300">{id}</span> •
                  Phone:{" "}
                  <span className="font-medium text-orange-200">
                    {user.phone}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 md:p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-orange-300 mb-2 flex items-center gap-2">
                  <FaUser className="text-orange-400" /> First Name
                </label>
                <input
                  {...register("firstName", {
                    required: "Required",
                    minLength: { value: 2, message: "Too short" },
                  })}
                  className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-sm text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-300 mb-2 flex items-center gap-2">
                  <FaUser className="text-orange-400" /> Last Name
                </label>
                <input
                  {...register("lastName", {
                    required: "Required",
                    minLength: { value: 2, message: "Too short" },
                  })}
                  className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-sm text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-300 mb-2 flex items-center gap-2">
                <FaPhone className="text-orange-400" /> Phone Number
              </label>
              <input
                {...register("phone", { required: "Required" })}
                className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-300 mb-2 flex items-center gap-2">
                <FaWallet className="text-green-400" /> Balance
              </label>
              <input
                type="number"
                step="0.01"
                {...register("balance", {
                  required: "Required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Cannot be negative" },
                })}
                className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-green-300 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              {errors.balance && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.balance.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-300 mb-2 flex items-center gap-2">
                <FaUserShield className="text-orange-400" /> Status
              </label>
              <select
                {...register("status")}
                className="w-full px-5 py-3 bg-black/60 border border-red-800/60 rounded-xl text-orange-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-300 mb-2 flex items-center gap-2">
                <FaLock className="text-orange-400" /> New Password (optional)
              </label>
              <input
                type="password"
                {...register("password", {
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
                placeholder="Leave blank to keep current password"
                className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium text-white transition-all shadow-lg
                  ${
                    mutation.isPending
                      ? "bg-green-700/50 cursor-wait"
                      : "bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 shadow-red-900/50 hover:shadow-red-800/60"
                  }`}
              >
                <FaSave className="w-5 h-5" />
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/all-user")}
                className="flex-1 sm:flex-none px-6 py-3.5 border border-red-800/50 rounded-xl text-orange-200 hover:bg-red-950/60 hover:text-orange-100 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default UserDetails;
