import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5007";

// ── Fetch function ────────────────────────────────────────────────
const fetchBottomNavbarSettings = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/bottom-navbar`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

// ── Save function ─────────────────────────────────────────────────
const saveBottomNavbarSettings = async (data) => {
  const res = await axios.post(`${API_BASE}/api/bottom-navbar`, data);
  return res.data;
};

const BottomNavbarController = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bottom-navbar-settings"],
    queryFn: fetchBottomNavbarSettings,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Suggested defaults — aligned with your orange-red-black theme
  const defaultValues = {
    barGradientFrom: "#f97316",     // orange-500
    barGradientVia:  "#dc2626",     // red-600
    barGradientTo:   "#7f1d1d",     // red-900

    activeGradientFrom: "#fb923c",  // orange-400
    activeGradientTo:   "#ef4444",  // red-500
    activeText:         "#ffffff",
    activeShadow:       "#991b1b",  // red-800 with alpha in css

    normalText:         "#fed7aa",  // orange-200
    normalHoverText:    "#ffffff",
  };

  const formValues = data || defaultValues;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: formValues,
  });

  // Watch all fields for live preview + picker sync
  const watched = {
    barGradientFrom:  useWatch({ control, name: "barGradientFrom" }),
    barGradientVia:   useWatch({ control, name: "barGradientVia" }),
    barGradientTo:    useWatch({ control, name: "barGradientTo" }),

    activeGradientFrom: useWatch({ control, name: "activeGradientFrom" }),
    activeGradientTo:   useWatch({ control, name: "activeGradientTo" }),
    activeText:         useWatch({ control, name: "activeText" }),
    activeShadow:       useWatch({ control, name: "activeShadow" }),

    normalText:       useWatch({ control, name: "normalText" }),
    normalHoverText:  useWatch({ control, name: "normalHoverText" }),
  };

  React.useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: saveBottomNavbarSettings,
    onSuccess: (response) => {
      toast.success("Bottom navbar settings saved successfully!", {
        position: "top-right",
        autoClose: 4000,
      });
      queryClient.setQueryData(["bottom-navbar-settings"], response);
      queryClient.invalidateQueries({ queryKey: ["bottom-navbar-settings"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to save settings";
      toast.error(msg, { position: "top-right", autoClose: 6000 });
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xl text-orange-300">
        Loading bottom navbar settings...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-gray-900 rounded-xl border border-red-800/40">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error loading settings</h2>
        <p className="text-gray-300">Using default values. You can still save new colors.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black rounded-2xl border border-red-900/30 shadow-2xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-orange-400 via-red-400 to-red-600 bg-clip-text text-transparent">
        Bottom Navbar Controller
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* ── Main Bar Gradient ────────────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-orange-300 border-b border-red-900/40 pb-2">
            Main Bar Gradient
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {["barGradientFrom", "barGradientVia", "barGradientTo"].map((name, i) => (
              <ColorField
                key={name}
                label={["From", "Via", "To"][i]}
                name={name}
                value={watched[name]}
                register={register}
                setValue={setValue}
              />
            ))}
          </div>
        </section>

        {/* ── Active Link Style ────────────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-orange-300 border-b border-red-900/40 pb-2">
            Active Link Style
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {[
              { name: "activeGradientFrom", label: "Gradient From" },
              { name: "activeGradientTo",   label: "Gradient To" },
              { name: "activeText",         label: "Text Color" },
              { name: "activeShadow",       label: "Shadow Color" },
            ].map((field) => (
              <ColorField
                key={field.name}
                label={field.label}
                name={field.name}
                value={watched[field.name]}
                register={register}
                setValue={setValue}
              />
            ))}
          </div>
        </section>

        {/* ── Normal Link Style ────────────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-orange-300 border-b border-red-900/40 pb-2">
            Normal / Hover Link Style
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { name: "normalText",      label: "Text Color" },
              { name: "normalHoverText", label: "Hover Text Color" },
            ].map((field) => (
              <ColorField
                key={field.name}
                label={field.label}
                name={field.name}
                value={watched[field.name]}
                register={register}
                setValue={setValue}
              />
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={mutation.isPending || isSubmitting}
            className="w-full cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-red-900/40 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
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
              "Save Bottom Navbar Settings"
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
            {JSON.stringify(watched, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Reusable Color Field Component
const ColorField = ({ label, name, value, register, setValue }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => setValue(name, e.target.value, { shouldDirty: true })}
        className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-700 shadow-sm hover:scale-105 transition-transform"
      />
      <input
        type="text"
        {...register(name, {
          pattern: /^#[0-9A-Fa-f]{6}$/i,
          required: true,
        })}
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all"
        placeholder="#rrggbb"
      />
    </div>
  </div>
);

export default BottomNavbarController;