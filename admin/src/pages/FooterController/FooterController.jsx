import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload, FaTimes, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const fetchFooterData = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/footer`);
  return data;
};

const FooterController = () => {
  const queryClient = useQueryClient();
  const { data: footerData = {}, isLoading, error } = useQuery({
    queryKey: ["footer-admin"],
    queryFn: fetchFooterData,
  });

  const [mainModalOpen, setMainModalOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewSocial, setPreviewSocial] = useState(null);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: footerData,
  });

  const {
    register: socialRegister,
    handleSubmit: socialSubmit,
    reset: socialReset,
    watch: watchSocial,
  } = useForm();

  const logoFile = watch("logo");
  const socialImageFile = watchSocial("socialImage");

  React.useEffect(() => {
    if (logoFile?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewLogo(reader.result);
      reader.readAsDataURL(logoFile[0]);
    } else {
      setPreviewLogo(null);
    }
  }, [logoFile]);

  React.useEffect(() => {
    if (socialImageFile?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewSocial(reader.result);
      reader.readAsDataURL(socialImageFile[0]);
    } else {
      setPreviewSocial(null);
    }
  }, [socialImageFile]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      if (data.logo?.[0]) formData.append("logo", data.logo[0]);
      formData.append("banglaTitle", data.banglaTitle?.trim() || "");
      formData.append("englishTitle", data.englishTitle?.trim() || "");
      formData.append("banglaDescription", data.banglaDescription?.trim() || "");
      formData.append("englishDescription", data.englishDescription?.trim() || "");
      formData.append("banglaSocialTitle", data.banglaSocialTitle?.trim() || "");
      formData.append("englishSocialTitle", data.englishSocialTitle?.trim() || "");
      return axios.put(
        `${import.meta.env.VITE_API_URL}/api/footer/${footerData._id || ""}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["footer-admin"]);
      toast.success("Footer updated successfully");
      setMainModalOpen(false);
      setPreviewLogo(null);
    },
    onError: (err) => {
      console.error("Update footer error:", err);
      toast.error(err.response?.data?.message || "Failed to update footer");
    },
  });

  const addSocialMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      if (data.socialImage?.[0]) {
        formData.append("socialImage", data.socialImage[0]);
      }
      if (data.linkUrl) {
        formData.append("linkUrl", data.linkUrl.trim());
      }
      return axios.put(
        `${import.meta.env.VITE_API_URL}/api/footer/${footerData._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["footer-admin"]);
      toast.success("Social link added successfully");
      setSocialModalOpen(false);
      setPreviewSocial(null);
      socialReset();
    },
    onError: (err) => {
      console.error("Add social error:", err);
      toast.error(err.response?.data?.message || "Failed to add social link");
    },
  });

  const deleteSocialMutation = useMutation({
    mutationFn: (socialId) =>
      axios.delete(
        `${import.meta.env.VITE_API_URL}/api/footer/${footerData._id}/social/${socialId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["footer-admin"]);
      toast.success("Social link deleted successfully");
    },
    onError: (err) => {
      console.error("Delete social error:", err);
      toast.error(err.response?.data?.message || "Failed to delete social link");
    },
  });

  const onSubmit = (data) => mutation.mutate(data);
  const onSocialSubmit = (data) => addSocialMutation.mutate(data);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-orange-300">
        Loading footer configuration...
      </div>
    );
  }

  if (error || !footerData?._id) {
    return (
      <div className="p-6 text-center text-red-400">
        Failed to load footer data. Please check if backend is running.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-orange-200">
            Footer Controller
          </h1>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => {
                reset(footerData);
                setMainModalOpen(true);
              }}
              className="bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-red-900/40 transition-all cursor-pointer"
            >
              <FaEdit /> Edit Texts & Logo
            </button>
            <button
              onClick={() => setSocialModalOpen(true)}
              className="bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-900/40 transition-all cursor-pointer"
            >
              <FaPlus /> Add Social Link
            </button>
          </div>
        </div>

        {/* Current Footer Preview Card */}
        <div className="bg-black/40 backdrop-blur-md border border-red-800/50 rounded-xl p-6 shadow-2xl mb-10">
          <h2 className="text-xl font-semibold text-orange-300 mb-4">
            Current Footer Preview
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={`${import.meta.env.VITE_API_URL}${footerData.logoUrl}`}
              alt="Footer Logo"
              className="w-32 h-20 object-contain rounded bg-black/60 p-2 border border-green-600/30"
              onError={(e) => (e.target.src = "/fallback-logo.png")}
            />
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-green-400">
                {footerData.banglaTitle || "No Bangla Title"}
              </h3>
              <p className="text-sm text-orange-200 mt-1">
                {footerData.englishTitle || "No English Title"}
              </p>
            </div>
          </div>
        </div>

        {/* Social Links List */}
        <div className="bg-black/40 backdrop-blur-md border border-red-800/50 rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-orange-300 mb-6 flex items-center gap-3">
            <FaUpload className="text-green-400" /> Social Links
          </h2>

          {footerData.socialLinks?.length === 0 ? (
            <div className="text-center py-12 text-orange-300/80">
              No social links added yet. Click "Add Social Link" to start.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {footerData.socialLinks.map((link) => (
                <div
                  key={link._id}
                  className="bg-gradient-to-br from-red-950/80 to-black/80 border border-red-800/40 rounded-lg p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-md"
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}${link.imageUrl}`}
                    alt="social icon"
                    className="w-14 h-14 object-contain rounded bg-black/60 p-2 border border-green-600/20"
                  />
                  <div className="flex-1 min-w-0">
                    <a
                      href={link.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-300 hover:text-orange-100 transition-colors cursor-pointer block truncate"
                    >
                      {link.linkUrl}
                    </a>
                  </div>
                  <button
                    onClick={() => deleteSocialMutation.mutate(link._id)}
                    className="bg-red-700 hover:bg-red-600 text-white p-3 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    title="Delete this social link"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Edit Modal */}
      <AnimatePresence>
        {mainModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setMainModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 md:p-8 rounded-2xl border border-red-800/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-orange-200">
                  Edit Footer Content
                </h2>
                <button
                  onClick={() => setMainModalOpen(false)}
                  className="text-orange-300 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-orange-200 mb-2 font-medium">
                      Bangla Title
                    </label>
                    <input
                      {...register("banglaTitle")}
                      className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-orange-200 mb-2 font-medium">
                      English Title
                    </label>
                    <input
                      {...register("englishTitle")}
                      className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-orange-200 mb-2 font-medium">
                      Bangla Description
                    </label>
                    <textarea
                      {...register("banglaDescription")}
                      rows={4}
                      className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-orange-200 mb-2 font-medium">
                      English Description
                    </label>
                    <textarea
                      {...register("englishDescription")}
                      rows={4}
                      className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-orange-200 mb-2 font-medium">
                      Bangla Social Title
                    </label>
                    <input
                      {...register("banglaSocialTitle")}
                      className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-orange-200 mb-2 font-medium">
                      English Social Title
                    </label>
                    <input
                      {...register("englishSocialTitle")}
                      className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-orange-200 mb-2 font-medium">
                    Footer Logo (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register("logo")}
                    className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white file:mr-4 file:py-2 file:px-5 file:rounded file:border-0 file:bg-red-700 file:text-white hover:file:bg-red-600 cursor-pointer"
                  />
                  {(previewLogo || footerData.logoUrl) && (
                    <div className="mt-4">
                      <p className="text-orange-200 mb-2">Current / New Preview:</p>
                      <img
                        src={previewLogo || `${import.meta.env.VITE_API_URL}${footerData.logoUrl}`}
                        alt="logo preview"
                        className="w-32 h-20 object-contain rounded-lg border border-green-600/30 bg-black/50"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Save Footer Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Social Link Modal */}
      <AnimatePresence>
        {socialModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSocialModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 md:p-8 rounded-2xl border border-red-800/50 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-200">
                  Add New Social Link
                </h2>
                <button
                  onClick={() => setSocialModalOpen(false)}
                  className="text-orange-300 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={socialSubmit(onSocialSubmit)} className="space-y-6">
                <div>
                  <label className="block text-orange-200 mb-2 font-medium">
                    Social Icon Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    {...socialRegister("socialImage", { required: true })}
                    className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white file:mr-4 file:py-2 file:px-5 file:rounded file:border-0 file:bg-red-700 file:text-white hover:file:bg-red-600 cursor-pointer"
                  />
                  {previewSocial && (
                    <div className="mt-4 text-center">
                      <img
                        src={previewSocial}
                        alt="social preview"
                        className="w-20 h-20 object-contain rounded-lg border border-green-600/30 bg-black/50 inline-block"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-orange-200 mb-2 font-medium">
                    Full Social Link URL
                  </label>
                  <input
                    type="url"
                    {...socialRegister("linkUrl", { required: true })}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Example: https://facebook.com/wingobd
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Add Social Link
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FooterController;