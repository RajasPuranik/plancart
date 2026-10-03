'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useVoiceStore, useUIStore, useCartStore } from '@/store';
import toast from 'react-hot-toast';
import { type ChatMessage, type ProductListItem } from '@/types';

// Type definitions for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

export function useVoiceAssistant() {
  const {
    voiceState,
    setVoiceState,
    setTranscript,
    setInterimTranscript,
    setBotResponse,
    setIsSupported,
    setError,
    language
  } = useVoiceStore();

  const { isVoiceActive, stopVoice } = useUIStore();
  const { addItem } = useCartStore();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceMessagesRef = useRef<ChatMessage[]>([
    {
      id: 'voice-welcome',
      role: 'assistant',
      content: 'Namaste! Press the big button and tell me what you want to buy.',
      createdAt: new Date().toISOString(),
    }
  ]);
  const [currentProducts, setCurrentProducts] = useState<ProductListItem[]>([]);

  // Initialize Speech APIs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
      } else {
        setIsSupported(false);
        setError('Speech recognition is not supported in this browser.');
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }
  }, [setIsSupported, setError]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) return;
    
    // Stop any ongoing speech
    synthRef.current.cancel();

    setVoiceState('speaking');
    setBotResponse(text);

    // Remove markdown asterisks for speech
    const cleanText = text.replace(/\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language;
    utterance.rate = 0.95; // Slightly slower for better comprehension
    
    // Try to find a female Indian English voice if using en-IN
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes(language) && v.name.includes('Female')) 
                        || voices.find(v => v.lang.includes(language));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setVoiceState('idle');
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setVoiceState('idle');
    };

    synthRef.current.speak(utterance);
  }, [language, setVoiceState, setBotResponse]);

  const handleUserUtterance = useCallback(async (text: string) => {
    setVoiceState('thinking');
    
    const lowerText = text.toLowerCase();
    
    if ((lowerText.includes('buy this') || lowerText.includes('add to cart')) && currentProducts.length > 0) {
      const p = currentProducts[0];
      addItem({
        productId: p.id,
        variantId: null,
        name: p.name,
        image: p.images?.[0]?.url || '',
        price: p.price,
        mrp: p.mrp,
        maxStock: p.stock,
        variantName: null,
      });
      speak(`I have added ${p.name} to your cart. Say 'checkout' when you are ready, or keep shopping.`);
      return;
    }

    if (lowerText.includes('checkout') || lowerText.includes('close')) {
      speak("Okay, I'll close the voice assistant now.");
      setTimeout(() => {
        stopVoice();
      }, 2000);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    voiceMessagesRef.current.push(userMessage);

    try {
      const modifiedMessages = [...voiceMessagesRef.current];
      modifiedMessages[modifiedMessages.length - 1].content = 
        modifiedMessages[modifiedMessages.length - 1].content + 
        " (System note: Respond in 1-2 very short sentences suitable for text-to-speech. Do not use markdown bullet points.)";

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: modifiedMessages, language }),
      });

      if (!response.ok) throw new Error('API Error');
      if (!response.body) throw new Error('No stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                
                if (data.type === 'text') {
                  fullResponse += data.text;
                } else if (data.type === 'tool_result' && data.products && data.products.length > 0) {
                  setCurrentProducts(data.products);
                }
              } catch (e) {
                // Ignore
              }
            }
          }
        }
      }

      voiceMessagesRef.current.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: fullResponse,
        createdAt: new Date().toISOString(),
      });

      speak(fullResponse);

    } catch (error) {
      console.error(error);
      speak('Sorry, I am having trouble connecting right now. Please try again.');
    }
  }, [currentProducts, addItem, speak, language, stopVoice, setVoiceState]);

  // Handle Speech Recognition Events
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }
      
      if (final) {
        setTranscript(final);
        setInterimTranscript('');
        handleUserUtterance(final);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        setVoiceState('idle');
      } else if (event.error !== 'aborted') {
        setError(`Error listening: ${event.error}`);
        setVoiceState('error');
      }
    };

    recognition.onend = () => {
      if (useVoiceStore.getState().voiceState === 'listening') {
        setVoiceState('idle');
      }
    };
  }, [handleUserUtterance, setError, setInterimTranscript, setTranscript, setVoiceState]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    try {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setVoiceState('listening');
    } catch (e) {
      console.warn(e);
    }
  }, [language, setVoiceState, setTranscript, setInterimTranscript, setError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceState('idle');
    }
  }, [setVoiceState]);

  const abort = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.abort();
    if (synthRef.current) synthRef.current.cancel();
    setVoiceState('idle');
  }, [setVoiceState]);

  useEffect(() => {
    if (isVoiceActive) {
      setTimeout(() => {
        speak('Namaste! Press the big button and tell me what you want to buy.');
      }, 500);
    } else {
      abort();
    }
  }, [isVoiceActive, speak, abort]);

  return {
    startListening,
    stopListening,
    abort,
    speak,
    currentProducts
  };
}
