// pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../../hook/useAuth";
import { useLanguage } from "../../context/LanguageProvider"; // আপনার প্রজেক্টের পাথ অনুযায়ী adjust করুন

const Login = () => {
  const { isBangla } = useLanguage();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/logos`,
        );
        setLogo(res.data.loginLogo);
      } catch (err) {
        console.error("Failed to load logo settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchLogo();
  }, []);

  // ভাষা অনুযায়ী টেক্সট
  const texts = {
    title: isBangla ? "আপনার একাউন্টে লগইন করুন" : "Login to your account",
    phoneLabel: isBangla ? "মোবাইল নম্বর" : "Mobile Number",
    phonePlaceholder: isBangla ? "01XXXXXXXXX" : "01XXXXXXXXX",
    phoneRequired: isBangla ? "মোবাইল নম্বর দিন" : "Mobile number is required",
    passwordLabel: isBangla ? "পাসওয়ার্ড" : "Password",
    passwordPlaceholder: "*******",
    passwordRequired: isBangla ? "পাসওয়ার্ড দিন" : "Password is required",
    loginButton: isBangla ? "লগইন করুন" : "Login",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noAccount: isBangla ? "একাউন্ট নেই?" : "Don't have an account?",
    registerLink: isBangla ? "রেজিস্টার করুন" : "Register",
    successToast: isBangla ? "লগইন সফল!" : "Login successful!",
    errorToast: isBangla ? "লগইন ব্যর্থ" : "Login failed",
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/login`,
        data,
      );
      return res.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success(texts.successToast);
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || texts.errorToast);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-red-800/40 rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-block rounded-xl flex items-center justify-center shadow-lg shadow-red-900/60 mb-4">
            <img src={`${import.meta.env.VITE_API_URL}/${logo}`} alt="Logo" />
          </div>
          <p className="text-orange-300/80 mt-1">{texts.title}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm text-orange-200 mb-2">
              {texts.phoneLabel}
            </label>
            <input
              type="tel"
              {...register("phone", { required: texts.phoneRequired })}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500"
              placeholder={texts.phonePlaceholder}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm text-orange-200 mb-2">
              {texts.passwordLabel}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={texts.passwordPlaceholder}
              {...register("password", { required: texts.passwordRequired })}
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

          <button
            type="submit"
            disabled={mutation.isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg cursor-pointer disabled:opacity-60"
          >
            {mutation.isLoading ? texts.loading : texts.loginButton}
          </button>
        </form>

        <p className="text-center text-orange-300/80 mt-6">
          {texts.noAccount}{" "}
          <Link
            to="/register"
            className="text-orange-400 hover:underline cursor-pointer"
          >
            {texts.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
