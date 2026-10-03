'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Star, Heart, Share2, ShoppingCart, Zap, Truck, Shield,
  RotateCcw, ChevronRight, ChevronLeft, X, Minus, Plus,
  Camera, Package, CreditCard, Check, MapPin, StarHalf,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// We assume these are provided by the project structure
import { RoomVisualizer } from '@/components/ui/room-visualizer';
import { useCartStore } from '@/store';
import { cn, formatPrice, formatNumber } from '@/lib/utils';

// --- Types ---
type Review = {
  id: string;
  rating: number;
  title: string;
  content: string;
  reviewerName: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
};

type Variant = {
  id: string;
  name: string;
  colorCode?: string;
  priceModifier: number;
  stock: number;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  images: string[];
  inStock: boolean;
  stockCount: number;
  colors: Variant[];
  sizes: Variant[];
  specifications: Record<string, string>;
  reviews: Review[];
  relatedProducts: Partial<Product>[];
};

// --- Mock Data Fallback ---
const MOCK_PRODUCT: Product = {
  id: 'prod_12345',
  slug: 'premium-wireless-headphones',
  name: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones',
  brand: 'Sony',
  description: 'The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and exceptional call quality.',
  price: 24999,
  mrp: 34999,
  discountPercentage: 29,
  rating: 4.6,
  reviewCount: 1234,
  images: [
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1614986161962-fb55979d39c5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
  ],
  inStock: true,
  stockCount: 45,
  colors: [
    { id: 'c1', name: 'Midnight Blue', colorCode: '#191970', priceModifier: 0, stock: 15 },
    { id: 'c2', name: 'Platinum Silver', colorCode: '#E5E4E2', priceModifier: 0, stock: 10 },
    { id: 'c3', name: 'Matte Black', colorCode: '#1C1C1C', priceModifier: 0, stock: 20 },
  ],
  sizes: [],
  specifications: {
    'Form Factor': 'Over Ear',
    'Connectivity': 'Bluetooth 5.2, 3.5mm Jack',
    'Battery Life': 'Up to 30 hours',
    'Charging Time': 'Approx. 3.5 hrs',
    'Weight': '250g',
    'Microphone': '8 Built-in Mics',
  },
  reviews: [
    {
      id: 'rev_1',
      rating: 5,
      title: 'Best ANC headphones on the market',
      content: 'The noise cancellation on these is basically magic. I wear them in the office and can\'t hear a thing around me. Sound quality is crisp with punchy bass.',
      reviewerName: 'Rahul M.',
      date: '12 Oct 2023',
      verified: true,
      helpfulCount: 45,
    },
    {
      id: 'rev_2',
      rating: 4,
      title: 'Great sound, slightly bulky case',
      content: 'Upgraded from XM4. The sound profile is noticeably better and mic quality for calls is a huge leap. Deducting one star because the new case doesn\'t fold down as small.',
      reviewerName: 'Priya S.',
      date: '28 Sep 2023',
      verified: true,
      helpfulCount: 23,
    },
    {
      id: 'rev_3',
      rating: 5,
      title: 'Worth every penny',
      content: 'Absolutely love these. Fast charging is a lifesaver!',
      reviewerName: 'Ankit K.',
      date: '05 Sep 2023',
      verified: false,
      helpfulCount: 8,
    }
  ],
  relatedProducts: [
    {
      id: 'rp1',
      slug: 'sony-wf-1000xm4',
      name: 'Sony WF-1000XM4 Earbuds',
      price: 16990,
      mrp: 19990,
      rating: 4.5,
      reviewCount: 3456,
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400']
    },
    {
      id: 'rp2',
      slug: 'bose-qc45',
      name: 'Bose QuietComfort 45',
      price: 29900,
      mrp: 32900,
      rating: 4.7,
      reviewCount: 2109,
      images: ['https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=400']
    },
    {
      id: 'rp3',
      slug: 'sennheiser-momentum-4',
      name: 'Sennheiser Momentum 4',
      price: 27990,
      mrp: 34990,
      rating: 4.6,
      reviewCount: 890,
      images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=400']
    },
    {
      id: 'rp4',
      slug: 'apple-airpods-max',
      name: 'Apple AirPods Max',
      price: 59900,
      mrp: 59900,
      rating: 4.8,
      reviewCount: 5678,
      images: ['https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=400']
    }
  ]
};

// --- Components ---

const ProductSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
    <div className="flex flex-col lg:flex-row gap-12">
      <div className="lg:w-[55%] space-y-4">
        <div className="aspect-square bg-gray-200 rounded-2xl w-full"></div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
      <div className="lg:w-[45%] space-y-6">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded w-full mt-8"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-4 h-4 fill-current" />)}
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)}
      </div>
      <span className="text-sm font-medium text-gray-700 ml-1">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <a href="#reviews" className="text-sm text-blue-600 hover:underline ml-1">
          ({formatNumber ? formatNumber(count) : count} ratings)
        </a>
      )}
    </div>
  );
}

