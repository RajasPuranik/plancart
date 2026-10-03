'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Volume2, Loader2, ShoppingBag } from 'lucide-react';
import { useUIStore, useVoiceStore, useCartStore } from '@/store';
import { useVoiceAssistant } from '@/hooks/use-voice';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export function VoiceOverlay() {
  const { isVoiceActive, stopVoice } = useUIStore();
  const { voiceState, transcript, interimTranscript, botResponse, isSupported, errorMessage } = useVoiceStore();
  const { startListening, stopListening, abort, currentProducts } = useVoiceAssistant();
  const { addItem } = useCartStore();

  if (!isVoiceActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-between p-6 sm:p-12 overflow-y-auto"
      >
        {/* Header */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">Voice Assistant</span>
          </div>
          <button 
            onClick={() => { abort(); stopVoice(); }}
            className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-8 h-8 text-gray-700" />
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center gap-8 my-8">
          
          {!isSupported ? (
            <div className="text-center text-red-600 p-6 bg-red-50 rounded-3xl">
              <h2 className="text-2xl font-bold mb-2">Voice Not Supported</h2>
              <p className="text-lg">Your browser does not support voice recognition. Please try a modern browser like Chrome.</p>
            </div>
          ) : (
            <>
              {/* Bot Response / Thinking State */}
              <div className="text-center w-full min-h-[120px] flex items-center justify-center">
                {voiceState === 'thinking' ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-2xl font-medium text-gray-500">Thinking...</p>
                  </div>
                ) : botResponse ? (
                  <p className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {botResponse}
                  </p>
                ) : (
                  <p className="text-3xl md:text-5xl font-bold text-gray-400 leading-tight">
                    Namaste! Press the button below to start.
                  </p>
                )}
              </div>

              {/* Product Display (if AI found something) */}
              {currentProducts.length > 0 && voiceState !== 'thinking' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-2xl bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-center"
                >
                  <div className="relative w-48 h-48 bg-white rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                    {currentProducts[0].images?.[0] ? (
                      <Image src={currentProducts[0].images[0].url} alt="Product" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-12 h-12 text-gray-300"/></div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{currentProducts[0].name}</h3>
                    <div className="text-4xl font-black text-indigo-600 mb-6">{formatPrice(currentProducts[0].price)}</div>
                    <button 
                      onClick={() => {
                        addItem({
                          productId: currentProducts[0].id,
                          variantId: null,
                          name: currentProducts[0].name,
                          price: currentProducts[0].price,
                          mrp: currentProducts[0].mrp,
                          maxStock: currentProducts[0].stock,
                          image: currentProducts[0].images?.[0]?.url || '',
                          variantName: null
                        });
                        abort(); stopVoice();
                      }}
                      className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700"
                    >
                      Buy This
                    </button>
                  </div>
                </motion.div>
              )}

              {/* User Transcript */}
              <div className="h-20 flex items-center justify-center text-center">
                {(transcript || interimTranscript) && (
                  <p className="text-2xl text-gray-600 font-medium">
                    &quot;{interimTranscript || transcript}&quot;
                  </p>
                )}
                {errorMessage && (
                  <p className="text-xl text-red-500 font-medium">{errorMessage}</p>
                )}
              </div>
            </>
          )}

        </div>

        {/* Big Microphone Button */}
        <div className="w-full max-w-4xl flex justify-center pb-8 relative">
          <button
            onClick={() => {
              if (voiceState === 'listening') stopListening();
              else startListening();
            }}
            disabled={!isSupported}
            className={`relative flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300 transform ${
              voiceState === 'listening' 
                ? 'bg-red-500 scale-110 shadow-red-500/50' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-600/30'
            }`}
          >
            {/* Pulsing ring animation when listening */}
            {voiceState === 'listening' && (
              <>
                <span className="absolute w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" style={{ animationDuration: '2s' }}></span>
                <span className="absolute w-full h-full rounded-full bg-red-300 opacity-50 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></span>
              </>
            )}
            
            {voiceState === 'listening' ? (
              <div className="flex gap-2 z-10">
                <span className="w-2.5 h-10 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2.5 h-14 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2.5 h-10 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            ) : (
              <Mic className="w-14 h-14 text-white z-10" />
            )}
          </button>
          
          <div className="absolute -bottom-4 text-gray-400 font-medium text-lg">
            {voiceState === 'listening' ? 'Listening... Tap to stop' : 'Tap to speak'}
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
