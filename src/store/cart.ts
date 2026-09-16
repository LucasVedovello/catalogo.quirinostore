import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem } from "@/types";

export type NewCartItem = Omit<CartItem, "id" | "quantidade">;

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** true depois que o estado persistido foi lido do localStorage. */
  hydrated: boolean;

  addItem: (item: NewCartItem, quantidade?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantidade: number) => void;
  clear: () => void;

  open: () => void;
  close: () => void;
  toggle: () => void;

  totalItems: () => number;
  totalValue: () => number;
  setHydrated: (value: boolean) => void;
}

export const makeCartItemId = (productId: string, variantId: string) =>
  `${productId}:${variantId}`;

const clampQty = (qty: number, estoque: number) =>
  Math.max(1, Math.min(Math.max(1, estoque), Math.floor(qty)));

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,

      addItem: (item, quantidade = 1) =>
        set((state) => {
          const id = makeCartItemId(item.productId, item.variantId);
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id
                  ? { ...i, ...item, quantidade: clampQty(i.quantidade + quantidade, item.estoque) }
                  : i,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, id, quantidade: clampQty(quantidade, item.estoque) }],
          };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantidade) =>
        set((state) => {
          if (quantidade <= 0) return { items: state.items.filter((i) => i.id !== id) };
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantidade: clampQty(quantidade, i.estoque) } : i,
            ),
          };
        }),

      clear: () => set({ items: [] }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantidade, 0),
      totalValue: () => get().items.reduce((acc, i) => acc + i.quantidade * i.preco, 0),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "quirino-store-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Evita mismatch de hidratação: o carrinho é lido do localStorage só no cliente (CartHydration).
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

/** Seletores prontos (retornam primitivos → sem re-render desnecessário). */
export const selectTotalItems = (s: CartState) => s.items.reduce((a, i) => a + i.quantidade, 0);
export const selectTotalValue = (s: CartState) =>
  s.items.reduce((a, i) => a + i.quantidade * i.preco, 0);
