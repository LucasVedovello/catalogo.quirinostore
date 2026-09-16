"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Lê o carrinho do localStorage só no cliente (persist com skipHydration). */
export function CartHydration() {
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);
  return null;
}
