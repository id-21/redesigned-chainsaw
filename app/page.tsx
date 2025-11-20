"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddPriceList = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/add-price-list", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Successfully added price list!");
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage("Failed to add price list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4xl font-bold">Virtual Try-On App</h1>
      <p className="mt-4">NextJS + Clerk + Supabase + Gemini</p>

      <div className="mt-8">
        <button
          onClick={handleAddPriceList}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Dummy Price List"}
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
}
