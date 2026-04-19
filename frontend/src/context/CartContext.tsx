import { createContext, useState, ReactNode, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {

  // 🔥 USER STATE (IMPORTANT)
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [cart, setCart] = useState<CartItem[]>([]);

  // 🔄 WATCH USER CHANGE (LOGIN / LOGOUT)
 // 🔥 RELOAD USER WHEN COMPONENT RE-RENDERS
useEffect(() => {
  const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
  setUser(updatedUser);
}, []);

  // 🔥 LOAD CART WHEN USER CHANGES
  useEffect(() => {
    const key = user?.email ? `cart_${user.email}` : "cart_guest";

    const savedCart = localStorage.getItem(key);
    setCart(savedCart ? JSON.parse(savedCart) : []);

  }, [user]);

  // 🔥 SAVE CART
  useEffect(() => {
    const key = user?.email ? `cart_${user.email}` : "cart_guest";
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user]);

  // ➕ ADD
  const addToCart = (product: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, product];
    });
  };

  // ❌ REMOVE
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // 🧹 CLEAR
  const clearCart = () => {
    const key = user?.email ? `cart_${user.email}` : "cart_guest";
    localStorage.removeItem(key);
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};