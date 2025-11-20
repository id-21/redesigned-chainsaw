"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [imageError, setImageError] = useState("");

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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setImageError("Please enter a prompt");
      return;
    }

    setGeneratingImage(true);
    setImageError("");
    setGeneratedImage("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      const result = await response.json();

      if (response.ok && result.imageData) {
        setGeneratedImage(result.imageData);
      } else {
        setImageError(result.error || "Failed to generate image");
      }
    } catch (error) {
      setImageError("Failed to generate image");
    } finally {
      setGeneratingImage(false);
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

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Generate Image with Gemini</h2>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Enter image generation prompt..."
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />
            <button
              onClick={handleGenerateImage}
              disabled={generatingImage}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {generatingImage ? "Generating..." : "Generate Image"}
            </button>
            {imageError && <p className="mt-4 text-sm text-red-600">{imageError}</p>}
          </div>
          {generatedImage && (
            <div className="flex-1">
              <img
                src={`data:image/png;base64,${generatedImage}`}
                alt="Generated"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
