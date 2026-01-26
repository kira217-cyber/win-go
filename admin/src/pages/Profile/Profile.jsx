// src/pages/admin/Profile.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const payload = {};

      if (data.email?.trim()) payload.email = data.email.trim();
      if (data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      const token = localStorage.getItem('adminToken'); // adjust key if different

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('প্রোফাইল আপডেট সফল হয়েছে!', {
        position: 'top-right',
        autoClose: 3000,
      });

      // If email changed → force re-login
      if (data.email?.trim()) {
        toast.info('ইমেইল পরিবর্তন হয়েছে। পুনরায় লগইন করুন।');
        localStorage.removeItem('adminToken');
        navigate('/login'); // adjust path if needed
      }

      reset();
    } catch (err) {
      const message =
        err.response?.data?.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।';
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-red-800/40 rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/60 mb-4">
            <span className="text-white font-black text-4xl">W</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            WiN GO Admin
          </h1>
          <p className="text-orange-300/80 mt-2">Update your profile</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-orange-200 mb-2"
            >
              New Email 
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`w-full px-4 py-3 rounded-lg bg-black/50 border ${
                errors.email ? 'border-red-500' : 'border-red-800/60'
              } text-orange-100 placeholder-red-100/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all`}
              placeholder="Leave blank if not changing"
            />
          </div>

          {/* Current Password */}
          <div className="relative">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-orange-200 mb-2"
            >
              Current Password{' '}
              {newPassword && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('currentPassword', {
                  required: !!newPassword,
                  minLength: {
                    value: 6,
                    message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg bg-black/50 border ${
                  errors.currentPassword ? 'border-red-500' : 'border-red-800/60'
                } text-orange-100 placeholder-red-100/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all pr-12`}
                placeholder="Required when changing password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-300 hover:text-orange-100 focus:outline-none cursor-pointer"
              >
                {showCurrentPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1.5 text-sm text-red-400">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="relative">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-orange-200 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword', {
                  minLength: {
                    value: 6,
                    message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg bg-black/50 border ${
                  errors.newPassword ? 'border-red-500' : 'border-red-800/60'
                } text-orange-100 placeholder-red-100/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all pr-12`}
                placeholder="Leave blank if not changing"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-300 hover:text-orange-100 focus:outline-none cursor-pointer"
              >
                {showNewPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1.5 text-sm text-red-400">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          {newPassword && (
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-orange-200 mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                {...register('confirmNewPassword', {
                  required: !!newPassword,
                  validate: (value) =>
                    value === newPassword || 'পাসওয়ার্ড মিলছে না',
                })}
                className={`w-full px-4 py-3 rounded-lg bg-black/50 border ${
                  errors.confirmNewPassword ? 'border-red-500' : 'border-red-800/60'
                } text-orange-100 placeholder-red-100/50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all`}
              />
              {errors.confirmNewPassword && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
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
            {loading ? (
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
                আপডেট হচ্ছে...
              </span>
            ) : (
              'প্রোফাইল আপডেট করুন'
            )}
          </button>
        </form>

        {/* Footer note */}
        <div className="mt-8 text-center text-sm text-orange-300/70">
          <p>পাসওয়ার্ড পরিবর্তন করলে পুনরায় লগইন করতে হবে</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;