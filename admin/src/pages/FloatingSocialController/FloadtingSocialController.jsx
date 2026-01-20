import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload, FaTimes, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const fetchLinks = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/floating-social/admin`,
  );
  return data;
};

const FloatingSocialController = () => {
  const queryClient = useQueryClient();
  const { data: links = [], isLoading } = useQuery({
    queryKey: ["floating-social-admin"],
    queryFn: fetchLinks,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
      formData.append("name", data.name.trim());
      formData.append("linkUrl", data.linkUrl.trim());
      formData.append("order", data.order || 0);

      if (editingLink) {
        return axios.put(
          `${import.meta.env.VITE_API_URL}/api/floating-social/${editingLink._id}`,
          formData,
        );
      }
      return axios.post(
        `${import.meta.env.VITE_API_URL}/api/floating-social`,
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["floating-social-admin"]);
      toast.success(editingLink ? "Updated!" : "Added!");
      setModalOpen(false);
      setEditingLink(null);
      setPreviewImage(null);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`${import.meta.env.VITE_API_URL}/api/floating-social/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["floating-social-admin"]);
      toast.success("Deleted successfully");
    },
    onError: () => toast.error("Delete failed"),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleAdd = () => {
    reset({ name: "", linkUrl: "", order: 0 });
    setEditingLink(null);
    setPreviewImage(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    reset({
      name: item.name,
      linkUrl: item.linkUrl,
      order: item.order,
    });
    setEditingLink(item);
    setPreviewImage(`${import.meta.env.VITE_API_URL}${item.imageUrl}`);
    setModalOpen(true);
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-200">
            Floating Social Controller
          </h1>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <FaPlus /> Add New Link
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <div
              key={link._id}
              className="bg-black/40 border border-red-800/50 rounded-xl p-5 shadow-xl hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={`${import.meta.env.VITE_API_URL}${link.imageUrl}`}
                  alt={link.name}
                  className="w-16 h-16 object-contain rounded bg-black/60 p-2 border border-green-600/30"
                />
                <div>
                  <h3 className="text-lg font-bold text-orange-200">
                    {link.name}
                  </h3>
                  <a
                    href={link.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 truncate block cursor-pointer"
                  >
                    {link.linkUrl}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(link)}
                  className="flex-1 bg-yellow-700 hover:bg-yellow-600 text-white py-2 rounded cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this social link?")) {
                      deleteMutation.mutate(link._id);
                    }
                  }}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2 rounded cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-gradient-to-br from-orange-950 via-red-950 to-black p-8 rounded-2xl border border-red-800/50 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between mb-6">
                  <h2 className="text-2xl font-bold text-orange-200">
                    {editingLink ? "Edit" : "Add"} Floating Social Link
                  </h2>
                  <button onClick={() => setModalOpen(false)}>
                    <FaTimes className="text-orange-300 hover:text-white text-2xl cursor-pointer" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-orange-200 mb-2">Name</label>
                    <input
                      {...register("name", { required: true })}
                      placeholder="WhatsApp / Telegram"
                      className="w-full p-3 bg-black/60 border border-red-800 rounded text-white cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-orange-200 mb-2">
                      Link URL
                    </label>
                    <input
                      {...register("linkUrl", { required: true })}
                      placeholder="https://wa.me/88017xxxxxxxx"
                      className="w-full p-3 bg-black/60 border border-red-800 rounded text-white cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-orange-200 mb-2">
                      Icon Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      {...register("image", { required: !editingLink })}
                      className="w-full p-3 bg-black/60 border border-red-800 rounded text-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:bg-red-700 file:text-white hover:file:bg-red-600"
                    />
                  </div>

                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="preview"
                      className="w-20 h-20 object-contain mx-auto border border-green-600 rounded"
                    />
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl cursor-pointer"
                  >
                    {editingLink ? "Update Link" : "Add Link"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FloatingSocialController;
