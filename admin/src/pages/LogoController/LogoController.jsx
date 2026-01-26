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
    { headers: { "Content-Type": "multipart/form-data" } },
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
      toast.success("Image updated successfully!", { theme: "dark" });
    },
    onError: () => toast.error("Failed to update image.", { theme: "dark" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLogo,
    onSuccess: () => {
      queryClient.invalidateQueries(["logos"]);
      toast.success("Image deleted successfully!", { theme: "dark" });
    },
    onError: () => toast.error("Failed to delete image.", { theme: "dark" }),
  });

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const { register, handleSubmit: formSubmit, reset, watch } = useForm();

  const openUploadModal = (type) => {
    setSelectedType(type);
    setUploadModalOpen(true);
    reset();
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
    const file = data[selectedType]?.[0];
    if (!file) {
      toast.warn("Please select an image first.");
      return;
    }
    formData.append(selectedType, file);
    mutation.mutate(formData);
    closeUploadModal();
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

  const imageTypes = [
    { key: "websiteLogo", label: "Website Logo" },
    { key: "loginLogo", label: "Login Page Logo" },
    { key: "registerImage", label: "Register Page Image" },
    { key: "outerBackground", label: "Outer Background (RootLayout)" },
    { key: "innerBackground", label: "Inner Background (Content Area)" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 p-6 md:p-10">
      <h1 className="text-3xl font-bold text-orange-200 mb-10 text-center tracking-wide">
        Image & Logo Controller
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {imageTypes.map(({ key, label }) => (
          <div
            key={key}
            className="bg-gradient-to-b from-orange-900/40 via-red-900/30 to-black/50 border border-red-800/50 rounded-2xl shadow-xl shadow-red-950/40 p-5 flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold text-orange-100 mb-4 text-center">
              {label}
            </h2>

            {logos?.[key] ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/${logos[key]}`}
                alt={label}
                className="w-44 h-44 object-cover rounded-lg mb-5 border border-orange-600/60 shadow-md"
              />
            ) : (
              <div className="w-44 h-44 flex flex-col items-center justify-center bg-black/60 rounded-lg mb-5 border border-red-800/70 text-orange-300 text-center p-3">
                <FaImage className="text-5xl mb-2" />
                <span className="text-sm">No image uploaded</span>
              </div>
            )}

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => openUploadModal(key)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-lg text-white text-sm font-medium transition-all shadow-md border border-red-600/50"
              >
                <FaUpload size={14} />
                Upload
              </button>

              {logos?.[key] && (
                <button
                  onClick={() => openDeleteModal(key)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 rounded-lg text-white text-sm font-medium transition-all shadow-md border border-red-700/50"
                >
                  <FaTrash size={14} />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-orange-950 via-red-950 to-black border border-red-800/50 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-5"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-orange-100">
                Upload / Update —{" "}
                {imageTypes.find((t) => t.key === selectedType)?.label}
              </h3>
              <button onClick={closeUploadModal}>
                <FaTimes
                  size={26}
                  className="text-orange-300 hover:text-white"
                />
              </button>
            </div>

            <form onSubmit={formSubmit(onSubmit)}>
              <input
                type="file"
                {...register(selectedType)}
                accept="image/*"
                className="w-full px-4 py-3 bg-black/60 border border-red-800/70 rounded-xl text-orange-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-900/60 file:text-orange-100 hover:file:bg-red-800/70 cursor-pointer mb-5"
              />

              {filePreview && (
                <div className="mb-5">
                  <img
                    src={URL.createObjectURL(filePreview)}
                    alt="Preview"
                    className="w-full h-40 object-contain rounded-xl border border-orange-600/50 shadow-md"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all shadow-lg"
              >
                <FaUpload />
                Upload Image
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-orange-950 via-red-950 to-black border border-red-800/50 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-5 text-center"
          >
            <h3 className="text-xl font-bold text-orange-100 mb-4">
              Delete Confirmation
            </h3>
            <p className="text-orange-300 mb-8">
              Are you sure you want to delete this image?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex gap-5 justify-center">
              <button
                onClick={confirmDelete}
                className="px-7 py-3 bg-gradient-to-r from-red-700 to-red-950 hover:from-red-600 hover:to-red-900 rounded-xl text-white font-medium transition-all shadow-lg"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="px-7 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all shadow-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LogoController;
