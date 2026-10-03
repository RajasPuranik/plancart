"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store";
import {
  Search,
  Mic,
  ShoppingCart,
  Heart,
  Star,
  ChevronRight,
  MessageCircle,
  Camera,
  Volume2,
  Truck,
  Shield,
  RotateCcw,
  Monitor,
  Sofa,
  Shirt,
  Headphones,
  Gamepad,
  Watch,
  Smartphone,
  Dumbbell
} from "lucide-react";

// --- MOCK DATA ---
const CATEGORIES = [
  { id: 1, name: "Electronics", icon: Monitor, count: 1240 },
  { id: 2, name: "Furniture", icon: Sofa, count: 830 },
  { id: 3, name: "Fashion", icon: Shirt, count: 3200 },
  { id: 4, name: "Audio", icon: Headphones, count: 450 },
  { id: 5, name: "Gaming", icon: Gamepad, count: 620 },
  { id: 6, name: "Watches", icon: Watch, count: 310 },
  { id: 7, name: "Mobiles", icon: Smartphone, count: 950 },
  { id: 8, name: "Fitness", icon: Dumbbell, count: 420 },
];

const FEATURED_PRODUCTS = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  name: [
    "Sony WH-1000XM5 Wireless Headphones",
    "Ergonomic Office Chair with Lumbar Support",
    "Samsung 55\" 4K Smart OLED TV",
    "Apple MacBook Pro M3 Max",
    "Nike Air Max 2024 Edition",
    "Minimalist Ceramic Coffee Mug Set",
    "Smart Fitness Tracker Band",
    "Mechanical Gaming Keyboard RGB",
    "Designer Leather Wallet",
    "Premium Yoga Mat Non-Slip",
    "Professional DSLR Camera 4K",
    "Wireless Noise Cancelling Earbuds",
    "Modern Wooden Coffee Table",
    "Smart Home Security Camera",
    "Stainless Steel Water Bottle"
  ][i],
  brand: ["Sony", "ErgoFlex", "Samsung", "Apple", "Nike", "Cerami", "FitTech", "KeyPro", "Luxe", "Yogi", "Canon", "AudioTech", "WoodCraft", "SecureHome", "Hydro"][i],
  price: [29999, 12500, 85000, 249000, 14999, 1299, 3999, 6500, 2499, 1899, 115000, 18500, 8900, 4500, 999][i],
  mrp: [34999, 18000, 95000, 269000, 17999, 1999, 5999, 8999, 3499, 2999, 135000, 24000, 12000, 6999, 1499][i],
  rating: [4.8, 4.5, 4.9, 4.9, 4.6, 4.3, 4.1, 4.7, 4.4, 4.6, 4.8, 4.5, 4.2, 4.4, 4.7][i],
  reviews: [1240, 856, 432, 98, 2104, 345, 876, 543, 212, 654, 187, 943, 234, 567, 1298][i],
  image: [
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"
  ][i],
  discount: Math.round(((
    [34999, 18000, 95000, 269000, 17999, 1999, 5999, 8999, 3499, 2999, 135000, 24000, 12000, 6999, 1499][i] - 
    [29999, 12500, 85000, 249000, 14999, 1299, 3999, 6500, 2499, 1899, 115000, 18500, 8900, 4500, 999][i]
  ) / [34999, 18000, 95000, 269000, 17999, 1999, 5999, 8999, 3499, 2999, 135000, 24000, 12000, 6999, 1499][i]) * 100)
}));

