import React, { createContext, useContext, useState, ReactNode } from "react";

interface Artwork {
  artwork_id: number | string;
  title: string;
  price: string;
  main_image: string;
  technique: string;
  quantity?: number; // Added quantity
}

interface CartContextType {
  cart: Artwork[];
  addToCart: (item: Artwork) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number; // Defined as a function now
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Artwork[]>([]);

  const addToCart = (item: Artwork) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.artwork_id === item.artwork_id);
      if (existing) {
        return prev.map((i) =>
          i.artwork_id === item.artwork_id
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number | string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.artwork_id === id ? { ...item, quantity: qty } : item,
      ),
    );
  };

  const removeFromCart = (id: number | string) => {
    setCart((prev) => prev.filter((item) => item.artwork_id !== id));
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      return sum + parseFloat(item.price) * (item.quantity || 1);
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
