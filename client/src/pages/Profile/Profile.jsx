import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import {
  FaUser,
  FaPhone,
  FaLock,
  FaEdit,
  FaSave,
  FaTimes,
  FaWallet,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageProvider";
import useAuth from "../../hook/useAuth";

const fetchProfile = async (userId) => {
  if (!userId) throw new Error("User not logged in");

  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
  );
  console.log(data)
  return data;
};

const updateProfile = async ({ userId, ...data }) => {
  if (!userId) throw new Error("User not logged in");

  const { data: updated } = await axios.put(
    `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
    data,
  );
  return updated;
};

const Profile = () => {
  const { isBangla } = useLanguage();
  const { userId } = useAuth(); // ← using userId from your auth hook
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId, // only run query if userId exists
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data) => updateProfile({ userId, ...data }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user-profile", userId], updatedUser);
      toast.success(
        isBangla
          ? "প্রোফাইল সফলভাবে আপডেট হয়েছে"
          : "Profile updated successfully",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        },
      );
      setIsEditing(false);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        (isBangla ? "আপডেট ব্যর্থ হয়েছে" : "Update failed");
      toast.error(msg, { theme: "dark" });
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (formData) => {
    const payload = {};

    if (formData.firstName?.trim())
      payload.firstName = formData.firstName.trim();
    if (formData.lastName?.trim()) payload.lastName = formData.lastName.trim();
    if (formData.phone?.trim()) payload.phone = formData.phone.trim();
    if (formData.password?.trim()) payload.password = formData.password.trim();

    if (Object.keys(payload).length === 0) {
      toast.info(isBangla ? "কোনো পরিবর্তন নেই" : "No changes made");
      setIsEditing(false);
      return;
    }

    mutation.mutate(payload);
  };

  const handleEditStart = () => {
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      password: "",
    });
    setIsEditing(true);
  };

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-orange-500 border-orange-200 rounded-full"
        />
        <span className="ml-6 text-xl text-orange-200">
          {isBangla ? "লোড হচ্ছে..." : "Loading..."}
        </span>
      </div>
    );
  }

  // ─── Not logged in / No userId / Error State ───
  if (error || !userId || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-200 text-xl p-6 text-center">
        {isBangla
          ? "প্রোফাইল লোড করতে সমস্যা হয়েছে। লগইন করুন।"
          : "Failed to load profile. Please log in."}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-4xl bg-gray-50/20 mx-auto rounded-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl shadow-2xl shadow-red-900/40 p-6 md:p-10"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-orange-200">
              {isBangla ? "আমার প্রোফাইল" : "My Profile"}
            </h1>

            {!isEditing && (
              <button
                onClick={handleEditStart}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-red-900/30 cursor-pointer"
              >
                <FaEdit /> {isBangla ? "এডিট করুন" : "Edit Profile"}
              </button>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-orange-300 mb-2 font-medium">
                    {isBangla ? "প্রথম নাম" : "First Name"}
                  </label>
                  <input
                    {...register("firstName")}
                    className="w-full px-4 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-orange-300 mb-2 font-medium">
                    {isBangla ? "শেষ নাম" : "Last Name"}
                  </label>
                  <input
                    {...register("lastName")}
                    className="w-full px-4 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-orange-300 mb-2 font-medium">
                  {isBangla ? "ফোন নম্বর" : "Phone Number"}
                </label>
                <input
                  {...register("phone")}
                  className="w-full px-4 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-orange-300 mb-2 font-medium">
                  {isBangla
                    ? "নতুন পাসওয়ার্ড "
                    : "New Password "}
                </label>
                <input
                  type="password"
                  {...register("password")}
                  placeholder={
                    isBangla
                      ? "নতুন পাসওয়ার্ড দিন "
                      : "Enter new password "
                  }
                  className="w-full px-4 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button
                  type="submit"
                  disabled={mutation.isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 rounded-xl text-white font-medium transition-all shadow-lg shadow-green-900/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FaSave /> {isBangla ? "সেভ করুন" : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-xl text-white font-medium transition-all shadow-lg shadow-red-900/30 cursor-pointer"
                >
                  <FaTimes /> {isBangla ? "বাতিল" : "Cancel"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* Name */}
              <div className="bg-black/40 p-6 rounded-xl border border-red-800/40">
                <div className="flex items-center gap-4 mb-4">
                  <FaUser className="text-4xl text-orange-400" />
                  <h3 className="text-xl font-semibold text-orange-100">
                    {isBangla ? "নাম" : "Name"}
                  </h3>
                </div>
                <p className="text-2xl text-gray-200">
                  {user.firstName} {user.lastName}
                </p>
              </div>

              {/* Phone */}
              <div className="bg-black/40 p-6 rounded-xl border border-red-800/40">
                <div className="flex items-center gap-4 mb-4">
                  <FaPhone className="text-4xl text-orange-400" />
                  <h3 className="text-xl font-semibold text-orange-100">
                    {isBangla ? "ফোন নম্বর" : "Phone Number"}
                  </h3>
                </div>
                <p className="text-2xl text-gray-200 break-all">{user.phone}</p>
              </div>

              {/* Status */}
              <div className="bg-black/40 p-6 rounded-xl border border-red-800/40">
                <h3 className="text-xl font-semibold text-orange-100 mb-4">
                  {isBangla ? "স্ট্যাটাস" : "Status"}
                </h3>
                <span
                  className={`inline-block px-5 py-2 rounded-full text-base font-medium ${
                    user.status === "active"
                      ? "bg-green-700/40 text-green-300 border border-green-600/50"
                      : user.status === "blocked"
                        ? "bg-red-700/40 text-red-300 border border-red-600/50"
                        : "bg-yellow-700/40 text-yellow-300 border border-yellow-600/50"
                  }`}
                >
                  {user.status.toUpperCase()}
                </span>
              </div>

              {/* Balance */}
              <div className="bg-black/40 p-6 rounded-xl border border-red-800/40">
                <div className="flex items-center gap-4 mb-4">
                  <FaWallet className="text-4xl text-green-400" />
                  <h3 className="text-xl font-semibold text-orange-100">
                    {isBangla ? "ব্যালেন্স" : "Balance"}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-400">
                  ৳ {Number(user.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