const DEALS = [
  { id: 1, name: "Apple iPad Air (5th Gen)", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80", before: "₹59,900", after: "₹49,900" },
  { id: 2, name: "Bose SoundLink Flex", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80", before: "₹15,900", after: "₹12,500" },
  { id: 3, name: "Dyson V15 Detect", image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80", before: "₹65,900", after: "₹54,900" },
  { id: 4, name: "Nespresso Vertuo Plus", image: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80", before: "₹22,500", after: "₹16,999" },
];

const SUGGESTIONS = [
  "Sofa under ₹25,000",
  "LED desk lamp",
  "Running shoes",
  "Smart TV 55 inch"
];

// --- COMPONENTS ---

const ProductCard = ({ product }: { product: any }) => {
  const addItem = useCartStore((state) => state.addItem);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: String(product.id),
      variantId: null,
      name: product.name,
      image: product.image,
      price: product.price,
      mrp: product.mrp,
      maxStock: 10,
      variantName: null,
    });
    // @ts-ignore
    window.toast?.success(`${product.name} added to cart!`) || alert(`${product.name} added to cart!`);
  };

  return (
  <div className="group min-w-[280px] md:min-w-[320px] bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
    <div className="relative h-64 overflow-hidden bg-slate-50">
      <div className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors">
        <Heart className="w-5 h-5" />
      </div>
      <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
        {product.discount}% OFF
      </div>
      <Image
        src={product.image}
        alt={product.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
      />
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <div className="text-xs text-slate-500 mb-1">{product.brand}</div>
      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
      <div className="flex items-center gap-1 mb-3">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium text-slate-700">{product.rating}</span>
        <span className="text-xs text-slate-400">({product.reviews})</span>
      </div>
      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-slate-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-sm text-slate-400 line-through">
            ₹{product.mrp.toLocaleString('en-IN')}
          </span>
        </div>
        <button onClick={handleAddToCart} className="w-full bg-slate-900 hover:bg-primary-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors duration-300">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  </div>
)};

// --- MAIN PAGE ---

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeLeft, setTimeLeft] = useState({ h: 14, m: 25, s: 59 });
  const [proceduralProduct, setProceduralProduct] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { clearInterval(timer); return { h: 0, m: 0, s: 0 }; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleProceduralSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setProceduralProduct(null);
    
    // Procedural generation
    setTimeout(() => {
      const hash = searchQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const approxPrice = 500 + (hash % 49500); 
      const generatedImageUrl = `https://image.pollinations.ai/prompt/high%20quality%20product%20photography%20of%20${encodeURIComponent(searchQuery)}%20white%20background?width=800&height=800&nologo=true`;
      
      setProceduralProduct({
        id: `gen-${Date.now()}`,
        name: searchQuery,
        brand: "AI Generated",
        price: approxPrice,
        mrp: Math.floor(approxPrice * 1.2),
        rating: 4.8,
        reviews: Math.floor(Math.random() * 500) + 10,
        images: [{ url: generatedImageUrl, alt: searchQuery, isPrimary: true }],
        stock: 10,
        discount: 20
      });
      setIsSearching(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white pt-32 pb-24 px-6 md:px-12 rounded-b-[40px] md:rounded-b-[80px]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-soft"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-accent-400"></span>
            <span className="text-sm font-medium text-primary-50">PlanCart AI 2.0 is now live</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            Shop Smarter <br className="md:hidden" /> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-primary-300">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-2xl text-primary-100 mb-12 max-w-2xl font-light"
          >
            Tell us what you need. Our AI finds the perfect match.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full max-w-3xl relative"
          >
            <div className="relative flex items-center bg-white rounded-full p-2 shadow-2xl">
              <div className="pl-4 pr-2 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onKeyDown={(e) => { if (e.key === 'Enter') handleProceduralSearch(); }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tell me what you're looking for..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 text-lg py-4 placeholder-slate-400"
              />
              <button className="p-3 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors mr-2">
                <Mic className="w-6 h-6" />
              </button>
              <button onClick={handleProceduralSearch} disabled={isSearching} className="bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white px-8 py-4 rounded-full font-semibold transition-colors flex items-center gap-2">
                {isSearching ? 'Generating...' : 'Search'}
              </button>
            </div>
            
            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {SUGGESTIONS.map((suggestion, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setSearchQuery(suggestion); setTimeout(() => handleProceduralSearch(), 100); }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>

          {/* AI Generated Product Result */}
          <AnimatePresence>
            {proceduralProduct && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-12 w-full max-w-md mx-auto"
              >
                <h3 className="text-xl font-bold mb-4 text-white">AI Found This For You</h3>
                <div className="text-left text-slate-900">
                  <ProductCard product={proceduralProduct} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 relative inline-block">
              Shop by Category
              <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-600 rounded-full"></div>
            </h2>
          </div>
          <Link href="/categories" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
            Browse all categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-surface border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary-50 text-slate-600 group-hover:text-primary-600 transition-colors">
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{cat.name}</h3>
              <p className="text-xs text-slate-500">{cat.count.toLocaleString()} items</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-16 bg-slate-50 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 relative inline-block">
                Featured Products
                <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-600 rounded-full"></div>
              </h2>
            </div>
            <Link href="/products" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              View all products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar">
            {FEATURED_PRODUCTS.map((product) => (
              <div key={product.id} className="snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEALS BANNER */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-secondary-500 to-orange-500 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row gap-12 items-center">
            <div className="flex-1 text-center xl:text-left">
              <span className="uppercase tracking-wider font-bold text-orange-100 text-sm mb-4 block">Flash Sale</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Deals of the Day</h2>
              <p className="text-lg text-orange-50 mb-8 max-w-md mx-auto xl:mx-0">
                Don't miss out on these exclusive offers. Quantities are limited!
              </p>
              
              <div className="flex gap-4 justify-center xl:justify-start">
                {[
                  { label: "HOURS", val: timeLeft.h },
                  { label: "MINS", val: timeLeft.m },
                  { label: "SECS", val: timeLeft.s }
                ].map((time, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl font-bold border border-white/30">
                      {time.val.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs font-semibold mt-2 text-orange-100">{time.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
              {DEALS.map((deal) => (
                <div key={deal.id} className="bg-white rounded-2xl p-4 shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="relative h-32 md:h-40 rounded-xl overflow-hidden mb-4 bg-slate-50">
                    <Image src={deal.image} alt={deal.name} fill className="object-cover" />
                  </div>
                  <h4 className="text-slate-900 font-semibold text-sm line-clamp-2 mb-2">{deal.name}</h4>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-red-500">{deal.after}</span>
                    <span className="text-xs text-slate-400 line-through">{deal.before}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI FEATURES SHOWCASE */}
      <section className="py-24 bg-slate-900 text-white px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Shopping reimagined with AI</h2>
            <p className="text-slate-400 text-lg">
              Our intelligent features help you find exactly what you're looking for, visualize it in your space, and make shopping effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "AI Chatbot Assistant",
                desc: "Describe what you need in natural language. Our AI will curate a personalized selection just for you.",
                cta: "Try Chat Shopping",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: Camera,
                title: "AR Room Visualizer",
                desc: "See how furniture and decor look in your actual space before you buy using your smartphone camera.",
                cta: "Open Visualizer",
                color: "from-emerald-500 to-teal-500"
              },
              {
                icon: Volume2,
                title: "Voice Shopping",
                desc: "Hands full? Just talk to PlanCart. Search, add to cart, and checkout completely hands-free.",
                cta: "Enable Voice",
                color: "from-orange-500 to-pink-500"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative group rounded-3xl p-[2px] overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-40 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative h-full bg-slate-800 rounded-[22px] p-8 flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-slate-400 flex-1 mb-8 leading-relaxed">{feature.desc}</p>
                  <button className="text-white font-medium flex items-center gap-2 group/btn">
                    {feature.cta} 
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITIONS */}
      <section className="py-12 border-t border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: "Free Shipping", subtitle: "On orders over ₹999" },
            { icon: Shield, title: "Secure Payment", subtitle: "100% protected" },
            { icon: RotateCcw, title: "Easy Returns", subtitle: "30-day return policy" },
            { icon: MessageCircle, title: "24/7 Support", subtitle: "Dedicated help desk" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 pt-20 pb-10 px-6 md:px-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link href="/" className="text-2xl font-black text-primary-600 mb-6 block">
                PlanCart<span className="text-slate-900">.</span>
              </Link>
              <p className="text-slate-500 mb-6 max-w-sm">
                The ultimate AI-powered shopping destination. Discover exactly what you need, visualize it, and buy with confidence.
              </p>
              <div className="flex gap-4">
                {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
                  <div key={social} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors cursor-pointer text-slate-400">
                    <span className="text-xs font-semibold">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Shop</h4>
              <ul className="space-y-4">
                {["Electronics", "Furniture", "Fashion", "Beauty", "Deals", "New Arrivals"].map(link => (
                  <li key={link}><Link href="#" className="text-slate-500 hover:text-primary-600 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Careers", "Press", "Sustainability", "Affiliates", "Store Locator"].map(link => (
                  <li key={link}><Link href="#" className="text-slate-500 hover:text-primary-600 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Customer Service</h4>
              <ul className="space-y-4">
                {["Contact Us", "FAQ", "Track Order", "Returns & Exchanges", "Shipping Info", "Terms of Service"].map(link => (
                  <li key={link}><Link href="#" className="text-slate-500 hover:text-primary-600 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} PlanCart Inc. All rights reserved.
            </p>
            <div className="flex gap-2">
              {['Visa', 'Mastercard', 'Amex', 'PayPal', 'UPI'].map(method => (
                <div key={method} className="h-8 px-3 bg-white border border-slate-200 rounded flex items-center justify-center text-xs font-medium text-slate-500">
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
