'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, getSubtotal, getSavings } = useCartStore();

  const subtotal = getSubtotal();
  const savings = getSavings();
  const mrpTotal = subtotal + savings;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                      Looks like you haven&apos;t added anything to your cart yet.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => {
                      const itemKey = `${item.productId}-${item.variantId || 'default'}`;
                      return (
                        <motion.div
                          key={itemKey}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative group"
                        >
                          {/* Image */}
                          <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative border border-gray-50">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag className="w-8 h-8" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeItem(item.productId, item.variantId)}
                                className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {item.variantName && (
                              <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
                            )}

                            <div className="mt-auto pt-3 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                                {item.mrp > item.price && (
                                  <span className="text-[10px] text-gray-400 line-through">
                                    {formatPrice(item.mrp)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))
                                  }
                                  className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.productId, item.variantId, item.quantity + 1)
                                  }
                                  className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                                  disabled={item.quantity >= item.maxStock}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-4 md:p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal (MRP)</span>
                    <span className="font-medium text-gray-900">{formatPrice(mrpTotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount / Savings</span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-100 my-2"></div>
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors group"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
