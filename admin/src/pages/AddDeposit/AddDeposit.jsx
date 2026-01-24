// src/components/admin/AddDeposit.jsx
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUpload } from "react-icons/fa";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/add-deposit`;

const AddDeposit = () => {
  const queryClient = useQueryClient();

  const [imagePreview, setImagePreview] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const isEditMode = !!editItem;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      methodNameEn: "",
      methodNameBn: "",
      accountNumber: "",
      methodTypes: [],
      bonusTitleEn: "",
      bonusTitleBn: "",
      bonusPercentage: 0,
      turnoverMultiplier: 1,
      image: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "methodTypes",
  });

  const imageFile = watch("image");

  // Image preview
  useEffect(() => {
    if (imageFile?.[0]) {
      const objectUrl = URL.createObjectURL(imageFile[0]);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreview(null);
  }, [imageFile]);

  // Populate form on edit
  useEffect(() => {
    if (editItem) {
      setValue("methodNameEn", editItem.methodName?.en || "");
      setValue("methodNameBn", editItem.methodName?.bn || "");
      setValue("accountNumber", editItem.accountNumber || "");
      setValue("methodTypes", editItem.methodTypes || []);
      setValue("bonusTitleEn", editItem.bonusTitle?.en || "");
      setValue("bonusTitleBn", editItem.bonusTitle?.bn || "");
      setValue("bonusPercentage", editItem.bonusPercentage || 0);
      setValue("turnoverMultiplier", editItem.turnoverMultiplier || 1);
      if (editItem.image) setImagePreview(editItem.image);
    }
  }, [editItem, setValue]);

  // Fetch methods
  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: () => axios.get(API_BASE).then((res) => res.data.data || res.data),
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isEditMode) {
        return axios.put(`${API_BASE}/${editItem._id}`, formData, config);
      }
      return axios.post(API_BASE, formData, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deposit-methods"]);
      toast.success(
        isEditMode ? "Updated successfully!" : "Added successfully!",
      );
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Operation failed");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${API_BASE}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["deposit-methods"]);
      toast.success("Deleted successfully");
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    },
    onError: () => toast.error("Delete failed"),
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append(
      "methodName",
      JSON.stringify({ en: data.methodNameEn, bn: data.methodNameBn }),
    );
    formData.append("accountNumber", data.accountNumber);
    formData.append("methodTypes", JSON.stringify(data.methodTypes));
    formData.append(
      "bonusTitle",
      JSON.stringify({ en: data.bonusTitleEn, bn: data.bonusTitleBn }),
    );
    formData.append("bonusPercentage", data.bonusPercentage);
    formData.append("turnoverMultiplier", data.turnoverMultiplier);
    if (data.image?.[0]) formData.append("image", data.image[0]);

    mutation.mutate(formData);
  };

  const resetForm = () => {
    reset();
    setImagePreview(null);
    setEditItem(null);
  };

  const startEdit = (method) => setEditItem(method);
  const handleDeleteClick = (method) => {
    setItemToDelete(method);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = () =>
    itemToDelete?._id && deleteMutation.mutate(itemToDelete._id);

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
            {isEditMode ? "Edit Deposit Method" : "Manage Deposit Methods"}
          </h1>

          {isEditMode && (
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
                  placeholder="bKash, Nagad, Rocket..."
                />
                {errors.methodNameEn && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.methodNameEn.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-orange-300">
                  পদ্ধতির নাম (বাংলা)
                </label>
                <input
                  {...register("methodNameBn", { required: "Required" })}
                  className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  placeholder="বিকাশ, নগদ, রকেট..."
                />
                {errors.methodNameBn && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.methodNameBn.message}
                  </p>
                )}
              </div>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-orange-300">
                Account Number / Wallet ID
              </label>
              <input
                {...register("accountNumber")}
                className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                placeholder="01XXXXXXXXX or 123456789012345"
              />
            </div>

            {/* Method Types */}
            <div className="border border-red-800/40 rounded-xl p-6 bg-black/30">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-orange-200">
                  Method Types
                </h3>
                <button
                  type="button"
                  onClick={() => append({ en: "", bn: "" })}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-medium transition-all cursor-pointer shadow-md shadow-green-900/30"
                >
                  <FaPlus size={14} /> Add Type
                </button>
              </div>

              {fields.length === 0 && (
                <p className="text-center text-gray-500 py-8 italic">
                  No types added yet. Click "+ Add Type" to begin.
                </p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col sm:flex-row gap-4 items-start relative p-4 bg-black/20 rounded-xl border border-red-900/30"
                  >
                    <input
                      {...register(`methodTypes.${index}.en`, {
                        required: "Required",
                      })}
                      placeholder="Personal / Agent"
                      className="flex-1 px-4 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 transition-all"
                    />
                    <input
                      {...register(`methodTypes.${index}.bn`, {
                        required: "Required",
                      })}
                      placeholder="ব্যক্তিগত / এজেন্ট"
                      className="flex-1 px-4 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute -top-3 -right-3 bg-red-900/80 hover:bg-red-800 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-110"
                    >
                      <FaTimes size={14} />
                    </button>
                    {errors.methodTypes?.[index]?.en && (
                      <p className="text-red-400 text-xs absolute -bottom-5 left-4">
                        {errors.methodTypes[index].en.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus & Turnover */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-orange-300">
                  Bonus Title (optional)
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    {...register("bonusTitleEn")}
                    placeholder="Welcome Bonus"
                    className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 transition-all"
                  />
                  <input
                    {...register("bonusTitleBn")}
                    placeholder="স্বাগতম বোনাস"
                    className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-orange-300">
                  Bonus %
                </label>
                <input
                  type="number"
                  {...register("bonusPercentage", { min: 0 })}
                  className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 focus:outline-none focus:border-orange-500 transition-all"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-orange-300">
                Turnover × (required multiplier)
              </label>
              <input
                type="number"
                {...register("turnoverMultiplier", { min: 0 })}
                className="w-full px-5 py-3 bg-black/40 border border-red-800/50 rounded-xl text-orange-100 focus:outline-none focus:border-orange-500 transition-all"
                min="0"
                step="0.1"
                placeholder="5 = 5x turnover"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-orange-300">
                Method Image / Logo
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

              {(imagePreview || (isEditMode && editItem?.image)) && (
                <div className="mt-4 p-3 bg-black/40 rounded-xl border border-red-800/40 inline-block">
                  <img
                    src={
                      imagePreview ||
                      `${import.meta.env.VITE_API_URL}${editItem?.image}`
                    }
                    alt="Preview"
                    className="max-h-48 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="flex-1 py-3.5 px-8 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-red-900/40 disabled:opacity-60 cursor-pointer"
              >
                {mutation.isPending
                  ? "Saving..."
                  : isEditMode
                    ? "Update Deposit Method"
                    : "Add Deposit Method"}
              </button>

              {isEditMode && (
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
          Existing Deposit Methods
        </h2>

        {methods.length === 0 ? (
          <div className="text-center py-16 text-gray-400 italic bg-black/30 rounded-2xl border border-red-800/30">
            No deposit methods added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((method) => (
              <div
                key={method._id}
                className="group bg-gradient-to-b from-orange-950/60 to-red-950/50 border border-red-800/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-900/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {method.image && (
                  <div className="h-48 bg-black/40 flex items-center justify-center p-4">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${method.image}`}
                      alt={method.methodName?.en}
                      className="max-h-full object-contain"
                    />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 text-orange-100">
                    {method.methodName?.en}{" "}
                    <span className="text-gray-400">/</span>{" "}
                    {method.methodName?.bn}
                  </h3>

                  {method.accountNumber && (
                    <p className="text-sm text-orange-200/80 mb-4">
                      <strong className="text-orange-300">Account:</strong>{" "}
                      {method.accountNumber}
                    </p>
                  )}

                  {method.methodTypes?.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs text-orange-300/70 mb-2">Types:</p>
                      <div className="flex flex-wrap gap-2">
                        {method.methodTypes.map((t, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-red-900/40 text-orange-200 text-xs rounded-full border border-red-800/50"
                          >
                            {t.en} / {t.bn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <span className="text-gray-400">Bonus</span>
                      <div className="text-xl font-bold text-orange-400">
                        {method.bonusPercentage}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Turnover</span>
                      <div className="text-xl font-bold text-orange-400">
                        {method.turnoverMultiplier}x
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                        method.isActive
                          ? "bg-green-900/40 text-green-300 border border-green-800/50"
                          : "bg-red-900/40 text-red-300 border border-red-800/50"
                      }`}
                    >
                      {method.isActive ? "Active" : "Inactive"}
                    </span>

                    <div className="flex gap-4">
                      <button
                        onClick={() => startEdit(method)}
                        className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(method)}
                        className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteConfirm && (
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
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="px-8 py-3 bg-gray-800/70 hover:bg-gray-700 rounded-xl text-orange-200 hover:text-orange-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 rounded-xl text-white font-medium transition-all shadow-lg shadow-red-900/50 disabled:opacity-60 cursor-pointer"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDeposit;
