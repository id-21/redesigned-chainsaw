import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client (Service Role)
 * Bypasses Row Level Security for administrative operations
 * IMPORTANT: Only use on server-side (never expose service role key to client)
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Database types based on schema
 */
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  credits_remaining: number;
  total_credits_purchased: number;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  images: Array<{
    url: string;
    filename: string;
    uploaded_at: string;
    is_primary: boolean;
  }>;
  custom_fields: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface GeneratedAsset {
  id: string;
  product_id: string;
  user_id: string;
  generation_type: string;
  prompt: string | null;
  generation_params: Record<string, any>;
  status: "pending" | "processing" | "completed" | "failed";
  is_successful: boolean | null;
  error_message: string | null;
  output_assets: Array<{
    url: string;
    filename: string;
    type: string;
    is_selected: boolean;
  }>;
  generation_duration_ms: number | null;
  api_cost: number | null;
  credits_used: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  is_favorited: boolean;
  user_rating: number | null;
  user_notes: string | null;
}

/**
 * Create a new user in the database
 * Called after Clerk signup to sync user data
 * Uses service role client to bypass RLS (prevents infinite recursion)
 */
export async function createUser(
  clerkUserId: string,
  email: string,
  fullName?: string
) {
  const { data, error } = await supabaseAdmin // ← Changed from supabase to supabaseAdmin
    .from("users")
    .insert({
      id: clerkUserId,
      email,
      full_name: fullName || null,
      role: "user", // Default role
      credits_remaining: 0,
      total_credits_purchased: 0,
      is_active: true,
      email_verified: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }

  return data as User;
}

/**
 * Get user by Clerk ID
 * Cached to prevent multiple database queries within same request
 * Uses service role client to bypass RLS (prevents infinite recursion)
 */
export const getUserById = cache(async (clerkUserId: string) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", clerkUserId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data as User;
});

/**
 * Check if user is an admin
 * Cached to prevent multiple database queries within same request
 */
export const isUserAdmin = cache(async (clerkUserId: string): Promise<boolean> => {
  const user = await getUserById(clerkUserId);
  return user?.role === "admin" && user?.is_active === true;
});

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  return data as User[];
}

/**
 * Update user credits
 */
export async function updateUserCredits(
  userId: string,
  creditsToAdd: number
) {
  const { data, error } = await supabaseAdmin.rpc("add_user_credits", {
    user_id: userId,
    credits: creditsToAdd,
  });

  if (error) {
    console.error("Error updating credits:", error);
    throw error;
  }

  return data;
}

/**
 * Get all products (admin only)
 */
export async function getAllProducts() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      *,
      users:user_id (
        email,
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return data;
}

/**
 * Get all generated assets (admin only)
 */
export async function getAllGeneratedAssets() {
  const { data, error } = await supabaseAdmin
    .from("generated_assets")
    .select(`
      *,
      users:user_id (
        email,
        full_name
      ),
      products:product_id (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching generated assets:", error);
    throw error;
  }

  return data;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  // Get user count
  const { count: userCount, error: userError } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true });

  // Get product count
  const { count: productCount, error: productError } = await supabaseAdmin
    .from("products")
    .select("*", { count: "exact", head: true });

  // Get generation stats
  const { data: generationData, error: generationError } = await supabaseAdmin
    .from("generated_assets")
    .select("status, credits_used, api_cost");

  if (userError || productError || generationError) {
    console.error("Error fetching stats:", {
      userError,
      productError,
      generationError,
    });
    throw userError || productError || generationError;
  }

  const totalGenerations = generationData?.length || 0;
  const successfulGenerations =
    generationData?.filter((g) => g.status === "completed").length || 0;
  const failedGenerations =
    generationData?.filter((g) => g.status === "failed").length || 0;
  const totalCreditsUsed =
    generationData?.reduce((sum, g) => sum + (g.credits_used || 0), 0) || 0;
  const totalCost =
    generationData?.reduce((sum, g) => sum + (Number(g.api_cost) || 0), 0) || 0;

  return {
    userCount: userCount || 0,
    productCount: productCount || 0,
    totalGenerations,
    successfulGenerations,
    failedGenerations,
    totalCreditsUsed,
    totalCost: totalCost.toFixed(2),
  };
}
