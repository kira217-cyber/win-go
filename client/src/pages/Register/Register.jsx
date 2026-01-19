// pages/Register.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../../hook/useAuth";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/register`,
        data,
      );
      return res.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success("রেজিস্ট্রেশন সফল!");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "রেজিস্ট্রেশন ব্যর্থ");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-red-800/40 rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/60 mb-4">
            <span className="text-white font-black text-4xl">W</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            WiN GO
          </h1>
          <p className="text-orange-300/80 mt-2">নতুন একাউন্ট তৈরি করুন</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-orange-200 mb-2">
                নামের প্রথম অংশ
              </label>
              <input
                placeholder="First Name"
                {...register("firstName", { required: "প্রথম নাম দিন" })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500"
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-orange-200 mb-2">
                নামের শেষ অংশ
              </label>
              <input
                placeholder="Last Name"
                {...register("lastName", { required: "শেষ নাম দিন" })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500"
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-orange-200 mb-2">
              মোবাইল নম্বর
            </label>
            <input
              type="tel"
              {...register("phone", { required: "মোবাইল নম্বর দিন" })}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500"
              placeholder="01XXXXXXXXX"
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm text-orange-200 mb-2">
              পাসওয়ার্ড
            </label>
            <input
              placeholder="******"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "পাসওয়ার্ড দিন",
                minLength: { value: 6, message: "কমপক্ষে ৬ অক্ষর" },
              })}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-orange-300 hover:text-orange-100 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-orange-200 mb-2">
              রেফার কোড (ঐচ্ছিক)
            </label>
            <input
              {...register("referCode")}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500"
              placeholder="Optional"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg cursor-pointer disabled:opacity-60"
          >
            {mutation.isLoading ? "লোড হচ্ছে..." : "রেজিস্টার করুন"}
          </button>
        </form>

        <p className="text-center text-orange-300/80 mt-6">
          ইতিমধ্যে একাউন্ট আছে?{" "}
          <Link
            to="/login"
            className="text-orange-400 hover:underline cursor-pointer"
          >
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
