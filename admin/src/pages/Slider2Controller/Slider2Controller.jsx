import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload, FaTimes, FaEdit, FaTrash } from "react-icons/fa";

const fetchSliders = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/slider/two`,
  );
  return data;
};

const Slider2Controller = () => {
  const queryClient = useQueryClient();
  const { data: sliders = [], isLoading } = useQuery({
    queryKey: ["sliders"],
    queryFn: fetchSliders,
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { register, handleSubmit, reset, watch } = useForm();

  // Watch for file changes to generate preview
  const imageFile = watch("image");

  React.useEffect(() => {
    if (imageFile && imageFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(imageFile[0]);
    } else {
      setPreviewImage(null);
    }
  }, [imageFile]);

  // Add or Update mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }
      if (editingSlider) {
        return axios.put(
          `${import.meta.env.VITE_API_URL}/api/slider/two/${editingSlider._id}`,
          formData,
        );
      } else {
        return axios.post(
          `${import.meta.env.VITE_API_URL}/api/slider/two`,
          formData,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sliders"]);
      reset();
      setPreviewImage(null);
      setAddModalOpen(false);
      setEditModalOpen(false);
      setEditingSlider(null);
      toast.success(editingSlider ? "Slider updated" : "Slider added");
    },
    onError: (error) => toast.error(error.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`${import.meta.env.VITE_API_URL}/api/slider/two/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["sliders"]);
      toast.success("Slider deleted");
      setShowConfirm(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const startAdd = () => {
    reset();
    setPreviewImage(null);
    setAddModalOpen(true);
  };

  const startEdit = (slider) => {
    reset();
    setEditingSlider(slider);
    setPreviewImage(`${import.meta.env.VITE_API_URL}${slider.imageUrl}`);
    setEditModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = () => deleteMutation.mutate(deleteId);

  if (isLoading) return <div className="text-gray-100">Loading...</div>;

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-orange-200">
        Slider Controller
      </h1>

      {/* Add Button */}
      <button
        onClick={startAdd}
        className="bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 px-6 rounded-xl mb-8 flex items-center gap-2 transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
      >
        <FaUpload /> Add Slider
      </button>

      {/* Sliders List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sliders.length > 0 ? (
          sliders.map((slider) => (
            <div
              key={slider._id}
              className="bg-black/40 backdrop-blur-md border border-red-800/50 rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src={`${import.meta.env.VITE_API_URL}${slider.imageUrl}`}
                alt="slider"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-orange-200 mb-1">
                  Added at: {new Date(slider.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-orange-200 mb-4">
                  Updated at: {new Date(slider.updatedAt).toLocaleString()}
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => startEdit(slider)}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(slider._id)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-red-900/30 flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-orange-200 mb-2">
              No sliders found
            </h3>
            <p className="text-orange-300/80 max-w-md">
              You haven't added any sliders yet. Click the "Add Slider" button
              above to get started.
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 rounded-xl border border-red-800/50 shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-orange-200">
                  Add New Slider
                </h2>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="text-orange-200 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label className="block text-orange-200 mb-2">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    {...register("image", { required: true })}
                    accept="image/*"
                    className="w-full bg-black/50 border border-red-800/60 rounded-lg p-3 text-orange-100 cursor-pointer"
                  />
                </div>
                {previewImage && (
                  <div className="mb-4">
                    <p className="text-orange-200 mb-2">Preview:</p>
                    <img
                      src={previewImage}
                      alt="preview"
                      className="w-full h-40 object-cover rounded-lg border border-red-800/50"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
                >
                  Add Slider
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 rounded-xl border border-red-800/50 shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-orange-200">
                  Edit Slider
                </h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-orange-200 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label className="block text-orange-200 mb-2">
                    Upload New Image (Optional)
                  </label>
                  <input
                    type="file"
                    {...register("image")}
                    accept="image/*"
                    className="w-full bg-black/50 border border-red-800/60 rounded-lg p-3 text-orange-100 cursor-pointer"
                  />
                </div>
                {previewImage && (
                  <div className="mb-4">
                    <p className="text-orange-200 mb-2">Current Preview:</p>
                    <img
                      src={previewImage}
                      alt="preview"
                      className="w-full h-40 object-cover rounded-lg border border-red-800/50"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-red-900/50 border border-red-600/40 cursor-pointer"
                >
                  Update Slider
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 rounded-xl border border-red-800/50 shadow-2xl"
            >
              <p className="text-orange-200 mb-4">
                Are you sure you want to delete?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md cursor-pointer"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Slider2Controller;
