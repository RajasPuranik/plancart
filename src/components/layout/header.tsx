'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingCart, Heart, User, Mic, Menu, X, ChevronDown, Globe, 
  Package, Headphones, Home, Grid, Plus 
} from 'lucide-react';
import { useCartStore, useUIStore } from '@/store';

const CATEGORIES = [
  'All', 'Furniture', 'Home Decor', 'Lighting', 'Appliances', 
  'Electronics', 'Fashion', 'Kitchen', 'Bedding & Bath'
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const toggleVoice = useUIStore((state) => state.toggleVoice);
  const openCart = useCartStore((state) => state.openCart);
  const cartItemCount = useCartStore((state) => state.items?.reduce((acc, item) => acc + item.quantity, 0) || 0);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`w-full sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
        {/* Top Bar - Desktop Only */}
        <div className="hidden md:flex items-center justify-between px-6 py-1.5 bg-slate-900 text-white text-xs font-medium">
          <div className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition-colors">
            <Globe className="w-3.5 h-3.5" />
            <span>🇬🇧 English</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          
          <div className="flex-1 text-center truncate px-4">
            Free delivery on orders above ₹999 | Easy 30-day returns
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/app" className="hover:text-slate-300 transition-colors">Download App</Link>
            <Link href="/sell" className="hover:text-slate-300 transition-colors">Sell on PlanCart</Link>
          </div>
        </div>

        {/* Main Nav */}
        <div className="px-4 md:px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-bold text-xl md:text-2xl tracking-tight text-slate-900">PlanCart</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-3xl items-center bg-gray-50 border border-gray-200 rounded-full focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all relative">
            <div className="flex items-center gap-1 pl-4 pr-3 py-2 border-r border-gray-200 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
              <span className="whitespace-nowrap">All Categories</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search for products, brands and more..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400"
            />
            <button className="p-2.5 mr-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            {/* Autocomplete suggestion skeleton placeholder */}
            <div className="hidden absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-2 p-4 z-50">
               {/* Content goes here */}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            {/* Mic Button - Pulse animation */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVoice}
              className="relative p-2.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors hidden sm:flex"
            >
              <Mic className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            </motion.button>

            {/* Mobile Search Toggle */}
            <button className="md:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-full">
              <Search className="w-5 h-5" />
            </button>

            {/* Account */}
            <div className="hidden sm:flex items-center gap-2 cursor-pointer p-2 rounded-full hover:bg-gray-50 text-gray-700 transition-colors">
              <User className="w-5 h-5" />
              <span className="text-sm font-medium hidden lg:block">Login</span>
            </div>

            {/* Wishlist */}
            <div className="relative p-2 text-gray-600 hover:text-rose-500 hover:bg-gray-50 rounded-full cursor-pointer transition-colors hidden sm:block">
              <Heart className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                3
              </span>
            </div>

            {/* Cart */}
            <button 
              onClick={openCart}
              className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-indigo-600 text-white text-[10px] md:text-xs font-bold flex items-center justify-center rounded-full border border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Nav - Desktop */}
        <div className="hidden md:flex items-center px-6 py-2 gap-6 overflow-x-auto scrollbar-hide border-b border-gray-100 text-sm font-medium text-gray-600 bg-white">
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative whitespace-nowrap px-1 py-1 transition-colors ${activeCategory === category ? 'text-indigo-600' : 'hover:text-indigo-600'}`}
            >
              {category}
              {activeCategory === category && (
                <motion.div 
                  layoutId="activeCategory"
                  className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-3 px-2 z-40 pb-safe">
        <MobileNavItem icon={<Home className="w-5 h-5" />} label="Home" active />
        <MobileNavItem icon={<Grid className="w-5 h-5" />} label="Categories" />
        {/* Mobile Mic CTA */}
        <div className="relative -top-6">
          <button 
            onClick={toggleVoice}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 border-4 border-white"
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>
        <MobileNavItem icon={<ShoppingCart className="w-5 h-5" />} label="Cart" badge={cartItemCount} onClick={openCart} />
        <MobileNavItem icon={<User className="w-5 h-5" />} label="Account" />
      </div>
    </>
  );
}

function MobileNavItem({ icon, label, active, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: number, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 min-w-14 ${active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
      <div className="relative">
        {icon}
        {badge ? (
          <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
