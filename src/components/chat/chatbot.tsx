'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, ShoppingBag, Sparkles, ChevronDown } from 'lucide-react';
import { useUIStore, useCartStore } from '@/store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { ChatMessage, ProductListItem } from '@/types';
import { RoomVisualizer } from '@/components/ui/room-visualizer';
import toast from 'react-hot-toast';

export function AIChatbot() {
  const { isChatOpen, closeChat, toggleChat } = useUIStore();
  const { addItem } = useCartStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi there! 👋 I am the PlanCart AI assistant. What are you looking to buy today? I can help you find exactly what you need.',
      createdAt: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visualizerProduct, setVisualizerProduct] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleQuickReply = (text: string) => {
    setInput(text);
    // Optional: auto-send if desired
  };

  const handleAddToCart = (product: any) => {
    if (product.stock > 0) {
      addItem({
        productId: product.id,
        variantId: null,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.price,
        mrp: product.mrp,
        maxStock: product.stock,
        variantName: null,
      });
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Product is out of stock.');
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Add a placeholder assistant message that we will stream into
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
          isStreaming: true,
        }
      ]);

      let productsData: ProductListItem[] | undefined = undefined;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n\n')) !== -1) {
            const chunk = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 2);
            
            if (chunk.startsWith('data: ')) {
              try {
                const data = JSON.parse(chunk.substring(6));
                
                if (data.type === 'text') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: msg.content + data.text }
                      : msg
                  ));
                } else if (data.type === 'tool_result' && data.products && data.products.length > 0) {
                  // The AI executed a search and we got products back to display
                  productsData = data.products;
                } else if (data.type === 'tool_call' && data.toolName === 'add_to_cart') {
                  // The AI decided to add something to the cart on our behalf
                  const product = data.product;
                  const qty = data.args.quantity || 1;
                  
                  if (product) {
                    for (let i = 0; i < qty; i++) {
                       handleAddToCart(product);
                    }
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: msg.content + `Added **${product.name}** to your cart! 🛒` }
                        : msg
                    ));
                  } else {
                    toast.error(`Could not add product ${data.args.productId} to cart.`);
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: msg.content + `Sorry, I couldn't find that product to add to your cart.` }
                        : msg
                    ));
                  }
                  
                } else if (data.type === 'finish') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, isStreaming: false, products: productsData }
                      : msg
                  ));
                } else if (data.type === 'error') {
                   setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: data.text, isStreaming: false }
                      : msg
                  ));
                }
              } catch (e) {
                console.error("Error parsing stream chunk", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      setMessages(prev => prev.map(msg => 
        msg.isStreaming ? { ...msg, isStreaming: false, content: 'Sorry, I encountered an error. Please try again.' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-indigo-700 hover:shadow-indigo-500/25 transition-all"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden sm:bottom-24 sm:right-6 right-0 bottom-0 sm:w-[380px] w-full sm:h-[600px] h-[100dvh] sm:rounded-2xl rounded-none"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold leading-tight">AI Assistant</h3>
                  <p className="text-xs text-indigo-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online & ready to help
                  </p>
                </div>
              </div>
              <button 
                onClick={closeChat}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] flex flex-col gap-2`}>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-white border border-gray-100 shadow-sm rounded-bl-sm text-gray-800'
                    }`}>
                      {/* Markdown-lite formatting for the message text */}
                      <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                          .replace(/\\n/g, '<br/>')
                      }} />
                      
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
                      )}
                    </div>
                    
                    {/* Render Product Cards if the AI found products */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar mt-1 w-[280px]">
                        {msg.products.map((product) => (
                          <div key={product.id} className="min-w-[200px] w-[200px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden snap-center flex flex-col">
                            <div className="w-full h-24 bg-gray-100 relative">
                              {product.images?.[0] ? (
                                <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="200px"/>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-gray-300"/></div>
                              )}
                              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-900 shadow-sm">
                                ★ {product.rating}
                              </div>
                            </div>
                            <div className="p-3 flex flex-col flex-1">
                              <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">{product.name}</h4>
                              <div className="flex items-center gap-1.5 mt-auto">
                                <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
                                {product.mrp > product.price && (
                                  <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                                )}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Link href={`/products/${product.slug}`} onClick={closeChat} className="flex-1 text-[10px] py-1.5 border border-gray-200 text-center rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                  View
                                </Link>
                                <button 
                                  onClick={() => setVisualizerProduct(product)}
                                  className="flex-1 text-[10px] py-1.5 bg-indigo-100 text-indigo-700 text-center rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                                >
                                  Visualize
                                </button>
                                <button 
                                  onClick={() => handleAddToCart(product)}
                                  className="flex-1 text-[10px] py-1.5 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && !messages[messages.length - 1].isStreaming && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5 items-center h-4">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies (show if last message is from assistant and no active input) */}
            {messages[messages.length - 1].role === 'assistant' && !isLoading && !input && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar bg-white shrink-0 border-t border-gray-50">
                <button onClick={() => handleQuickReply('Show me sofas under ₹20,000')} className="shrink-0 text-xs px-3 py-1.5 border border-indigo-100 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors">
                  Show me sofas under ₹20k
                </button>
                <button onClick={() => handleQuickReply('Looking for a smart TV')} className="shrink-0 text-xs px-3 py-1.5 border border-indigo-100 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors">
                  Looking for a smart TV
                </button>
                <button onClick={() => handleQuickReply('Suggest some home decor')} className="shrink-0 text-xs px-3 py-1.5 border border-indigo-100 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors">
                  Suggest some home decor
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={sendMessage} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 text-[10px] text-center text-gray-400">
                AI can make mistakes. Verify important info.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {visualizerProduct && (
        <RoomVisualizer 
          isOpen={!!visualizerProduct}
          onClose={() => setVisualizerProduct(null)}
          product={{
            id: visualizerProduct.id,
            name: visualizerProduct.name,
            price: visualizerProduct.price,
            mrp: visualizerProduct.mrp,
            stock: visualizerProduct.stockCount || visualizerProduct.stock || 10,
            image: visualizerProduct.images?.[0]?.url || visualizerProduct.image || '',
            details: visualizerProduct.shortDescription || visualizerProduct.name
          }}
        />
      )}
    </>
  );
}
