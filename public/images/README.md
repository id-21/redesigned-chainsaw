# Image Assets Directory

This directory structure is ready for your marketing homepage images. Place your image files in the appropriate subdirectories as you create them.

## Directory Structure

```
public/images/
├── hero/                 # Hero section background images
├── showcase/             # Product showcase images
├── before-after/         # Before/after comparison pairs
├── features/             # Feature section icons/images
└── logo/                 # Logo files
```

## Image Placement Guide

### 1. Hero Section (`hero/`)
Place your hero background image here:
- **Example:** `hero-background.jpg` or `hero-background.png`
- **Recommended size:** 1920x1080px or larger
- **Format:** JPG for photos, PNG if transparency needed

### 2. Product Showcase (`showcase/`)
Place 4-6 product images here:
- **Example naming:** `product-1.jpg`, `product-2.jpg`, etc.
- **Recommended size:** Square or 4:3 aspect ratio, minimum 800x800px
- **Format:** JPG preferred for photos

### 3. Before/After Slider (`before-after/`)
Place image pairs for comparison slider:
- **Naming convention:**
  - `demo-1-before.jpg` and `demo-1-after.jpg`
  - `demo-2-before.jpg` and `demo-2-after.jpg`
  - etc.
- **Important:** Each pair must have identical dimensions
- **Recommended size:** 800x800px or larger
- **Format:** JPG preferred

### 4. Feature Icons (`features/`)
Place 3-5 icons/images for feature highlights:
- **Example naming:** `feature-1.svg`, `feature-2.svg`, etc.
- **Format:** SVG preferred (scalable), or PNG at 2x resolution
- **Recommended size (if PNG):** 256x256px or larger

### 5. Logo (`logo/`)
Place your logo files:
- **Example:** `logo.svg` (main logo)
- **Optional:** `logo-white.svg` (for dark backgrounds)
- **Format:** SVG preferred for scalability

## Notes

- You can add images incrementally as you create them
- The components will be built to handle missing images gracefully
- All images will be optimized automatically using Next.js Image component
- SVG is preferred for icons and logos (infinite scalability)
- Use WebP format for even better optimization (optional)

## Current Status

✅ Font files: Added (Bitter and Space Mono)
⏳ Image files: Waiting for your assets

Once you add images, they'll be automatically available at:
- `/images/hero/your-image.jpg`
- `/images/showcase/product-1.jpg`
- etc.
