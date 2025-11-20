import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  const dummyData = {
    id: `price_${Date.now()}`,
    name: `Demo Price List ${new Date().toLocaleString()}`,
    customer_email: "demo@example.com",
    pricing_data: JSON.stringify({ items: [{ product: "T-Shirt", price: 29.99 }] }),
    created_by: "demo_user",
  };

  const { data, error } = await supabase
    .from("price_lists")
    .insert(dummyData)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
