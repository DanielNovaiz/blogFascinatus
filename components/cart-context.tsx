'use client';

import { createContext, ReactNode, useEffect, useReducer, useState } from 'react';

const CART_STORAGE_KEY = 'blogFascinatus_cart';

export interface CartItem {
  productId: string;
  qty: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
}

type Action =
  | { type: 'ADD_ITEM'; payload: { productId: string; qty: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QTY'; payload: { productId: string; qty: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_FROM_STORAGE'; payload: CartItem[] };

export const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((item) => item.productId === action.payload.productId);
      if (existing) {
        return state.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, qty: item.qty + action.payload.qty }
            : item
        );
      }
      return [...state, { productId: action.payload.productId, qty: action.payload.qty }];
    }

    case 'REMOVE_ITEM':
      return state.filter((item) => item.productId !== action.payload.productId);

    case 'UPDATE_QTY':
      return state
        .map((item) =>
          item.productId === action.payload.productId
            ? { ...item, qty: action.payload.qty }
            : item
        )
        .filter((item) => item.qty > 0);

    case 'CLEAR_CART':
      return [];

    case 'LOAD_FROM_STORAGE':
      return action.payload;

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsed });
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (productId: string, qty: number) => {
    if (qty > 0) {
      dispatch({ type: 'ADD_ITEM', payload: { productId, qty } });
    }
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty > 0) {
      dispatch({ type: 'UPDATE_QTY', payload: { productId, qty } });
      return;
    }

    removeItem(productId);
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = items.reduce((total, item) => total + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}