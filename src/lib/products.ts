import prisma from "@/lib/prisma";
import type { ProductFilters, PaginatedResponse, ProductListItem } from "@/types";

/**
 * Search and filter products from the database.
 * Used by both the API routes and the AI chatbot's function calling.
 */
export async function searchProducts(
  filters: ProductFilters
): Promise<PaginatedResponse<ProductListItem>> {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    colors,
    materials,
    brands,
    minRating,
    inStock,
    tags,
    sortBy = "featured",
    page = 1,
    limit = 20,
  } = filters;

  const where: Record<string, unknown> = {
    isActive: true,
  };

  // Full-text search on name, description, brand, tags
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  // Category filter
  if (category) {
    where.category = { slug: category };
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      (where.price as Record<string, number>).gte = minPrice;
    }
    if (maxPrice !== undefined) {
      (where.price as Record<string, number>).lte = maxPrice;
    }
  }

  // Brand filter
  if (brands && brands.length > 0) {
    where.brand = { in: brands, mode: "insensitive" };
  }

  // Material filter
  if (materials && materials.length > 0) {
    where.material = { in: materials, mode: "insensitive" };
  }

  // Rating filter
  if (minRating !== undefined) {
    where.rating = { gte: minRating };
  }

  // Stock filter
  if (inStock) {
    where.stock = { gt: 0 };
  }

  // Tags filter
  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  // Color filter (via variants)
  if (colors && colors.length > 0) {
    where.variants = {
      some: {
        type: "COLOR",
        name: { in: colors, mode: "insensitive" },
      },
    };
  }

  // Sort order
  type SortOrder = "asc" | "desc";
  let orderBy: Record<string, SortOrder | Record<string, SortOrder>> = {};
  switch (sortBy) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "featured":
    default:
      orderBy = { isFeatured: "desc" };
      break;
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        brand: true,
        price: true,
        mrp: true,
        discount: true,
        rating: true,
        reviewCount: true,
        stock: true,
        isFeatured: true,
        tags: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            url: true,
            alt: true,
            isPrimary: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            type: true,
            value: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: products as unknown as ProductListItem[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Get a single product by slug with all details.
 */
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        orderBy: { createdAt: "asc" },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

/**
 * Get a product by ID with minimal data for chatbot responses.
 */
export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: { name: true, slug: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      variants: {
        select: {
          id: true,
          name: true,
          type: true,
          value: true,
          additionalPrice: true,
          stock: true,
        },
      },
    },
  });
}

/**
 * Compare multiple products side by side.
 */
export async function compareProducts(ids: string[]) {
  return prisma.product.findMany({
    where: { id: { in: ids } },
    include: {
      category: {
        select: { name: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      variants: true,
    },
  });
}

/**
 * Get all categories with product counts.
 */
export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get featured products for the home page.
 */
export async function getFeaturedProducts(limit: number = 12) {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: limit,
    include: {
      category: {
        select: { name: true, slug: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        where: { type: "COLOR" },
        select: {
          id: true,
          name: true,
          value: true,
        },
      },
    },
    orderBy: { rating: "desc" },
  });
}

/**
 * Get distinct brands for filter options.
 */
export async function getDistinctBrands(categorySlug?: string) {
  const where: Record<string, unknown> = { isActive: true };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const products = await prisma.product.findMany({
    where,
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  return products
    .map((p) => p.brand)
    .filter((brand): brand is string => brand !== null);
}

/**
 * Get distinct materials for filter options.
 */
export async function getDistinctMaterials(categorySlug?: string) {
  const where: Record<string, unknown> = { isActive: true };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const products = await prisma.product.findMany({
    where,
    select: { material: true },
    distinct: ["material"],
    orderBy: { material: "asc" },
  });

  return products
    .map((p) => p.material)
    .filter((material): material is string => material !== null);
}
