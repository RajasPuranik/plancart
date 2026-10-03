'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { X, Upload, Camera, Sparkles, RefreshCw, Download, Share2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store';
import Image from 'next/image';

interface RoomVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    stock: number;
    image: string;
    details: string;
  };
}

export function RoomVisualizer({ isOpen, onClose, product }: RoomVisualizerProps) {
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { addItem } = useCartStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image is too large. Please upload an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setRoomImage(e.target?.result as string);
        setGeneratedImage(null); // Reset generated on new upload
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
  });

  const handleGenerate = async () => {
    if (!roomImage) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomImageBase64: roomImage,
          productImageUrl: product.image,
          productDetails: product.details,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.generatedImageUrl);
      if (data.isSimulated) {
        toast('Using product image as fallback (Nano Banana API key not set)', { icon: 'ℹ️' });
      } else {
        toast.success('Successfully visualized in your room!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate visualization. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addItem({
        productId: product.id,
        variantId: null,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        maxStock: product.stock,
        image: product.image,
        variantName: null,
      });
      toast.success(`${product.name} added to cart`);
      onClose();
    } else {
      toast.error('Product is out of stock');
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `plancart-${product.name.replace(/\s+/g, '-').toLowerCase()}-room.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:h-[650px] bg-white rounded-3xl z-[101] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-gray-100 z-10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Left Panel - Image Area */}
            <div className="flex-1 bg-gray-50 relative flex flex-col min-h-[300px] md:min-h-0">
              {!roomImage ? (
                <div 
                  {...getRootProps()} 
                  className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed m-8 rounded-2xl transition-colors cursor-pointer
                    ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-100'}`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Camera className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Upload your room photo</h3>
                  <p className="text-gray-500 text-center text-sm max-w-[250px]">
                    Drag and drop a photo here, or click to select a file from your device.
                  </p>
                </div>
              ) : !generatedImage ? (
                <div className="flex-1 relative">
                  <Image src={roomImage} alt="Your Room" fill className="object-cover" unoptimized />
                  
                  {isGenerating && (
                    <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-white border-r-white rounded-full animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 animate-pulse text-indigo-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Visualizing...</h3>
                      <p className="text-indigo-200 text-sm">Our AI is placing the product perfectly in your room.</p>
                      
                      {/* Animated scanning line */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                        className="absolute left-0 right-0 h-1 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] z-10"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 relative group">
                  <ReactCompareSlider
                    className="w-full h-full"
                    itemOne={<ReactCompareSliderImage src={roomImage} alt="Before" />}
                    itemTwo={<ReactCompareSliderImage src={generatedImage} alt="After" />}
                  />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">Original Room</span>
                    <span className="bg-indigo-600/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> With Product
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-2 rounded-full backdrop-blur-md pointer-events-none">
                    Drag slider to compare
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Controls */}
            <div className="w-full md:w-[350px] p-6 md:p-8 flex flex-col bg-white overflow-y-auto">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Nano Banana AI</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">See it in your room</h2>
                <p className="text-gray-500 mt-2 text-sm">
                  Upload a photo of your space and our AI will realistically place the <strong className="text-gray-700">{product.name}</strong> exactly where it belongs.
                </p>
              </div>

              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-8">
                <div className="w-16 h-16 relative bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h4>
                  <div className="text-indigo-600 font-bold mt-1">₹{product.price.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                {roomImage && !isGenerating && !generatedImage && (
                  <button 
                    onClick={handleGenerate}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Preview
                  </button>
                )}

                {generatedImage && (
                  <>
                    <button 
                      onClick={handleAddToCart}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                      </button>
                      <button 
                        onClick={downloadImage}
                        className="py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Save Image
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        setRoomImage(null);
                        setGeneratedImage(null);
                      }}
                      className="w-full py-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium mt-2"
                    >
                      Try another room photo
                    </button>
                  </>
                )}

                {!roomImage && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <h4 className="text-amber-800 font-semibold text-sm mb-1">Tips for best results:</h4>
                    <ul className="text-amber-700 text-xs space-y-1 list-disc pl-4">
                      <li>Ensure good lighting in the room</li>
                      <li>Clear the space where the product will go</li>
                      <li>Take the photo straight-on, not angled</li>
                    </ul>
                  </div>
                )}
                
                {generatedImage && (
                  <p className="text-[10px] text-gray-400 text-center mt-4">
                    AI-generated preview. Actual product scale and appearance may vary slightly.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
