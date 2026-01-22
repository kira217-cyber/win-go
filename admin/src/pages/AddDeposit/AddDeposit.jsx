// src/components/admin/AddDeposit.jsx
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/add-deposit`; // ← সঠিক endpoint (আগের route অনুযায়ী)

const AddDeposit = () => {
  const queryClient = useQueryClient();

  // ── Form States ───────────────────────────────────────
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

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setValue("methodNameEn", editItem.methodName?.en || "");
      setValue("methodNameBn", editItem.methodName?.bn || "");
      setValue("accountNumber", editItem.accountNumber || "");

      if (editItem.methodTypes && Array.isArray(editItem.methodTypes)) {
        setValue("methodTypes", editItem.methodTypes);
      }

      setValue("bonusTitleEn", editItem.bonusTitle?.en || "");
      setValue("bonusTitleBn", editItem.bonusTitle?.bn || "");
      setValue("bonusPercentage", editItem.bonusPercentage || 0);
      setValue("turnoverMultiplier", editItem.turnoverMultiplier || 1);

      if (editItem.image) setImagePreview(editItem.image);
    }
  }, [editItem, setValue]);

  // ── Fetch all deposit methods ────────────────────────────────
  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: () => axios.get(API_BASE).then((res) => res.data.data || res.data),
  });

  // ── Create / Update Mutation ────────────────────────────────
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

  // ── Delete Mutation ──────────────────────────────────────────
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

    if (data.image?.[0]) {
      formData.append("image", data.image[0]);
    }

    mutation.mutate(formData);
  };

  const resetForm = () => {
    reset();
    setImagePreview(null);
    setEditItem(null);
  };

  const startEdit = (method) => {
    setEditItem(method);
  };

  const handleDeleteClick = (method) => {
    setItemToDelete(method);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete?._id) {
      deleteMutation.mutate(itemToDelete._id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading deposit methods...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          {isEditMode ? "Edit Deposit Method" : "Manage Deposit Methods"}
        </h1>
        {isEditMode && (
          <button
            onClick={resetForm}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Form – always visible */}
      <div className=" rounded-xl shadow-lg p-6 mb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Method Name */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1 font-medium">
                Method Name (English)
              </label>
              <input
                {...register("methodNameEn", { required: "Required" })}
                className="w-full border rounded px-4 py-2"
                placeholder="bKash, Nagad, etc."
              />
              {errors.methodNameEn && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.methodNameEn.message}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">
                পদ্ধতির নাম (বাংলা)
              </label>
              <input
                {...register("methodNameBn", { required: "Required" })}
                className="w-full border rounded px-4 py-2"
                placeholder="বিকাশ, নগদ ইত্যাদি"
              />
              {errors.methodNameBn && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.methodNameBn.message}
                </p>
              )}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block mb-1 font-medium">
              Account Number / Wallet ID
            </label>
            <input
              {...register("accountNumber")}
              className="w-full border rounded px-4 py-2"
              placeholder="01XXXXXXXXX or 123456789012345"
            />
          </div>

          {/* Multiple Method Types */}
          <div className="border border-gray-200 rounded-lg p-5 ">
            <div className="flex justify-between items-center mb-4">
              <label className="text-lg font-semibold">Method Types</label>
              <button
                type="button"
                onClick={() => append({ en: "", bn: "" })}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
              >
                + Add Type
              </button>
            </div>

            {fields.length === 0 && (
              <p className="text-gray-500 italic text-center py-4">
                No types added yet
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid md:grid-cols-2 gap-4 mb-4 p-4  border rounded relative"
              >
                <div>
                  <input
                    {...register(`methodTypes.${index}.en`, {
                      required: "Required",
                    })}
                    placeholder="Personal / Agent"
                    className="w-full border rounded px-3 py-2"
                  />
                  {errors.methodTypes?.[index]?.en && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.methodTypes[index].en.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register(`methodTypes.${index}.bn`, {
                      required: "Required",
                    })}
                    placeholder="ব্যক্তিগত / এজেন্ট"
                    className="w-full border rounded px-3 py-2"
                  />
                  {errors.methodTypes?.[index]?.bn && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.methodTypes[index].bn.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-200 w-7 h-7 rounded-full flex items-center justify-center text-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Bonus & Turnover */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">
                Bonus Title (optional)
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  {...register("bonusTitleEn")}
                  placeholder="Welcome Bonus"
                  className="border rounded px-4 py-2"
                />
                <input
                  {...register("bonusTitleBn")}
                  placeholder="স্বাগতম বোনাস"
                  className="border rounded px-4 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Bonus %</label>
              <input
                type="number"
                {...register("bonusPercentage", { min: 0 })}
                className="w-full border rounded px-4 py-2"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Turnover × (required multiplier)
            </label>
            <input
              type="number"
              {...register("turnoverMultiplier", { min: 0 })}
              className="w-full border rounded px-4 py-2"
              min="0"
              step="0.1"
              placeholder="5 = 5x turnover"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block mb-1 font-medium">
              Method Image / Logo
            </label>
            <input
              type="file"
              accept="image/*"
              {...register("image")}
              className="w-full border rounded px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {(imagePreview || (isEditMode && editItem?.image)) && (
              <div className="mt-4">
                <img
                  src={
                    imagePreview ||
                    `${import.meta.env.VITE_API_URL}${editItem?.image}`
                  }
                  alt="Preview"
                  className="max-h-40 object-contain border rounded bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-60"
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
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── List of Deposit Methods (Cards) ──────────────────────────────── */}
      <h2 className="text-xl font-bold mb-6">Existing Deposit Methods</h2>

      {methods.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No deposit methods added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <div
              key={method._id}
              className="border rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden"
            >
              {method.image && (
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${method.image}`}
                    alt={method.methodName?.en}
                    className="max-h-full object-contain"
                  />
                </div>
              )}

              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">
                  {method.methodName?.en} / {method.methodName?.bn}
                </h3>

                {method.accountNumber && (
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Account:</strong> {method.accountNumber}
                  </p>
                )}

                {method.methodTypes?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {method.methodTypes.map((t, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                        >
                          {t.en} / {t.bn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                  <div>
                    <span className="text-gray-600">Bonus:</span>
                    <div className="font-medium">{method.bonusPercentage}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Turnover:</span>
                    <div className="font-medium">
                      {method.turnoverMultiplier}x
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      method.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {method.isActive ? "Active" : "Inactive"}
                  </span>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(method)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(method)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <strong>{itemToDelete?.methodName?.en}</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDeposit;
