// src/admin/FaviconAndTitleController.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTimes, FaEdit, FaLink, FaTrash } from 'react-icons/fa';

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
      if (data.downloadLink !== undefined) formData.append('downloadLink', data.downloadLink);

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
      toast.success(editingConfig ? 'Updated Successfully!' : 'Created Successfully!');
      reset();
      setPreview(null);
      setModalOpen(false);
      setEditingConfig(null);
    },
    onError: () => toast.error('Failed to save configuration'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleEdit = (item) => {
    reset({
      siteTitle: item.siteTitle,
      downloadLink: item.downloadLink || '',
    });
    setEditingConfig(item);
    setPreview(`${import.meta.env.VITE_API_URL}${item.faviconUrl}`);
    setModalOpen(true);
  };

  const handleAdd = () => {
    reset({ siteTitle: 'WiN GO', downloadLink: '' });
    setEditingConfig(null);
    setPreview(null);
    setModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-orange-300">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-300">Site Config - Favicon & Download Link</h1>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2 hover:brightness-110 transition"
        >
          <FaUpload /> Add New Config
        </button>
      </div>

      <div className="grid gap-6">
        {configs.map((cfg) => (
          <div
            key={cfg._id}
            className={`p-6 rounded-xl border-2 ${
              cfg.isActive ? 'border-green-600 bg-green-950/40' : 'border-gray-700 bg-gray-900/60'
            }`}
          >
            <div className="flex items-center gap-6">
              <img
                src={`${import.meta.env.VITE_API_URL}${cfg.faviconUrl}`}
                alt="favicon"
                className="w-20 h-20 object-contain rounded-lg bg-black/70 p-3 border border-gray-700"
              />

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">{cfg.siteTitle}</h3>
                
                {cfg.downloadLink ? (
                  <div className="flex items-center gap-2 mt-2">
                    <FaLink className="text-green-400" />
                    <a
                      href={cfg.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline break-all"
                    >
                      {cfg.downloadLink}
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500 italic mt-1">No download link added</p>
                )}

                <p className="text-sm text-gray-400 mt-2">
                  {cfg.isActive ? '● Active' : '○ Inactive'} • {new Date(cfg.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleEdit(cfg)}
                className="bg-yellow-700 hover:bg-yellow-600 px-5 py-2 rounded-lg text-white flex items-center gap-2 transition"
              >
                <FaEdit /> Edit
              </button>
            </div>
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
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-700 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-300">
                  {editingConfig ? 'Edit Config' : 'Add New Config'}
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <FaTimes className="text-2xl text-gray-400 hover:text-white cursor-pointer" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Site Title</label>
                  <input
                    type="text"
                    {...register('siteTitle', { required: true })}
                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="WiN GO - Best Online Casino"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Download Link (APK / Game Download)
                  </label>
                  <input
                    type="url"
                    {...register('downloadLink')}
                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="https://example.com/download/app.apk"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty if no download link</p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Favicon (.ico or .png)
                  </label>
                  <input
                    type="file"
                    accept="image/x-icon,image/png"
                    {...register('favicon', { required: !editingConfig })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-5 file:rounded file:bg-orange-700 file:text-white cursor-pointer"
                  />
                </div>

                {preview && (
                  <div>
                    <p className="text-gray-300 mb-2">Favicon Preview:</p>
                    <img src={preview} alt="preview" className="w-20 h-20 object-contain bg-black/70 rounded-lg p-3" />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-white font-bold text-lg hover:brightness-110 transition"
                >
                  {editingConfig ? 'Update Config' : 'Create Config'}
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