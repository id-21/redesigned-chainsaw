"use client";

import { useState } from "react";

export default function HomePageClient() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [imageError, setImageError] = useState("");

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
    <main className="min-h-screen container-page py-16">
      <h1 className="text-4xl font-bold">Virtual Try-On App</h1>
      <p className="mt-4 text-neutral">NextJS + Clerk + Supabase + Gemini</p>

      <div className="mt-12 divider"></div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Generate Image with Gemini</h2>
        <div className="flex gap-6 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Enter image generation prompt..."
              className="input-dark mb-4"
            />
            <button
              onClick={handleGenerateImage}
              disabled={generatingImage}
              className="btn btn-primary"
            >
              {generatingImage ? "Generating..." : "Generate Image"}
            </button>
            {imageError && <p className="form-error mt-4">{imageError}</p>}
          </div>
          {generatedImage && (
            <div className="flex-1">
              <img
                src={`data:image/png;base64,${generatedImage}`}
                alt="Generated"
                className="w-full rounded-lg shadow-brand"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
