// src/pages/admin/AddGame.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaTimes,
  FaSave,
  FaSpinner,
} from "react-icons/fa";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const IMAGE_BASE = import.meta.env.VITE_API_URL; // for /uploads/... paths

const AddGame = () => {
  const queryClient = useQueryClient();

  // Fetch all games
  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: () => axios.get(`${API_BASE}/games`).then((res) => res.data),
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (formData) =>
      axios.post(`${API_BASE}/games`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Game added successfully!", { theme: "dark" });
      addForm.reset();
      setAddPreview(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add game", {
        theme: "dark",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) =>
      axios.put(`${API_BASE}/games/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Game updated successfully!", { theme: "dark" });
      setShowEditModal(false);
      setEditingGame(null);
      setEditPreview(null);
      setNewEditImageFile(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update", {
        theme: "dark",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) =>
      axios.patch(`${API_BASE}/games/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Status updated", { theme: "dark" });
    },
    onError: () => toast.error("Failed to update status", { theme: "dark" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${API_BASE}/games/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Game deleted", { theme: "dark" });
      setShowDeleteModal(false);
    },
    onError: () => toast.error("Failed to delete game", { theme: "dark" }),
  });

  // Forms
  const addForm = useForm({ defaultValues: { status: true } });
  const editForm = useForm();

  // States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [addPreview, setAddPreview] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [newEditImageFile, setNewEditImageFile] = useState(null);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (addPreview) URL.revokeObjectURL(addPreview);
      if (editPreview) URL.revokeObjectURL(editPreview);
    };
  }, [addPreview, editPreview]);

  // ─── Add Game ───
  const onAddSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("gameId", data.gameId);
    formData.append("serialNumber", data.serialNumber);
    formData.append("status", data.status);
    if (data.image?.[0]) formData.append("image", data.image[0]);

    addMutation.mutate(formData);
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (addPreview) URL.revokeObjectURL(addPreview);
    setAddPreview(URL.createObjectURL(file));
    addForm.setValue("image", e.target.files);
  };

  // ─── Edit Game ───
  const handleEdit = (game) => {
    setEditingGame(game);
    editForm.reset({
      title: game.title,
      gameId: game.gameId,
      serialNumber: game.serialNumber,
      status: game.status,
    });
    setShowEditModal(true);
    setEditPreview(null);
    setNewEditImageFile(null);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editPreview) URL.revokeObjectURL(editPreview);
    const previewUrl = URL.createObjectURL(file);
    setEditPreview(previewUrl);
    setNewEditImageFile(file);
  };

  const onEditSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("gameId", data.gameId);
    formData.append("serialNumber", data.serialNumber);
    formData.append("status", data.status);

    // Only send image if user selected a new one
    if (newEditImageFile) {
      formData.append("image", newEditImageFile);
    }

    updateMutation.mutate({ id: editingGame._id, formData });
  };

  // ─── Delete ───
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const getImageUrl = (path) => (path ? `${IMAGE_BASE}${path}` : null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black text-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Game Management
        </h1>
        <div className="text-sm text-orange-300/80">
          Total Games:{" "}
          <span className="font-semibold text-orange-400">{games.length}</span>
        </div>
      </div>

      {/* Add Game Form */}
      <div className="bg-gradient-to-b from-red-950/60 to-black/70 backdrop-blur-md border border-red-800/40 rounded-2xl shadow-2xl shadow-red-950/50 p-6 md:p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-orange-400">
          <FaPlus className="text-orange-500" /> Add New Game
        </h2>

        <form
          onSubmit={addForm.handleSubmit(onAddSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-orange-200/90 mb-2 font-medium">
              Game Title
            </label>
            <input
              {...addForm.register("title", { required: true })}
              className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              placeholder="Enter game title"
            />
          </div>

          <div>
            <label className="block text-orange-200/90 mb-2 font-medium">
              Game ID
            </label>
            <input
              {...addForm.register("gameId", { required: true })}
              className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              placeholder="Unique game identifier"
            />
          </div>

          <div>
            <label className="block text-orange-200/90 mb-2 font-medium">
              Serial Number
            </label>
            <input
              {...addForm.register("serialNumber", { required: true })}
              className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 placeholder-red-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
              placeholder="Serial / model number"
            />
          </div>

          <div className="md:row-span-2">
            <label className="block text-orange-200/90 mb-2 font-medium flex items-center gap-2">
              <FaImage /> Game Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImageChange}
              className="w-full px-4 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-700 file:to-red-700 file:text-white hover:file:opacity-90 cursor-pointer"
            />
            {addPreview && (
              <div className="mt-4">
                <p className="text-orange-200/80 mb-2">Preview:</p>
                <img
                  src={addPreview}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded-xl border border-red-800/50"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-orange-200/90 font-medium">Status</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...addForm.register("status")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-red-900 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-red-600"></div>
            </label>
            <span className="text-orange-300">
              {addForm.watch("status") ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl text-white font-semibold shadow-lg shadow-red-900/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {addMutation.isPending ? (
                <>
                  <FaSpinner className="animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <FaPlus /> Add Game
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Games Table */}
      <div className="bg-gradient-to-b from-red-950/60 to-black/70 backdrop-blur-md border border-red-800/40 rounded-2xl shadow-2xl shadow-red-950/50 overflow-hidden">
        <div className="p-6 border-b border-red-800/50">
          <h2 className="text-2xl font-semibold text-orange-400">All Games</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-orange-300/70 flex flex-col items-center gap-4">
            <FaSpinner className="text-5xl animate-spin" />
            <p>Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="p-12 text-center text-orange-300/70">
            No games found. Add your first game above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-red-950/70">
                <tr>
                  <th className="px-6 py-4 font-medium text-orange-300">
                    Title
                  </th>
                  <th className="px-6 py-4 font-medium text-orange-300">
                    Game ID
                  </th>
                  <th className="px-6 py-4 font-medium text-orange-300">
                    Serial
                  </th>
                  <th className="px-6 py-4 font-medium text-orange-300">
                    Image
                  </th>
                  <th className="px-6 py-4 font-medium text-orange-300">
                    Status
                  </th>
                  <th className="px-6 py-4 font-medium text-orange-300">
                    Created At
                  </th>
                  <th className="px-6 py-4 font-medium text-orange-300 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/40">
                {games.map((game) => (
                  <tr
                    key={game._id}
                    className="hover:bg-red-950/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-orange-100">
                      {game.title}
                    </td>
                    <td className="px-6 py-4 text-orange-200/90">
                      {game.gameId}
                    </td>
                    <td className="px-6 py-4 text-orange-200/90">
                      {game.serialNumber}
                    </td>
                    <td className="px-6 py-4">
                      {game.image ? (
                        <img
                          src={getImageUrl(game.image)}
                          alt={game.title}
                          className="w-14 h-14 object-cover rounded-lg border border-red-800/50 shadow-sm"
                        />
                      ) : (
                        <span className="text-red-400/70 italic">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={game.status}
                          onChange={(e) =>
                            toggleMutation.mutate({
                              id: game._id,
                              status: e.target.checked,
                            })
                          }
                          disabled={toggleMutation.isPending}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-red-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-red-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-orange-200/90">
                      {formatDate(game.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(game)}
                        className="p-2.5 rounded-lg bg-gradient-to-r from-orange-700/70 to-red-700/70 hover:from-orange-600 hover:to-red-600 text-white transition-all cursor-pointer"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(game._id)}
                        className="p-2.5 rounded-lg bg-gradient-to-r from-red-700/70 to-red-900/70 hover:from-red-600 hover:to-red-800 text-white transition-all cursor-pointer"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-red-950/90 to-black border border-red-800/60 rounded-2xl shadow-2xl shadow-red-950/70 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-red-800/50 flex items-center justify-between sticky top-0 bg-gradient-to-b from-red-950/95 to-red-950/90 backdrop-blur-sm z-10">
              <h3 className="text-2xl font-semibold text-orange-400">
                Edit Game
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-orange-300 hover:text-orange-100 text-2xl cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {editingGame.image && (
                  <div>
                    <p className="text-orange-200/80 mb-2">Current Image</p>
                    <img
                      src={getImageUrl(editingGame.image)}
                      alt="Current"
                      className="w-full max-h-48 object-contain rounded-xl border border-red-800/50 shadow-sm"
                    />
                  </div>
                )}
                {editPreview && (
                  <div>
                    <p className="text-orange-200/80 mb-2">New Preview</p>
                    <img
                      src={editPreview}
                      alt="New Preview"
                      className="w-full max-h-48 object-contain rounded-xl border border-red-800/50 shadow-sm"
                    />
                  </div>
                )}
              </div>

              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className="block text-orange-200/90 mb-2">Title</label>
                  <input
                    {...editForm.register("title", { required: true })}
                    className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-orange-200/90 mb-2">
                    Game ID
                  </label>
                  <input
                    {...editForm.register("gameId", { required: true })}
                    className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-orange-200/90 mb-2">
                    Serial Number
                  </label>
                  <input
                    {...editForm.register("serialNumber", { required: true })}
                    className="w-full px-5 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-orange-200/90 mb-2 flex items-center gap-2">
                    <FaImage /> New Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full px-4 py-3 bg-black/50 border border-red-800/60 rounded-xl text-orange-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-700 file:to-red-700 file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                  {newEditImageFile && (
                    <p className="mt-2 text-sm text-orange-300/80 truncate">
                      Selected: {newEditImageFile.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-orange-200/90 font-medium">
                    Status
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...editForm.register("status")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-red-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-red-600"></div>
                  </label>
                  <span className="text-orange-300">
                    {editForm.watch("status") ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex gap-4 pt-6 border-t border-red-800/40">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl text-white font-semibold shadow-lg disabled:opacity-60 cursor-pointer transition-all"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> Save Changes
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-red-950/70 hover:bg-red-900/70 border border-red-800/60 rounded-xl text-orange-300 hover:text-orange-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-red-950/90 to-black border border-red-800/60 rounded-2xl shadow-2xl shadow-red-950/70 p-8 max-w-md w-full text-center">
            <h3 className="text-2xl font-bold text-red-400 mb-4">
              Confirm Delete
            </h3>
            <p className="text-orange-200/90 mb-8">
              Are you sure you want to delete this game?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-xl text-white font-semibold shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-red-950/70 hover:bg-red-900/70 border border-red-800/60 rounded-xl text-orange-300 hover:text-orange-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGame;
