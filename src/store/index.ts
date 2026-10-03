import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  maxStock: number;
  variantName: string | null;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getSavings: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            const existing = newItems[existingIndex];
            const newQty = Math.min(
              existing.quantity + (item.quantity ?? 1),
              existing.maxStock
            );
            newItems[existingIndex] = { ...existing, quantity: newQty };
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              { ...item, quantity: item.quantity ?? 1 },
            ],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) =>
                  !(i.productId === productId && i.variantId === variantId)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getSavings: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.mrp - item.price) * item.quantity,
          0
        );
      },
    }),
    {
      name: "plancart-cart",
    }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIState {
  isChatOpen: boolean;
  isVoiceActive: boolean;
  isMobileMenuOpen: boolean;
  isSearchFocused: boolean;
  language: string;
  theme: "light" | "dark";
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleVoice: () => void;
  startVoice: () => void;
  stopVoice: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setSearchFocused: (focused: boolean) => void;
  setLanguage: (lang: string) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isChatOpen: false,
      isVoiceActive: false,
      isMobileMenuOpen: false,
      isSearchFocused: false,
      language: "en",
      theme: "light",

      toggleChat: () =>
        set((state) => ({ isChatOpen: !state.isChatOpen, isVoiceActive: false })),
      openChat: () => set({ isChatOpen: true }),
      closeChat: () => set({ isChatOpen: false }),
      toggleVoice: () =>
        set((state) => ({
          isVoiceActive: !state.isVoiceActive,
          isChatOpen: false,
        })),
      startVoice: () => set({ isVoiceActive: true, isChatOpen: false }),
      stopVoice: () => set({ isVoiceActive: false }),
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      setSearchFocused: (focused) => set({ isSearchFocused: focused }),
      setLanguage: (lang) => set({ language: lang }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    {
      name: "plancart-ui",
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
      }),
    }
  )
);

// ─── Voice Session Store ──────────────────────────────────────────────────────

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

interface VoiceSessionState {
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  botResponse: string;
  language: string;
  isSupported: boolean;
  errorMessage: string | null;
  setVoiceState: (state: VoiceState) => void;
  setTranscript: (text: string) => void;
  setInterimTranscript: (text: string) => void;
  setBotResponse: (text: string) => void;
  setLanguage: (lang: string) => void;
  setIsSupported: (supported: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceSessionState>()((set) => ({
  voiceState: "idle",
  transcript: "",
  interimTranscript: "",
  botResponse: "",
  language: "en-IN",
  isSupported: false,
  errorMessage: null,

  setVoiceState: (voiceState) => set({ voiceState }),
  setTranscript: (transcript) => set({ transcript }),
  setInterimTranscript: (interimTranscript) => set({ interimTranscript }),
  setBotResponse: (botResponse) => set({ botResponse }),
  setLanguage: (language) => set({ language }),
  setIsSupported: (isSupported) => set({ isSupported }),
  setError: (errorMessage) => set({ errorMessage, voiceState: "error" }),
  reset: () =>
    set({
      voiceState: "idle",
      transcript: "",
      interimTranscript: "",
      botResponse: "",
      errorMessage: null,
    }),
}));
