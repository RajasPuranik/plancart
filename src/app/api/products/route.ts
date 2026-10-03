import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";
import type { ProductFilters } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: ProductFilters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      colors: searchParams.get("colors")
        ? searchParams.get("colors")!.split(",")
        : undefined,
      materials: searchParams.get("materials")
        ? searchParams.get("materials")!.split(",")
        : undefined,
      brands: searchParams.get("brands")
        ? searchParams.get("brands")!.split(",")
        : undefined,
      minRating: searchParams.get("minRating")
        ? Number(searchParams.get("minRating"))
        : undefined,
      inStock: searchParams.get("inStock") === "true",
      tags: searchParams.get("tags")
        ? searchParams.get("tags")!.split(",")
        : undefined,
      sortBy: (searchParams.get("sortBy") as ProductFilters["sortBy"]) || "featured",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit")
        ? Math.min(Number(searchParams.get("limit")), 50)
        : 20,
    };

    const result = await searchProducts(filters);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
