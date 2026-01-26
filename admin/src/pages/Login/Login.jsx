import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import useAuth from "../../hook/useAuth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/login`,
        formData
      );
      return response.data;
    },

    onSuccess: (data) => {
      // ──────────────────────────────────────────────
      // Debug: always log the real response shape
      console.log("Login success - full response:", data);

      // Try different possible keys where user/admin info might be
      const userInfo =
        data.user ||
        data.admin ||
        data.data || // sometimes nested
        (data.email && data.id ? data : null); // flat structure fallback

      if (!userInfo || !userInfo.email || !userInfo.id) {
        console.warn("No valid user info found in response", data);
        toast.warn("লগইন সফল, কিন্তু প্রোফাইল লোড করতে সমস্যা হয়েছে।");
      }

      // Safely extract email & id
      const email = userInfo?.email || "";
      const id = userInfo?.id || userInfo?._id || "";

      // Call your auth login function
      login({ email, id }, data.token || data.accessToken);

      toast.success("লগইন সফল হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });

      navigate("/");
    },

    onError: (err) => {
      console.error("Login mutation failed:", err);

      let msg = "লগইন ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।";

      if (err.response?.data) {
        const resData = err.response.data;
        msg =
          resData.message ||
          resData.error ||
          resData.msg ||
          (typeof resData === "string" ? resData : msg);
      } else if (err.message?.includes("Network Error")) {
        msg = "সার্ভারের সাথে সংযোগ সমস্যা। ইন্টারনেট চেক করুন।";
      } else if (err.code === "ECONNABORTED") {
        msg = "সার্ভারের উত্তর দিতে সময় লাগছে। পরে চেষ্টা করুন।";
      }

      toast.error(msg, {
        position: "top-right",
        autoClose: 5500,
        theme: "dark",
      });
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-red-800/40 rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Logo / Title */}
        <div className="text-center mb-6">
          <div className="inline-block w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/60 mb-4">
            <span className="text-white font-black text-4xl">W</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            WiN GO Admin
          </h1>
          <p className="text-orange-300/80 mt-2">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-orange-200 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "ইমেইল প্রয়োজন",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "সঠিক ইমেইল দিন",
                },
              })}
              className={`w-full px-4 py-3 rounded-lg bg-black/50 border ${
                errors.email ? "border-red-500" : "border-red-800/60"
              } text-orange-100 placeholder-red-100/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all`}
              placeholder="admin@example.com"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-orange-200 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password", {
                  required: "পাসওয়ার্ড প্রয়োজন",
                  minLength: {
                    value: 6,
                    message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg bg-black/50 border ${
                  errors.password ? "border-red-500" : "border-red-800/60"
                } text-orange-100 placeholder-red-100/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all pr-12`}
                placeholder="*******"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-300 hover:text-orange-100 focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isLoading}
            className={`
              w-full py-3.5 px-6 rounded-xl font-bold text-white text-lg
              bg-gradient-to-r from-orange-600 to-red-600
              hover:from-orange-500 hover:to-red-500
              focus:outline-none focus:ring-2 focus:ring-orange-500/40
              shadow-lg shadow-red-900/40
              transition-all duration-300
              cursor-pointer
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            {loginMutation.isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                লোড হচ্ছে...
              </span>
            ) : (
              "লগইন করুন"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-orange-300/70">
          <p>যদি অ্যাকাউন্ট না থাকে তাহলে অ্যাডমিনের সাথে যোগাযোগ করুন</p>
        </div>
      </div>
    </div>
  );
};

export default Login;