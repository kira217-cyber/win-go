// src/admin/FaviconAndTitleController.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTimes, FaEdit } from 'react-icons/fa';

const fetchConfigs = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/site-config/admin`);
  return data;
};

const FaviconAndTitleController = () => {
  const queryClient = useQueryClient();
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['site-config-admin'],
    queryFn: fetchConfigs,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [preview, setPreview] = useState(null);

  const { register, handleSubmit, reset, watch } = useForm();

  const image = watch('favicon');

  React.useEffect(() => {
    if (image?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(image[0]);
    } else {
      setPreview(null);
    }
  }, [image]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      if (data.favicon?.[0]) formData.append('favicon', data.favicon[0]);
      if (data.siteTitle) formData.append('siteTitle', data.siteTitle);

      if (editingConfig) {
        return axios.put(
          `${import.meta.env.VITE_API_URL}/api/site-config/${editingConfig._id}`,
          formData
        );
      }
      return axios.post(`${import.meta.env.VITE_API_URL}/api/site-config`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['site-config-admin']);
      queryClient.invalidateQueries(['site-config']);
      reset();
      setPreview(null);
      setModalOpen(false);
      setEditingConfig(null);
      toast.success(editingConfig ? 'Updated!' : 'Added!');
    },
    onError: () => toast.error('Failed to save'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleEdit = (item) => {
    reset({ siteTitle: item.siteTitle });
    setEditingConfig(item);
    setPreview(`${import.meta.env.VITE_API_URL}${item.faviconUrl}`);
    setModalOpen(true);
  };

  const handleAdd = () => {
    reset({ siteTitle: 'WiN GO' });
    setEditingConfig(null);
    setPreview(null);
    setModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-300">Favicon & Site Title</h1>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r cursor-pointer from-orange-600 to-red-600 px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 hover:brightness-110"
        >
          <FaUpload /> Add New Config
        </button>
      </div>

      <div className="grid gap-6">
        {configs.map((cfg) => (
          <div
            key={cfg._id}
            className={`p-6 rounded-xl border ${
              cfg.isActive ? 'border-green-600 bg-green-950/30' : 'border-gray-700 bg-black/40'
            }`}
          >
            <div className="flex items-center gap-6 mb-4">
              <img
                src={`${import.meta.env.VITE_API_URL}${cfg.faviconUrl}`}
                alt="favicon"
                className="w-16 h-16 object-contain rounded bg-black/60 p-2"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{cfg.siteTitle}</h3>
                <p className="text-sm text-gray-400">
                  {cfg.isActive ? 'Active' : 'Inactive'} • {new Date(cfg.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleEdit(cfg)}
              className="bg-yellow-700 cursor-pointer hover:bg-yellow-600 px-5 py-2 rounded text-white flex items-center gap-2"
            >
              <FaEdit /> Edit
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
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
              className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-700 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-orange-300">
                  {editingConfig ? 'Edit' : 'Add'} Site Title & Favicon
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <FaTimes className="text-gray-400 cursor-pointer hover:text-white text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Website Title</label>
                  <input
                    type="text"
                    {...register('siteTitle', { required: true })}
                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    placeholder="WiN GO - Best Online Casino"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">
                    Favicon (.ico, .png recommended 32×32 or 64×64)
                  </label>
                  <input
                    type="file"
                    accept="image/x-icon,image/png"
                    {...register('favicon', { required: !editingConfig })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-5 file:rounded file:bg-orange-700 file:text-white hover:file:bg-orange-600 cursor-pointer"
                  />
                </div>

                {preview && (
                  <div className="mb-6">
                    <p className="text-gray-300 mb-2">Preview:</p>
                    <img
                      src={preview}
                      alt="favicon preview"
                      className="w-16 h-16 object-contain bg-black/60 rounded p-2 border border-gray-700"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full cursor-pointer py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-white font-bold hover:brightness-110 transition"
                >
                  {editingConfig ? 'Update' : 'Save'} Configuration
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FaviconAndTitleController;