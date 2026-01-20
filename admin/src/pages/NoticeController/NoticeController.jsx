// src/pages/controller/NoticeController.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Marquee from "react-fast-marquee";
import { motion } from "framer-motion";
import { FaSave, FaEdit, FaBullhorn } from "react-icons/fa";

const NoticeController = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice-admin"],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notice/admin`);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      axios.post(`${import.meta.env.VITE_API_URL}/api/notice`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["notice-admin"]);
      queryClient.invalidateQueries(["notice"]); // ক্লায়েন্ট সাইডেও আপডেট
      toast.success("Notice updated successfully!");
    },
    onError: () => toast.error("Failed to update notice"),
  });

  React.useEffect(() => {
    if (notice) {
      setValue("textBn", notice.textBn || "");
      setValue("textEn", notice.textEn || "");
    }
  }, [notice, setValue]);

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="p-10 text-center text-orange-300">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-orange-200 mb-8 text-center">
          Notice Marquee Controller
        </h1>

        <div className="bg-black/40 backdrop-blur-md border border-red-800/50 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Bangla Notice */}
            <div>
              <label className="block text-orange-200 font-semibold mb-3 text-lg">
                নোটিশ টেক্সট (বাংলা)
              </label>
              <textarea
                {...register("textBn", { required: true })}
                rows={4}
                className="w-full p-4 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                placeholder="উইন গো-তে স্বাগতম — স্মার্টভাবে খেলুন..."
              />
            </div>

            {/* English Notice */}
            <div>
              <label className="block text-orange-200 font-semibold mb-3 text-lg">
                Notice Text (English)
              </label>
              <textarea
                {...register("textEn", { required: true })}
                rows={4}
                className="w-full p-4 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                placeholder="Welcome to WiN GO — Play smart & win big!"
              />
            </div>

            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 px-12 rounded-xl shadow-lg flex items-center gap-3 mx-auto transition-all transform hover:scale-105 disabled:opacity-70 cursor-pointer"
              >
                <FaSave size={22} />
                {mutation.isPending ? "Saving..." : "Save Notice"}
              </button>
            </div>
          </form>

          {/* Live Preview */}
          <div className="mt-10 p-6 bg-black/50 rounded-lg border border-green-600/30">
            <p className="text-orange-200 font-semibold mb-3">Live Preview:</p>
            <div className="bg-gradient-to-r from-orange-500 via-red-600 to-red-900 py-3 px-10 rounded-md shadow-lg overflow-hidden">
              <Marquee speed={50} pauseOnHover>
                <span className="text-white font-bold flex items-center gap-3">
                  <FaBullhorn className="text-yellow-300" />
                  {notice?.textBn || "No notice set"}
                </span>
              </Marquee>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NoticeController;