# Virtual Try-On Feature Setup Guide

## Overview

This guide covers the setup required to use the Virtual Try-On feature in your application.

## Prerequisites

- Clerk authentication configured
- Supabase database with schema applied (see `discussions/setup-files/schema.sql`)
- Gemini API key configured
- Next.js app running

---

## 1. Supabase Storage Setup

The Virtual Try-On feature uses Supabase Storage to store product images and generated assets.

### Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard → Storage
2. Create two buckets:

**Bucket 1: `product-images`**
- Name: `product-images`
- Public: ✅ Yes (for easy image access)
- File size limit: 10MB
- Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

**Bucket 2: `generated-assets`**
- Name: `generated-assets`
- Public: ✅ Yes
- File size limit: 10MB
- Allowed MIME types: `image/png`, `image/jpeg`

### Step 2: Configure RLS Policies for Storage

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Product Images Bucket Policies
-- Users can upload their own images
CREATE POLICY "Users can upload own product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own images
CREATE POLICY "Users can view own product images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own images
CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all product images
CREATE POLICY "Admins can view all product images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()::text
    AND users.role = 'admin'
  )
);

-- Generated Assets Bucket Policies
-- Users can upload their own generated assets
CREATE POLICY "Users can upload own generated assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own generated assets
CREATE POLICY "Users can view own generated assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all generated assets
CREATE POLICY "Admins can view all generated assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-assets'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()::text
    AND users.role = 'admin'
  )
);
```

---

## 2. Initial User Credits

New users need credits to generate images. You can either:

### Option A: Give Initial Credits via SQL

```sql
-- Give all users 10 free credits
UPDATE users SET credits_remaining = 10 WHERE credits_remaining = 0;
```

### Option B: Update Clerk Webhook to Give Credits

Modify your Clerk user creation webhook to set initial credits:

```typescript
// In your Clerk webhook handler
await supabase
  .from('users')
  .insert({
    id: clerkUserId,
    email: clerkUser.email,
    credits_remaining: 10, // Initial free credits
    // ... other fields
  });
```

---

## 3. Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-image
```

---

## 4. Accessing the Virtual Try-On Feature

### User Journey

1. **Homepage**: Navigate to `/(virtual-tryon)` or just `/`
   - View credit balance
   - See recent generations
   - Click "Create New Generation" button

2. **Generation Page**: Navigate to `/(virtual-tryon)/generate`
   - Upload new product OR select existing product
   - Choose generation type (Model Shot, Lifestyle, Room Scene)
   - Optionally add custom prompt
   - Click "Generate Virtual Try-On"

3. **View Results**:
   - Generated image appears in preview
   - Download generated image
   - View in gallery on homepage

---

## 5. Feature Architecture

### Modular Structure

All Virtual Try-On code is isolated in dedicated directories:

```
app/
├── (virtual-tryon)/              # Route group for feature pages
│   ├── page.tsx                  # Homepage with gallery
│   ├── generate/
│   │   └── page.tsx              # Generation page
│   └── _components/              # Feature-specific components
│       ├── VirtualTryonHomePage.tsx
│       ├── GenerationsGallery.tsx
│       ├── GalleryCard.tsx
│       ├── GalleryModal.tsx
│       ├── GenerationPageClient.tsx
│       ├── ProductSelector.tsx
│       ├── ProductUploader.tsx
│       ├── GenerationForm.tsx
│       └── GenerationPreview.tsx
│
├── api/
│   └── virtual-tryon/            # Namespaced API routes
│       ├── products/route.ts
│       ├── products/[productId]/route.ts
│       ├── generated-assets/route.ts
│       ├── generated-assets/[assetId]/route.ts
│       ├── upload/route.ts
│       ├── generate/route.ts
│       └── credits/route.ts
│
lib/
└── features/
    └── virtual-tryon/            # Feature-specific logic
        ├── types.ts              # TypeScript interfaces
        ├── queries.ts            # Database queries
        ├── storage.ts            # File upload helpers
        └── utils.ts              # Utility functions
```