export default function ProductDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  
  // Try to use cart store, fallback gracefully if not defined exactly like this
  const addToCart = useCartStore((state: any) => state.addItem) || (() => toast.success('Added to cart'));

  // --- State ---
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);

  // --- Data Fetching ---
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Not found');
          // Fallback to mock for dev if API isn't ready
          console.warn('API returned non-ok, falling back to mock data');
          return MOCK_PRODUCT; 
        }
        return (await res.json()) as Product;
      } catch (err) {
        console.warn('Fetch failed, falling back to mock data for demonstration', err);
        return MOCK_PRODUCT;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Init selections when product loads
  React.useEffect(() => {
    if (product) {
      if (product.colors?.length > 0) setSelectedColor(product.colors[0].id);
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0].id);
    }
  }, [product]);

  // --- Handlers ---
  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stockCount) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const activeColor = product.colors.find(c => c.id === selectedColor);
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price + (activeColor?.priceModifier || 0),
      image: product.images[0],
      quantity,
      variant: activeColor?.name
    });
    toast.success('Added to cart successfully!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // --- Render Functions ---
  if (isLoading) return <ProductSkeleton />;
  
  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Go back home
        </Link>
      </div>
    );
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Fallback formatter if not provided by lib/utils
  const fmtPrice = typeof formatPrice === 'function' ? formatPrice : (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const currentVariant = product.colors.find(c => c.id === selectedColor);
  const displayPrice = product.price + (currentVariant?.priceModifier || 0);
  const emiAmount = Math.ceil(displayPrice / 12);

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white hover:text-gray-300 p-2"
            >
              <X className="w-8 h-8" />
            </button>
            <button 
              onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
              className="absolute left-6 text-white hover:text-gray-300 p-2"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button 
              onClick={() => setActiveImageIdx((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
              className="absolute right-6 text-white hover:text-gray-300 p-2"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            <div className="relative w-full max-w-5xl aspect-square md:aspect-video">
              <Image
                src={product.images[activeImageIdx]}
                alt={product.name}
                fill
                className="object-contain"
                quality={100}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1" />
                <Link href={`/category/${product.brand.toLowerCase()}`} className="hover:text-blue-600 transition">
                  {product.brand}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="text-gray-900 truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Top Section: Gallery + Info */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          
          {/* Left: Image Gallery (55%) */}
          <div className="lg:w-[55%] flex flex-col gap-4 relative">
            <div 
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in group"
              onClick={() => setIsLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={product.images[activeImageIdx]}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Floating Actions on Image */}
              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <button 
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md hover:text-red-500 transition-all"
                  aria-label="Add to Wishlist"
                  onClick={(e) => { e.stopPropagation(); toast.success('Added to wishlist'); }}
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button 
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md hover:text-blue-600 transition-all"
                  aria-label="Share"
                  onClick={(e) => { e.stopPropagation(); copyLink(); }}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                    activeImageIdx === idx ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info (45%) */}
          <div className="lg:w-[45%] flex flex-col">
            <Link href={`/brand/${product.brand.toLowerCase()}`} className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-2 hover:underline">
              {product.brand}
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center mb-6">
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>

            {/* Price Section */}
            <div className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-bold text-gray-900">{fmtPrice(displayPrice)}</span>
                {product.mrp > displayPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through mb-1">{fmtPrice(product.mrp)}</span>
                    <span className="text-lg font-semibold text-green-600 mb-1">{product.discountPercentage}% off</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">Inclusive of all taxes</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>EMI starts at <strong>{fmtPrice(emiAmount)}/month</strong>. No Cost EMI available.</span>
              </div>
            </div>

            {/* Variants Selection */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Color: <span className="text-gray-600">{currentVariant?.name}</span></h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        selectedColor === color.id ? 'ring-2 ring-offset-2 ring-gray-900' : 'ring-1 ring-gray-200 hover:ring-gray-400'
                      }`}
                      title={`${color.name} ${color.priceModifier ? `(+${fmtPrice(color.priceModifier)})` : ''}`}
                    >
                      <span 
                        className="w-10 h-10 rounded-full shadow-inner block" 
                        style={{ backgroundColor: color.colorCode || '#ccc' }} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Offers Section */}
            <div className="mb-8 space-y-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500 fill-current" /> Available Offers
              </h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Bank Offer:</strong> 10% off on HDFC Bank Credit Card EMI Transactions, up to ₹1,500.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>No Cost EMI:</strong> Available on orders above ₹3,000 using select credit cards.</span>
                </li>
              </ul>
            </div>

            {/* Delivery Section */}
            <div className="mb-8 p-4 border border-gray-200 rounded-xl">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-500" /> Delivery Options
              </h3>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-grow">
                  <input 
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full pl-3 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                  Check
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-700">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span>Free delivery by <strong>{formattedDeliveryDate}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <RotateCcw className="w-5 h-5 text-blue-500" />
                  <span>7 Days Replacement Policy</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span>1 Year Brand Warranty</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg h-10 w-32">
                  <button 
                    onClick={() => handleQuantityChange(-1)} 
                    disabled={quantity <= 1}
                    className="px-3 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition border-r border-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-medium text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)} 
                    disabled={quantity >= product.stockCount}
                    className="px-3 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition border-l border-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 text-right">
                  {product.inStock ? (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">In Stock ({product.stockCount} left)</span>
                  ) : (
                    <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
                >
                  <Zap className="w-5 h-5 fill-current" /> Buy Now
                </button>
              </div>
              
              <button 
                onClick={() => setIsVisualizerOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <Camera className="w-5 h-5" /> Visualize in Room
              </button>
            </div>

            <RoomVisualizer 
              isOpen={isVisualizerOpen}
              onClose={() => setIsVisualizerOpen(false)}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                stock: product.stockCount,
                image: product.images[0],
                details: product.description
              }}
            />

          </div>
        </div>

        {/* Below Fold: Tabs Section */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex gap-8 border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {(['description', 'specifications', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-lg font-medium whitespace-nowrap transition-all relative ${
                  activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="py-8 min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Description Tab */}
                {activeTab === 'description' && (
                  <div className="max-w-3xl text-gray-700 leading-relaxed space-y-6">
                    <p className="text-lg">{product.description}</p>
                    <p>Experience unmatched comfort and pristine audio quality with our latest generation of acoustic engineering. Whether you're commuting, working in a busy office, or relaxing at home, these deliver an immersive soundscape tailored specifically to you.</p>
                  </div>
                )}

                {/* Specifications Tab */}
                {activeTab === 'specifications' && (
                  <div className="max-w-3xl">
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <tbody>
                          {Object.entries(product.specifications).map(([key, value], idx) => (
                            <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <th className="px-6 py-4 font-medium text-gray-900 w-1/3 border-r border-gray-200">{key}</th>
                              <td className="px-6 py-4 text-gray-700">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12" id="reviews">
                    {/* Left: Summary */}
                    <div className="lg:col-span-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-5xl font-bold text-gray-900">{product.rating.toFixed(1)}</div>
                        <div>
                          <StarRating rating={product.rating} />
                          <p className="text-sm text-gray-500 mt-1">Based on {product.reviewCount} reviews</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-8">
                        {[5,4,3,2,1].map(star => {
                          // Mock distribution
                          const p = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2;
                          return (
                            <div key={star} className="flex items-center gap-3 text-sm">
                              <span className="w-12 font-medium text-gray-600">{star} star</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${p}%` }}></div>
                              </div>
                              <span className="w-10 text-right text-gray-500">{p}%</span>
                            </div>
                          )
                        })}
                      </div>

                      <button className="w-full py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-900 hover:bg-gray-50 transition">
                        Write a Review
                      </button>
                    </div>

                    {/* Right: Review List */}
                    <div className="lg:col-span-8 space-y-6">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <h4 className="font-bold text-gray-900 ml-2">{review.title}</h4>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{review.reviewerName}</span>
                                <span>•</span>
                                <span>{review.date}</span>
                                {review.verified && (
                                  <>
                                    <span>•</span>
                                    <span className="text-green-600 flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Verified Purchase
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mt-3">{review.content}</p>
                          <div className="mt-4 flex items-center gap-4">
                            <span className="text-sm text-gray-500">{review.helpfulCount} people found this helpful</span>
                            <button className="text-sm font-medium text-gray-700 border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-50 transition">
                              Helpful
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Customers also viewed</h2>
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
              {product.relatedProducts.map((item) => (
                <Link 
                  href={`/products/${item.slug}`} 
                  key={item.id}
                  className="group flex-shrink-0 w-64 snap-start border border-gray-200 rounded-2xl p-4 hover:shadow-xl hover:border-blue-200 transition-all bg-white"
                >
                  <div className="relative aspect-square mb-4 bg-gray-50 rounded-xl overflow-hidden">
                    <Image 
                      src={item.images?.[0] || ''} 
                      alt={item.name || ''} 
                      fill 
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition">{item.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                    <span className="text-sm text-gray-500">({item.reviewCount})</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-gray-900">{fmtPrice(item.price || 0)}</span>
                    {item.mrp && item.mrp > (item.price || 0) && (
                      <span className="text-sm text-gray-500 line-through">{fmtPrice(item.mrp)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
