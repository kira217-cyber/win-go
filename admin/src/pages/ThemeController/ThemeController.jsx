import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5007";

// ── Fetch function ────────────────────────────────────────────────
const fetchThemeSettings = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/api/theme-settings`);
    return data.data || data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

// ── Save function ─────────────────────────────────────────────────
const saveThemeSettings = async (formData) => {
  const { data } = await axios.post(`${API_BASE}/api/theme-settings`, formData);
  return data.data || data;
};

const ThemeController = () => {
  const queryClient = useQueryClient();

  // Default values — matching your sidebar/nav orange-red gradient theme
  const defaultValues = {
    gradientFrom: "#f97316", // orange-500
    gradientVia:  "#dc2626", // red-600
    gradientTo:   "#7f1d1d", // red-900
    textColor:    "#ffffff", // white
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues,
  });

  // Watch values for live sync & preview
  const gradientFrom = useWatch({ control, name: "gradientFrom" });
  const gradientVia  = useWatch({ control, name: "gradientVia" });
  const gradientTo   = useWatch({ control, name: "gradientTo" });
  const textColor    = useWatch({ control, name: "textColor" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: fetchThemeSettings,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: saveThemeSettings,
    onSuccess: (savedData) => {
      toast.success("Theme settings saved successfully!", {
        position: "top-right",
        autoClose: 4000,
      });
      queryClient.setQueryData(["theme-settings"], savedData);
      queryClient.invalidateQueries({ queryKey: ["theme-settings"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to save theme settings";
      toast.error(msg, { position: "top-right", autoClose: 6000 });
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xl text-orange-300">
        Loading theme settings...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-gray-900 rounded-xl border border-red-800/40">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error loading theme</h2>
        <p className="text-gray-300">Using default values. You can still save new colors.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black rounded-2xl border border-red-900/30 shadow-2xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-orange-400 via-red-400 to-red-600 bg-clip-text text-transparent">
        Theme Controller
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">

          {[
            { name: "gradientFrom", label: "Gradient From", color: gradientFrom },
            { name: "gradientVia",  label: "Gradient Via",  color: gradientVia },
            { name: "gradientTo",   label: "Gradient To",   color: gradientTo },
            { name: "textColor",    label: "Text Color",    color: textColor },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {field.label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={field.color || "#000000"}
                  onChange={(e) => setValue(field.name, e.target.value, { shouldDirty: true })}
                  className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-700 shadow-sm hover:scale-105 transition-transform"
                />
                <input
                  type="text"
                  {...register(field.name, {
                    pattern: /^#[0-9A-Fa-f]{6}$/i,
                    required: true,
                  })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all"
                  placeholder="#rrggbb"
                />
              </div>
            </div>
          ))}

        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={mutation.isPending || isSubmitting}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-red-900/40 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
          >
            {mutation.isPending || isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Theme Settings"
            )}
          </button>
        </div>
      </form>

      {/* Live Preview */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <h3 className="text-xl font-semibold mb-5 text-center text-orange-300">
          Current Values (Live)
        </h3>
        <div className="bg-black/60 p-6 rounded-xl border border-red-900/30 font-mono text-sm overflow-x-auto">
          <pre className="text-green-300 whitespace-pre-wrap">
            {JSON.stringify(
              {
                gradientFrom,
                gradientVia,
                gradientTo,
                textColor,
              },
              null,
              2
            )}
          </pre>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Colors are stored as HEX (#rrggbb) format.
        </p>
      </div>
    </div>
  );
};

export default ThemeController;