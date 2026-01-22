// src/components/admin/AddWithdraw.jsx
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

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
      setImagePreview(URL.createObjectURL(imageFile[0]));
      return () => URL.revokeObjectURL(imagePreview);
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

  // Fetch all methods
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
      toast.success(isEdit ? "Updated!" : "Added!");
      resetForm();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Error"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => axios.delete(`${API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["withdraw-methods"]);
      toast.success("Deleted");
      setDeleteConfirm(false);
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

  const handleDelete = () => {
    if (itemToDelete?._id) deleteMut.mutate(itemToDelete._id);
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Form */}
      <div className=" shadow-lg rounded-xl p-6 mb-10">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? "Edit Withdrawal Method" : "Add New Withdrawal Method"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Method Name */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">
                Method Name (English)
              </label>
              <input
                {...register("methodNameEn", { required: true })}
                className="w-full border rounded px-4 py-2"
                placeholder="Bank Transfer, bKash, etc."
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                পদ্ধতির নাম (বাংলা)
              </label>
              <input
                {...register("methodNameBn", { required: true })}
                className="w-full border rounded px-4 py-2"
                placeholder="ব্যাংক ট্রান্সফার, বিকাশ ইত্যাদি"
              />
            </div>
          </div>

          {/* Dynamic Custom Fields */}
          <div className="border rounded-lg p-5 ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Custom Input Fields (User will fill these)
              </h2>
              <button
                type="button"
                onClick={() =>
                  append({
                    label: { en: "", bn: "" },
                    type: "text",
                    required: false,
                  })
                }
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
              >
                + Add Field
              </button>
            </div>

            {fields.length === 0 && (
              <p className="text-gray-500 italic text-center py-4">
                No custom fields yet
              </p>
            )}

            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid md:grid-cols-2 gap-4 mb-5 p-4  border rounded relative"
              >
                <div>
                  <label className="block mb-1 text-sm">Label (English)</label>
                  <input
                    {...register(`customFields.${idx}.label.en`, {
                      required: true,
                    })}
                    placeholder="Account Number"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">লেবেল (বাংলা)</label>
                  <input
                    {...register(`customFields.${idx}.label.bn`, {
                      required: true,
                    })}
                    placeholder="অ্যাকাউন্ট নম্বর"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">Field Type</label>
                  <select
                    {...register(`customFields.${idx}.type`)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`customFields.${idx}.required`)}
                    className="h-4 w-4"
                  />
                  <label>Required field?</label>
                </div>

                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-200 w-7 h-7 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Image */}
          <div>
            <label className="block mb-1 font-medium">
              Method Image / Icon
            </label>
            <input
              type="file"
              accept="image/*"
              {...register("image")}
              className="w-full border rounded px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="mt-4 max-h-32 object-contain border rounded"
              />
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded disabled:opacity-60"
            >
              {mutation.isPending
                ? "Saving..."
                : isEdit
                  ? "Update Method"
                  : "Add Method"}
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Cards List */}
      <h2 className="text-xl font-bold mb-6">Existing Withdrawal Methods</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((m) => (
          <div
            key={m._id}
            className="border rounded-xl shadow hover:shadow-md overflow-hidden"
          >
            {m.image && (
              <div className="h-40 bg-gray-50 flex items-center justify-center">
                <img
                  src={`${import.meta.env.VITE_API_URL}${m.image}`}
                  alt={m.methodName?.en}
                  className="max-h-full object-contain"
                />
              </div>
            )}

            <div className="p-5">
              <h3 className="font-bold text-lg mb-2">
                {m.methodName?.en} / {m.methodName?.bn}
              </h3>

              {m.customFields?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Required Fields:</p>
                  <ul className="text-sm space-y-1">
                    {m.customFields.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="font-medium">{f.label?.en}</span>
                        <span className="text-gray-500">({f.type})</span>
                        {f.required && (
                          <span className="text-red-600 text-xs">Required</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => setEditItem(m)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setItemToDelete(m);
                    setDeleteConfirm(true);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className=" rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Delete <strong>{itemToDelete?.methodName?.en}</strong>{" "}
              permanently?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-60"
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWithdraw;
