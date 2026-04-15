import { createContext, useState, ReactNode, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface Order {
  orderId: string;
  productName: string;
  price: string;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  placeOrder: (item: CartItem) => string;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {

  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem("orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product: CartItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);

      let updatedCart;

      if (existing) {
        updatedCart = prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...prevCart, product];
      }

      console.log("UPDATED CART:", updatedCart); // 👈 DEBUG

      return updatedCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const placeOrder = (item: CartItem) => {
    const orderId = "ORD" + Math.floor(Math.random() * 100000);

    const newOrder = {
      orderId,
      productName: item.name,
      price: item.price,
      image: item.image,
    };

    setOrders([...orders, newOrder]);

    removeFromCart(item.id);

    return orderId;
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, placeOrder }}>
      {children}
    </CartContext.Provider>
  );
};