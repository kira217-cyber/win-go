// pages/Register.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../../hook/useAuth";
import { useLanguage } from "../../context/LanguageProvider";

const Register = () => {
  const { isBangla } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [logo, setLogo] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      referCode: "",
    },
  });

  useEffect(() => {
    const ref = searchParams.get("ref");

    if (ref) {
      setValue("referCode", ref.trim().toUpperCase());
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setSettingsLoading(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/logos`,
        );

        setLogo(res.data?.registerImage || null);
      } catch (err) {
        console.error("Failed to load logo settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchLogo();
  }, []);

  const texts = {
    title: isBangla ? "নতুন একাউন্ট তৈরি করুন" : "Create a new account",
    firstNameLabel: isBangla ? "নামের প্রথম অংশ" : "First Name",
    firstNamePlaceholder: isBangla ? "প্রথম নাম" : "First Name",
    firstNameRequired: isBangla ? "প্রথম নাম দিন" : "First name is required",
    lastNameLabel: isBangla ? "নামের শেষ অংশ" : "Last Name",
    lastNamePlaceholder: isBangla ? "শেষ নাম" : "Last Name",
    lastNameRequired: isBangla ? "শেষ নাম দিন" : "Last name is required",
    phoneLabel: isBangla ? "মোবাইল নম্বর" : "Mobile Number",
    phonePlaceholder: "01XXXXXXXXX",
    phoneRequired: isBangla ? "মোবাইল নম্বর দিন" : "Mobile number is required",
    passwordLabel: isBangla ? "পাসওয়ার্ড" : "Password",
    passwordPlaceholder: "******",
    passwordRequired: isBangla ? "পাসওয়ার্ড দিন" : "Password is required",
    passwordMinLength: isBangla ? "কমপক্ষে ৬ অক্ষর" : "At least 6 characters",
    referLabel: isBangla ? "রেফার কোড (ঐচ্ছিক)" : "Referral Code (optional)",
    referPlaceholder: isBangla ? "ঐচ্ছিক" : "Optional",
    registerButton: isBangla ? "রেজিস্টার করুন" : "Register",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    alreadyHaveAccount: isBangla
      ? "ইতিমধ্যে একাউন্ট আছে?"
      : "Already have an account?",
    loginLink: isBangla ? "লগইন করুন" : "Login",
    successToast: isBangla ? "রেজিস্ট্রেশন সফল!" : "Registration successful!",
    errorToast: isBangla ? "রেজিস্ট্রেশন ব্যর্থ" : "Registration failed",
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        referCode: data.referCode?.trim() || "",
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/register`,
        payload,
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

  const logoSrc = logo
    ? /^https?:\/\//i.test(logo)
      ? logo
      : `${import.meta.env.VITE_API_URL}/${logo}`
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-18">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-red-800/40 rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          {logoSrc && (
            <div className="inline-flex rounded-xl items-center justify-center shadow-lg shadow-red-900/60 mb-4">
              <img
                src={logoSrc}
                alt="Logo"
                className="max-h-20 object-contain"
              />
            </div>
          )}

          <p className="text-orange-300/80 mt-2">{texts.title}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-orange-200 mb-2">
                {texts.firstNameLabel}
              </label>
              <input
                placeholder={texts.firstNamePlaceholder}
                {...register("firstName", {
                  required: texts.firstNameRequired,
                })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500 outline-none"
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-orange-200 mb-2">
                {texts.lastNameLabel}
              </label>
              <input
                placeholder={texts.lastNamePlaceholder}
                {...register("lastName", {
                  required: texts.lastNameRequired,
                })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500 outline-none"
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
              {texts.phoneLabel}
            </label>
            <input
              type="tel"
              {...register("phone", {
                required: texts.phoneRequired,
              })}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500 outline-none"
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
              placeholder={texts.passwordPlaceholder}
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: texts.passwordRequired,
                minLength: {
                  value: 6,
                  message: texts.passwordMinLength,
                },
              })}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500 pr-12 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
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
              {texts.referLabel}
            </label>
            <input
              {...register("referCode")}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-red-800/60 text-white focus:border-orange-500 outline-none uppercase"
              placeholder={texts.referPlaceholder}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || settingsLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? texts.loading : texts.registerButton}
          </button>
        </form>

        <p className="text-center text-orange-300/80 mt-6">
          {texts.alreadyHaveAccount}{" "}
          <Link
            to="/login"
            className="text-orange-400 hover:underline cursor-pointer"
          >
            {texts.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
