import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
  FaSave,
} from "react-icons/fa";
import { motion } from "framer-motion";

const fetchPromotions = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/promotions`,
  );
  return data;
};

const createPromotion = async (formData) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/promotions`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

const updatePromotion = async ({ id, formData }) => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_API_URL}/api/promotions/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

const deletePromotion = async (id) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_API_URL}/api/promotions/${id}`,
  );
  return data;
};

const AddPromotion = () => {
  const queryClient = useQueryClient();
  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions"],
    queryFn: fetchPromotions,
  });

  const createMutation = useMutation({
    mutationFn: createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries(["promotions"]);
      toast.success("Promotion added successfully!", { theme: "dark" });
    },
    onError: () => toast.error("Failed to add promotion.", { theme: "dark" }),
  });

  const updateMutation = useMutation({
    mutationFn: updatePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries(["promotions"]);
      toast.success("Promotion updated successfully!", { theme: "dark" });
    },
    onError: () =>
      toast.error("Failed to update promotion.", { theme: "dark" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries(["promotions"]);
      toast.success("Promotion deleted successfully!", { theme: "dark" });
    },
    onError: () =>
      toast.error("Failed to delete promotion.", { theme: "dark" }),
  });

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [preview, setPreview] = useState(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const openAddModal = () => {
    setAddModalOpen(true);
    reset();
    setPreview(null);
  };

  const closeAddModal = () => setAddModalOpen(false);

  const openUpdateModal = (promo) => {
    setSelectedPromotion(promo);
    setUpdateModalOpen(true);
    setValue("titleBn", promo.titleBn);
    setValue("titleEn", promo.titleEn);
    setValue("descBn", promo.descBn);
    setValue("descEn", promo.descEn);
    setPreview(promo.image ? `/${promo.image}` : null);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedPromotion(null);
    setPreview(null);
  };

  const openDeleteModal = (promo) => {
    setSelectedPromotion(promo);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedPromotion(null);
  };

  const onCreateSubmit = (data) => {
    const formData = new FormData();
    formData.append("titleBn", data.titleBn);
    formData.append("titleEn", data.titleEn);
    formData.append("descBn", data.descBn);
    formData.append("descEn", data.descEn);
    if (data.image?.[0]) formData.append("image", data.image[0]);
    createMutation.mutate(formData);
    closeAddModal();
  };

  const onUpdateSubmit = (data) => {
    const formData = new FormData();
    formData.append("titleBn", data.titleBn);
    formData.append("titleEn", data.titleEn);
    formData.append("descBn", data.descBn);
    formData.append("descEn", data.descEn);
    if (data.image?.[0]) formData.append("image", data.image[0]);
    updateMutation.mutate({ id: selectedPromotion._id, formData });
    closeUpdateModal();
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedPromotion._id);
    closeDeleteModal();
  };

  // Preview image
  const watchedImage = watch("image")?.[0];
  useEffect(() => {
    if (watchedImage) {
      const url = URL.createObjectURL(watchedImage);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedImage]);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-200 tracking-wide">
          Promotion Management
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
        >
          <FaPlus /> Add Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions?.map((promo) => (
          <div
            key={promo._id}
            className="bg-gradient-to-b from-orange-900/50 via-red-900/40 to-black/50 border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/30 p-6 flex flex-col"
          >
            {promo.image && (
              <img
                src={`${import.meta.env.VITE_API_URL}/${promo.image}`}
                alt={promo.titleEn}
                className="w-full h-40 object-cover rounded-lg mb-4 border border-orange-500/50 shadow-md"
              />
            )}
            <h3 className="text-xl font-semibold text-orange-100 mb-2">
              {promo.titleEn}
            </h3>
            <p className="text-orange-300 mb-2">{promo.titleBn}</p>
            <p className="text-sm text-gray-300 mb-4 line-clamp-3">
              {promo.descEn}
            </p>
            <div className="flex gap-4 mt-auto">
              <button
                onClick={() => openUpdateModal(promo)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-md border border-red-600/40 cursor-pointer"
              >
                <FaEdit /> Update
              </button>
              <button
                onClick={() => openDeleteModal(promo)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-300 shadow-md border border-red-600/40 cursor-pointer"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-orange-950 via-red-950 to-black border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/50 p-8 w-full max-w-lg mx-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-orange-100">
                Add New Promotion
              </h3>
              <button
                onClick={closeAddModal}
                className="text-orange-300 hover:text-orange-100 transition-colors cursor-pointer"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onCreateSubmit)}>
              <input
                {...register("titleEn")}
                placeholder="Promotion Title (English)"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              <input
                {...register("titleBn")}
                placeholder="Promotion Title (Bangla)"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              <textarea
                {...register("descEn")}
                placeholder="Promotion Description (English)"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                rows={3}
              />
              <textarea
                {...register("descBn")}
                placeholder="Promotion Description (Bangla)"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                rows={3}
              />
              <input
                type="file"
                {...register("image")}
                accept="image/*"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-32 object-contain rounded-lg mb-4 border border-orange-500/50"
                />
              )}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                <FaSave /> Save
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-orange-950 via-red-950 to-black border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/50 p-8 w-full max-w-lg mx-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-orange-100">
                Update Promotion
              </h3>
              <button
                onClick={closeUpdateModal}
                className="text-orange-300 hover:text-orange-100 transition-colors cursor-pointer"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onUpdateSubmit)}>
              <input
                {...register("titleEn")}
                placeholder="Promotion Title (English)"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              <input
                {...register("titleBn")}
                placeholder="Promotion Title (Bangla)"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
              <textarea
                {...register("descEn")}
                placeholder="Promotion Description (English)"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                rows={3}
              />
              <textarea
                {...register("descBn")}
                placeholder="Promotion Description (Bangla)"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                rows={3}
              />
              <input
                type="file"
                {...register("image")}
                accept="image/*"
                className="w-full px-4 py-3 mb-4 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-32 object-contain rounded-lg mb-4 border border-orange-500/50"
                />
              )}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                <FaSave /> Save Update
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
              Are you sure you want to delete this promotion?
            </h3>
            <p className="text-orange-300 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="px-6 py-3 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
              >
                No, Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AddPromotion;
