"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store';
import { cn, formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    brand: string | null;
    price: number;
    mrp: number;
    discount: number;
    rating: number;
    reviewCount: number;
    stock: number;
    images: { url: string; alt: string | null; isPrimary: boolean }[];
    variants: { id: string; name: string; type: string; value: string }[];
  };
  variant?: 'grid' | 'list';
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Assuming addItem is a method on useCartStore
  const addItem = useCartStore((state) => state.addItem);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary) || primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      addItem({
        productId: product.id,
        variantId: null,
        name: product.name,
        image: primaryImage?.url || '',
        price: product.price,
        mrp: product.mrp,
        maxStock: product.stock,
        variantName: null,
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const colorVariants = product.variants.filter((v) => v.type.toLowerCase() === 'color');
  
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i <= Math.round(product.rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      );
    }
    return stars;
  };

  if (variant === 'list') {
    return (
      <Link href={`/products/${product.slug}`}>
        <motion.div 
          className="flex flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group h-full"
          whileHover={{ y: -4 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Section */}
          <div className="relative w-48 shrink-0 bg-gray-50">
            {product.discount > 0 && (
              <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </div>
            )}
            <button 
              onClick={handleWishlist}
              className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className={cn("w-5 h-5 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
            </button>
            <div className="relative aspect-square w-full h-full">
              {primaryImage && (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                  )}
                />
              )}
              {secondaryImage && isHovered && (
                <Image
                  src={secondaryImage.url}
                  alt={secondaryImage.alt || product.name}
                  fill
                  className="object-cover transition-opacity duration-300 opacity-100"
                />
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-black px-3 py-1 rounded-sm font-semibold text-sm">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              {product.brand && (
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  {product.brand}
                </span>
              )}
              <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">
                {product.name}
              </h3>
              {product.shortDescription && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.shortDescription}
                </p>
              )}
              
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center">
                  {renderStars()}
                </div>
                <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice ? formatPrice(product.price) : `₹${product.price}`}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm text-gray-500 line-through mb-1">
                    {formatPrice ? formatPrice(product.mrp) : `₹${product.mrp}`}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="text-sm font-medium text-green-600 mb-1">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {colorVariants.length > 0 && (
                <div className="flex gap-1">
                  {colorVariants.map((v) => (
                    <div 
                      key={v.id} 
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: v.value }}
                      title={v.name}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={cn(
                  "w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-sm",
                  product.stock === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                )}
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div 
        className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group h-full relative"
        whileHover={{ y: -4 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Badges */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
        <button 
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors"
        >
          <Heart className={cn("w-5 h-5 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
        </button>

        {/* Image Section */}
        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className={cn(
                "object-cover transition-all duration-500",
                isHovered ? "scale-105" : "scale-100",
                isHovered && secondaryImage ? "opacity-0" : "opacity-100"
              )}
            />
          )}
          {secondaryImage && isHovered && (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt || product.name}
              fill
              className="object-cover transition-all duration-500 scale-105 opacity-100"
            />
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-black px-3 py-1 rounded-sm font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1">
          {product.brand && (
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              {product.brand}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center">
              {renderStars()}
            </div>
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice ? formatPrice(product.price) : `₹${product.price}`}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-500 line-through mb-1">
                {formatPrice ? formatPrice(product.mrp) : `₹${product.mrp}`}
              </span>
            )}
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-1" />

          {colorVariants.length > 0 && (
            <div className="flex gap-1 mt-3">
              {colorVariants.map((v) => (
                <div 
                  key={v.id} 
                  className="w-3.5 h-3.5 rounded-full border border-gray-200"
                  style={{ backgroundColor: v.value }}
                  title={v.name}
                />
              ))}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={cn(
              "w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-sm",
              product.stock === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}
