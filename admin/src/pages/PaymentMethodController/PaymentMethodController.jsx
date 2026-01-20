import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload, FaTimes, FaEdit, FaTrash } from "react-icons/fa";

const fetchPaymentMethods = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/payment-methods/admin`,
  );
  return data;
};

const PaymentMethodController = () => {
  const queryClient = useQueryClient();
  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["payment-methods-admin"],
    queryFn: fetchPaymentMethods,
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { register, handleSubmit, reset, watch } = useForm();

  const imageFile = watch("image");

  React.useEffect(() => {
    if (imageFile?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(imageFile[0]);
    } else {
      setPreviewImage(null);
    }
  }, [imageFile]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      if (data.image?.[0]) formData.append("image", data.image[0]);
      if (data.name) formData.append("name", data.name);

      if (editingMethod) {
        return axios.put(
          `${import.meta.env.VITE_API_URL}/api/payment-methods/${editingMethod._id}`,
          formData,
        );
      }
      return axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment-methods`,
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payment-methods-admin"]);
      reset();
      setPreviewImage(null);
      setAddModalOpen(false);
      setEditModalOpen(false);
      setEditingMethod(null);
      toast.success(
        editingMethod ? "Payment method updated" : "Payment method added",
      );
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Something went wrong"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`${import.meta.env.VITE_API_URL}/api/payment-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["payment-methods-admin"]);
      toast.success("Payment method deleted");
      setShowConfirm(false);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleAdd = () => {
    reset();
    setPreviewImage(null);
    setEditingMethod(null);
    setAddModalOpen(true);
  };

  const handleEdit = (item) => {
    reset({ name: item.name || "" });
    setEditingMethod(item);
    setPreviewImage(`${import.meta.env.VITE_API_URL}${item.imageUrl}`);
    setEditModalOpen(true);
  };

  const handleConfirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-gray-300 text-center">
        Loading payment methods...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-orange-200">
        Payment Method Controller
      </h1>

      <button
        onClick={handleAdd}
        className="mb-8 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-red-900/40 transition-all cursor-pointer"
      >
        <FaUpload /> Add New Payment Method
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {methods.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mb-6">
              <FaUpload className="text-4xl text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-orange-200 mb-2">
              No payment methods yet
            </h3>
            <p className="text-orange-300/80 max-w-md">
              Click the "Add New Payment Method" button above to start adding
              bKash, Nagad, Rocket, etc.
            </p>
          </div>
        ) : (
          methods.map((method) => (
            <div
              key={method._id}
              className="bg-black/40 backdrop-blur-md border border-red-800/50 rounded-xl overflow-hidden shadow-xl hover:scale-[1.03] transition-transform duration-300"
            >
              <div className="h-40 bg-black/60 flex items-center justify-center p-4">
                <img
                  src={`${import.meta.env.VITE_API_URL}${method.imageUrl}`}
                  alt={method.name || "payment method"}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-4">
                <p className="text-base font-medium text-orange-200 mb-1">
                  {method.name || "Unnamed Method"}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Added: {new Date(method.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(method)}
                    className="flex-1 bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(method._id)}
                    className="flex-1 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 rounded-xl border border-red-800/50 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-orange-200">
                  Add New Payment Method
                </h2>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="text-orange-300 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-5">
                  <label className="block text-orange-200 mb-2 font-medium">
                    Method Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. bKash, Nagad, Rocket..."
                    {...register("name", { required: true })}
                    className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-orange-200 mb-2 font-medium">
                    Logo Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register("image", { required: true })}
                    className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white file:mr-4 file:py-2 file:px-5 file:rounded file:border-0 file:bg-red-700 file:text-white hover:file:bg-red-600 cursor-pointer"
                  />
                </div>

                {previewImage && (
                  <div className="mb-6">
                    <p className="text-orange-200 mb-2 font-medium">Preview:</p>
                    <img
                      src={previewImage}
                      alt="preview"
                      className="w-full h-32 object-contain rounded-lg border border-green-600/40 bg-black/50"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-medium rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Add Payment Method
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 rounded-xl border border-red-800/50 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-orange-200">
                  Edit Payment Method
                </h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-orange-300 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-5">
                  <label className="block text-orange-200 mb-2 font-medium">
                    Method Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. bKash, Nagad..."
                    defaultValue={editingMethod?.name || ""}
                    {...register("name", { required: true })}
                    className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-orange-200 mb-2 font-medium">
                    Change Logo (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register("image")}
                    className="w-full p-3 bg-black/60 border border-red-800/70 rounded-lg text-white file:mr-4 file:py-2 file:px-5 file:rounded file:border-0 file:bg-red-700 file:text-white hover:file:bg-red-600 cursor-pointer"
                  />
                </div>

                {previewImage && (
                  <div className="mb-6">
                    <p className="text-orange-200 mb-2 font-medium">
                      Current / New Preview:
                    </p>
                    <img
                      src={previewImage}
                      alt="preview"
                      className="w-full h-32 object-contain rounded-lg border border-green-600/40 bg-black/50"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-medium rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Update Payment Method
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-6 rounded-xl border border-red-800/50 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-orange-200 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this payment method? This action
                cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteId)}
                  className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentMethodController;