### Benefits of This Structure

✅ **Easy to remove**: Delete `(virtual-tryon)`, `api/virtual-tryon`, and `lib/features/virtual-tryon`
✅ **Easy to port**: Copy these directories to another project
✅ **Isolated**: No impact on base template (auth, admin, etc.)
✅ **Organized**: Clear separation of concerns

---

## 6. API Endpoints

### Products
- `GET /api/virtual-tryon/products` - List user's products
- `POST /api/virtual-tryon/products` - Create new product
- `GET /api/virtual-tryon/products/[id]` - Get specific product
- `PATCH /api/virtual-tryon/products/[id]` - Update product
- `DELETE /api/virtual-tryon/products/[id]` - Delete product

### Generated Assets
- `GET /api/virtual-tryon/generated-assets` - List user's generations
- `POST /api/virtual-tryon/generated-assets` - Create generation record
- `GET /api/virtual-tryon/generated-assets/[id]` - Get specific asset
- `PATCH /api/virtual-tryon/generated-assets/[id]` - Update asset
- `DELETE /api/virtual-tryon/generated-assets/[id]` - Delete asset

### Other
- `POST /api/virtual-tryon/upload` - Upload product image
- `POST /api/virtual-tryon/generate` - Generate virtual try-on image
- `GET /api/virtual-tryon/credits` - Get user's credit balance

---

## 7. Credits System

### Credit Costs

- **Model Shot**: 1 credit
- **Lifestyle**: 1 credit
- **Room Scene**: 2 credits

### Managing Credits

Users can check their credit balance:
- Homepage: Displayed prominently
- Generation page: Shows before generating

Admins can add credits via SQL:

```sql
-- Add 50 credits to specific user
UPDATE users
SET
  credits_remaining = credits_remaining + 50,
  total_credits_purchased = total_credits_purchased + 50
WHERE id = 'user_xxx';
```

---

## 8. Troubleshooting

### Issue: "Unauthorized" errors

**Solution**: Ensure user is authenticated with Clerk and exists in Supabase users table.

### Issue: "Failed to upload image"

**Solution**:
1. Check Supabase Storage buckets are created
2. Verify RLS policies are applied
3. Confirm file size < 10MB
4. Check file type is image

### Issue: "Insufficient credits"

**Solution**: Add credits to user account via SQL or admin panel.

### Issue: Images not loading

**Solution**:
1. Check bucket is set to "Public"
2. Verify correct Supabase URL in environment variables
3. Check browser console for CORS errors

### Issue: Generation fails

**Solution**:
1. Verify GEMINI_API_KEY is set correctly
2. Check Gemini API quota/limits
3. Review API error in server logs
4. Ensure product has valid image URL

---

## 9. Future Enhancements

Potential features to add:

- [ ] Credit purchase system (Stripe integration)
- [ ] Batch generation (multiple images at once)
- [ ] Generation history filtering/search
- [ ] Image editing before generation
- [ ] Social sharing of generated images
- [ ] A/B testing of different prompts
- [ ] Generation templates/presets
- [ ] Advanced analytics dashboard

---

## 10. Removing the Feature

To remove the Virtual Try-On feature entirely:

1. Delete directories:
   ```bash
   rm -rf app/(virtual-tryon)
   rm -rf app/api/virtual-tryon
   rm -rf lib/features/virtual-tryon
   ```

2. Remove database tables (optional):
   ```sql
   DROP TABLE IF EXISTS generated_assets CASCADE;
   DROP TABLE IF EXISTS products CASCADE;
   ```

3. Delete Supabase Storage buckets:
   - Delete `product-images` bucket
   - Delete `generated-assets` bucket

4. Remove navigation links (if any added to main layout)

---

## Support

For issues or questions:
1. Check this documentation
2. Review server logs for errors
3. Check Supabase dashboard for data/storage issues
4. Verify all environment variables are set correctly
