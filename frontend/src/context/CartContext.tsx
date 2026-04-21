import { createContext, useState, ReactNode, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight: number;
  addedAt: number; // 🔥 NEW
}

interface CartContextType {
  cart: CartItem[];
  user: any;
  updateUser: (user: any) => void;
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [cart, setCart] = useState<CartItem[]>([]);

  const updateUser = (newUser: any) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      if (newUser.token) {
        localStorage.setItem("token", newUser.token);
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    setUser(newUser);
  };

  // 🔥 LOAD CART
  useEffect(() => {
    const key = user?.email ? `cart_${user.email}` : "cart_guest";
    const savedCart = localStorage.getItem(key);

    let parsedCart = savedCart ? JSON.parse(savedCart) : [];

    // 🔥 REMOVE EXPIRED ITEMS
    const now = Date.now();
    parsedCart = parsedCart.filter((item: CartItem) => {
      return now - item.addedAt < 24 * 60 * 60 * 1000;
    });

    setCart(parsedCart);

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

      return [
        ...prev,
        {
          ...product,
          addedAt: Date.now(), // 🔥 TIME SAVED
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    const key = user?.email ? `cart_${user.email}` : "cart_guest";
    localStorage.removeItem(key);
    setCart([]);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        user,
        updateUser,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};