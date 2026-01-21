import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUpload, FaTrash, FaTimes, FaImage } from "react-icons/fa";
import { motion } from "framer-motion";

const fetchLogos = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/logos`);
  return data;
};

const updateLogo = async (formData) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/logos`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
};

const deleteLogo = async (type) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_API_URL}/api/logos/${type}`,
  );
  return data;
};

const LogoController = () => {
  const queryClient = useQueryClient();
  const { data: logos, isLoading } = useQuery({
    queryKey: ["logos"],
    queryFn: fetchLogos,
  });

  const mutation = useMutation({
    mutationFn: updateLogo,
    onSuccess: () => {
      queryClient.invalidateQueries(["logos"]);
      toast.success("Logo updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    },
    onError: () => {
      toast.error("There was a problem updating the logo.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLogo,
    onSuccess: () => {
      queryClient.invalidateQueries(["logos"]);
      toast.success("Logo successfully deleted!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    },
    onError: () => {
      toast.error("There was a problem deleting the logo.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    },
  });

  // States for modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // Forms for each logo (but shared for modal)
  const { register, handleSubmit: formSubmit, reset, watch } = useForm();

  const openUploadModal = (type) => {
    setSelectedType(type);
    setUploadModalOpen(true);
    reset(); // Reset form for new upload
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedType(null);
  };

  const openDeleteModal = (type) => {
    setSelectedType(type);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedType(null);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    const file = data[selectedType][0];
    if (file) {
      formData.append(selectedType, file);
      mutation.mutate(formData);
      closeUploadModal();
    } else {
      toast.warn("Please select an image.", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedType);
    closeDeleteModal();
  };

  const filePreview = watch(selectedType)?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-orange-200">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-t-orange-500 border-orange-200 rounded-full"
        />
        <span className="ml-4 text-xl">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 p-6 md:p-10">
      <h1 className="text-3xl font-bold text-orange-200 mb-8 text-center tracking-wide">
        Logo Controller
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Website Logo Card */}
        <div className="bg-gradient-to-b from-orange-900/50 via-red-900/40 to-black/50 border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/30 p-6 flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-orange-100 mb-4">
            Website Logo
          </h2>
          {logos?.websiteLogo ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/${logos.websiteLogo}`}
              alt="Website Logo"
              className="w-48 h-48 object-contain rounded-lg mb-4 border border-orange-500/50 shadow-md"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-black/50 rounded-lg mb-4 border border-red-800/60 text-orange-300 text-center">
              <FaImage className="text-6xl mr-2" />
              <span>No logo uploaded.</span>
            </div>
          )}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => openUploadModal("websiteLogo")}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
            >
              <FaUpload />
              Upload/Update
            </button>
            {logos?.websiteLogo && (
              <button
                onClick={() => openDeleteModal("websiteLogo")}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                <FaTrash />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Login Logo Card */}
        <div className="bg-gradient-to-b from-orange-900/50 via-red-900/40 to-black/50 border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/30 p-6 flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-orange-100 mb-4">
            Login Page Logo
          </h2>
          {logos?.loginLogo ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/${logos.loginLogo}`}
              alt="Login Logo"
              className="w-48 h-48 object-contain rounded-lg mb-4 border border-orange-500/50 shadow-md"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-black/50 rounded-lg mb-4 border border-red-800/60 text-orange-300 text-center">
              <FaImage className="text-6xl mr-2" />
              <span>No logo uploaded.</span>
            </div>
          )}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => openUploadModal("loginLogo")}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
            >
              <FaUpload />
              Upload/Update
            </button>
            {logos?.loginLogo && (
              <button
                onClick={() => openDeleteModal("loginLogo")}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                <FaTrash />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Register Image Card */}
        <div className="bg-gradient-to-b from-orange-900/50 via-red-900/40 to-black/50 border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/30 p-6 flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-orange-100 mb-4">
            Register Page Logo
          </h2>
          {logos?.registerImage ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/${logos.registerImage}`}
              alt="Register Image"
              className="w-48 h-48 object-contain rounded-lg mb-4 border border-orange-500/50 shadow-md"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-black/50 rounded-lg mb-4 border border-red-800/60 text-orange-300 text-center">
              <FaImage className="text-6xl mr-2" />
              <span>No logo uploaded.</span>
            </div>
          )}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => openUploadModal("registerImage")}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
            >
              <FaUpload />
              Upload/Update
            </button>
            {logos?.registerImage && (
              <button
                onClick={() => openDeleteModal("registerImage")}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                <FaTrash />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-orange-950 via-red-950 to-black border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/50 p-8 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-orange-100">
                {selectedType === "websiteLogo" && "ওয়েবসাইট লোগো"}
                {selectedType === "loginLogo" && "লগইন পেজ লোগো"}
                {selectedType === "registerImage" && "রেজিস্টার পেজ ইমেজ"}{" "}
                Upload/Update
              </h3>
              <button
                onClick={closeUploadModal}
                className="text-orange-300 hover:text-orange-100 transition-colors cursor-pointer"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <form onSubmit={formSubmit(onSubmit)}>
              <input
                type="file"
                {...register(selectedType)}
                accept="image/*"
                className="w-full px-4 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer mb-4"
              />
              {filePreview && (
                <img
                  src={URL.createObjectURL(filePreview)}
                  alt="Preview"
                  className="w-full h-32 object-contain rounded-lg mb-4 border border-orange-500/50"
                />
              )}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                <FaUpload />
                Submit
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-orange-950 via-red-950 to-black border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/50 p-8 w-full max-w-md mx-4 text-center"
          >
            <h3 className="text-xl font-bold text-orange-100 mb-4">
              Are you sure you want to delete this logo?
            </h3>
            <p className="text-orange-300 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                Yes, delete.
              </button>
              <button
                onClick={closeDeleteModal}
                className="px-6 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                No, cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LogoController;
