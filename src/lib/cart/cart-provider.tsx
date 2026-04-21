'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { CART_STORAGE_KEY, MAX_QTY_PER_LINE } from './constants';
import {
  addOrIncrementLine,
  clearLines,
  deserializeCartLines,
  removeLine,
  serializeCartLines,
  setLineQuantity,
} from './state';
import type { CartLine, CartPayload } from './types';

type CartContext = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
  addItem: (payload: CartPayload, stock?: number) => void;
  setQuantity: (productId: string, qty: number, stock?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartCtx = createContext<CartContext | null>(null);

export function useCart(): CartContext {
  const ctx = useContext(CartCtx);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return deserializeCartLines(raw);
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLine[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, serializeCartLines(lines));
  } catch {
    // Storage unavailable (quota, private mode, blocked); cart stays in-memory.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrated = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStorage());

    setIsHydrated(true);
    hydrated.current = true;

    function onStorage(e: StorageEvent) {
      if (e.key === CART_STORAGE_KEY && e.newValue !== null) {
        setLines(deserializeCartLines(e.newValue));
      } else if (e.key === CART_STORAGE_KEY && e.newValue === null) {
        setLines([]);
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    writeStorage(lines);
  }, [lines]);

  const addItem = useCallback((payload: CartPayload, stock?: number) => {
    setLines((prev) => addOrIncrementLine(prev, payload, stock));
  }, []);

  const setQuantity = useCallback(
    (productId: string, qty: number, stock?: number) => {
      setLines((prev) => setLineQuantity(prev, productId, qty, stock));
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => removeLine(prev, productId));
  }, []);

  const clearCart = useCallback(() => {
    setLines(clearLines());
  }, []);

  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  return (
    <CartCtx.Provider
      value={{
        lines,
        itemCount,
        subtotal,
        isHydrated,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export const MAX_LINE_QTY = MAX_QTY_PER_LINE;
