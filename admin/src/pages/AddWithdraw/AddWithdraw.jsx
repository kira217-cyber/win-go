// src/components/admin/AddWithdraw.jsx
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUpload } from "react-icons/fa";

const API = `${import.meta.env.VITE_API_URL}/api/add-withdraw`;

const AddWithdraw = () => {
  const queryClient = useQueryClient();

  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const isEdit = !!editItem;

  const { register, handleSubmit, reset, setValue, watch, control } = useForm({
    defaultValues: {
      methodNameEn: "",
      methodNameBn: "",
      image: null,
      customFields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customFields",
  });

  const imageFile = watch("image");

  useEffect(() => {
    if (imageFile?.[0]) {
      const objectUrl = URL.createObjectURL(imageFile[0]);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreview(null);
  }, [imageFile]);

  useEffect(() => {
    if (editItem) {
      setValue("methodNameEn", editItem.methodName?.en || "");
      setValue("methodNameBn", editItem.methodName?.bn || "");
      setValue("customFields", editItem.customFields || []);
      if (editItem.image) setImagePreview(editItem.image);
    }
  }, [editItem, setValue]);

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["withdraw-methods"],
    queryFn: () => axios.get(API).then((r) => r.data.data || r.data),
  });

  const mutation = useMutation({
    mutationFn: (formData) => {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      return isEdit
        ? axios.put(`${API}/${editItem._id}`, formData, config)
        : axios.post(API, formData, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["withdraw-methods"]);
      toast.success(isEdit ? "Updated successfully!" : "Added successfully!");
      resetForm();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Operation failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => axios.delete(`${API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["withdraw-methods"]);
      toast.success("Deleted successfully");
      setDeleteConfirm(false);
      setItemToDelete(null);
    },
    onError: () => toast.error("Delete failed"),
  });

  const onSubmit = (data) => {
    const fd = new FormData();
    fd.append(
      "methodName",
      JSON.stringify({ en: data.methodNameEn, bn: data.methodNameBn }),
    );
    fd.append("customFields", JSON.stringify(data.customFields));
    if (data.image?.[0]) fd.append("image", data.image[0]);

    mutation.mutate(fd);
  };

  const resetForm = () => {
    reset();
    setImagePreview(null);
    setEditItem(null);
  };

  const startEdit = (method) => setEditItem(method);

  const handleDeleteClick = (method) => {
    setItemToDelete(method);
    setDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete?._id) deleteMut.mutate(itemToDelete._id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-orange-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            {isEdit ? "Edit Withdrawal Method" : "Manage Withdrawal Methods"}
          </h1>

          {isEdit && (
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-700/60 hover:bg-gray-600/80 border border-gray-600 rounded-xl text-orange-200 hover:text-orange-100 transition-all cursor-pointer backdrop-blur-sm"
            >
              <FaTimes /> Cancel Edit
            </button>
          )}
        </div>

        {/* ── FORM ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-b from-orange-950/70 via-red-950/60 to-black/80 border border-red-800/40 rounded-2xl shadow-2xl shadow-red-950/40 p-6 md:p-8 mb-12 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {/* Method Names */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-orange-300">
                  Method Name (English)
                </label>
                <input
                  {...register("methodNameEn", { required: "Required" })}
                  className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  placeholder="Bank Transfer, Nagad, Rocket..."
                />
                {register("methodNameEn").required &&
                  !watch("methodNameEn") && (
                    <p className="text-red-400 text-sm mt-1">Required</p>
                  )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-orange-300">
                  পদ্ধতির নাম (বাংলা)
                </label>
                <input
                  {...register("methodNameBn", { required: "Required" })}
                  className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  placeholder="ব্যাংক ট্রান্সফার, নগদ, রকেট..."
                />
                {register("methodNameBn").required &&
                  !watch("methodNameBn") && (
                    <p className="text-red-400 text-sm mt-1">Required</p>
                  )}
              </div>
            </div>

            {/* Custom Fields */}
            <div className="border border-red-800/40 rounded-xl p-6 bg-black/30">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-orange-200">
                  Custom Input Fields (User will fill these during withdrawal)
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      label: { en: "", bn: "" },
                      type: "text",
                      required: false,
                    })
                  }
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-medium transition-all cursor-pointer shadow-md shadow-green-900/30"
                >
                  <FaPlus size={14} /> Add Field
                </button>
              </div>

              {fields.length === 0 && (
                <p className="text-center text-gray-500 py-8 italic">
                  No custom fields added yet. Click "+ Add Field" to begin.
                </p>
              )}

              <div className="space-y-5">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="relative p-5 bg-black/20 rounded-xl border border-red-900/30 space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm text-orange-300">
                          Label (English)
                        </label>
                        <input
                          {...register(`customFields.${idx}.label.en`, {
                            required: "Required",
                          })}
                          placeholder="Account Number"
                          className="w-full px-4 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm text-orange-300">
                          লেবেল (বাংলা)
                        </label>
                        <input
                          {...register(`customFields.${idx}.label.bn`, {
                            required: "Required",
                          })}
                          placeholder="অ্যাকাউন্ট নম্বর"
                          className="w-full px-4 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm text-orange-300">
                          Field Type
                        </label>
                        <select
                          {...register(`customFields.${idx}.type`)}
                          className="w-full px-4 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 focus:outline-none focus:border-orange-500 transition-all"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-8">
                        <input
                          type="checkbox"
                          {...register(`customFields.${idx}.required`)}
                          className="h-5 w-5 accent-orange-500 cursor-pointer"
                        />
                        <label className="text-orange-200 cursor-pointer">
                          Required field?
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="absolute -top-3 -right-3 bg-red-900/80 hover:bg-red-800 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-110"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-orange-300">
                Method Image / Icon
              </label>
              <div className="flex items-center gap-4 p-4 bg-black/30 border-2 border-dashed border-red-800/50 rounded-xl hover:border-orange-500/60 transition-all cursor-pointer group">
                <FaUpload className="text-3xl text-orange-400 group-hover:text-orange-300 transition-colors" />
                <input
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  className="w-full text-orange-100 file:mr-4 file:py-2 file:px-5 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-orange-700 file:to-red-700 file:text-white file:font-medium file:cursor-pointer file:hover:from-orange-600 file:hover:to-red-600"
                />
              </div>

              {imagePreview && (
                <div className="mt-4 p-3 bg-black/40 rounded-xl border border-red-800/40 inline-block">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="max-h-48 object-contain rounded-lg"
                  />
                </div>
              )}
              {isEdit && editItem?.image && !imagePreview && (
                <div className="mt-4 p-3 bg-black/40 rounded-xl border border-red-800/40 inline-block">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${editItem.image}`}
                    alt="current"
                    className="max-h-48 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 py-3.5 px-8 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-red-900/40 disabled:opacity-60 cursor-pointer"
              >
                {mutation.isPending
                  ? "Saving..."
                  : isEdit
                    ? "Update Withdrawal Method"
                    : "Add Withdrawal Method"}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3.5 px-8 bg-gray-700/70 hover:bg-gray-600/80 border border-gray-600 rounded-xl text-orange-200 hover:text-orange-100 transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── EXISTING METHODS ────────────────────────────────────── */}
        <h2 className="text-2xl font-bold mb-6 text-orange-200 tracking-tight">
          Existing Withdrawal Methods
        </h2>

        {methods.length === 0 ? (
          <div className="text-center py-16 text-gray-400 italic bg-black/30 rounded-2xl border border-red-800/30">
            No withdrawal methods added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((m) => (
              <div
                key={m._id}
                className="group bg-gradient-to-b from-orange-950/60 to-red-950/50 border border-red-800/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-900/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {m.image && (
                  <div className="h-48 bg-black/40 flex items-center justify-center p-4">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${m.image}`}
                      alt={m.methodName?.en}
                      className="max-h-full object-contain"
                    />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-bold text-xl mb-4 text-orange-100">
                    {m.methodName?.en} <span className="text-gray-400">/</span>{" "}
                    {m.methodName?.bn}
                  </h3>

                  {m.customFields?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-orange-300/80 mb-3">
                        Custom Fields:
                      </p>
                      <div className="space-y-2">
                        {m.customFields.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm bg-black/30 p-3 rounded-lg border border-red-900/30"
                          >
                            <div>
                              <span className="font-medium text-orange-200">
                                {f.label?.en}
                              </span>
                              <span className="text-orange-200/60 ml-2">
                                ({f.type})
                              </span>
                            </div>
                            {f.required && (
                              <span className="px-2.5 py-1 bg-red-900/50 text-red-300 text-xs rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-5">
                    <button
                      onClick={() => startEdit(m)}
                      className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(m)}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-orange-950 to-red-950 border border-red-800/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-950/60">
              <h3 className="text-2xl font-bold text-orange-100 mb-5">
                Confirm Deletion
              </h3>
              <p className="text-orange-200/90 mb-8">
                Are you sure you want to delete{" "}
                <strong className="text-orange-300">
                  {itemToDelete?.methodName?.en}
                </strong>
                ?<br />
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="px-8 py-3 bg-gray-800/70 hover:bg-gray-700 rounded-xl text-orange-200 hover:text-orange-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteMut.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 rounded-xl text-white font-medium transition-all shadow-lg shadow-red-900/50 disabled:opacity-60 cursor-pointer"
                >
                  {deleteMut.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddWithdraw;
