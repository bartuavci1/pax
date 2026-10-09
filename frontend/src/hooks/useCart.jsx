import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext(null);
const API = 'http://localhost:8000/api';

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [itemCount, setItemCount] = useState(0);

  const getToken = () => {
  return localStorage.getItem('token');
  };

  const fetchCart = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await axios.get(`${API}/cart/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data;

      // 🔥 SAFE FORMAT FIX
      const items = data.items || data || [];
      const total = data.total || 0;

      setCart({ items, total });

      // 🔥 SAFE COUNT FIX
      const count = Array.isArray(items)
        ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0;

      setItemCount(count);

    } catch (err) {
      console.log("Cart fetch error:", err);
      setCart({ items: [], total: 0 });
      setItemCount(0);
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener('userLogin', fetchCart);
    return () => window.removeEventListener('userLogin', fetchCart);
  }, []);

const addToCart = async (productId, quantity = 1) => {
  const token = getToken();

  console.log("TOKEN CHECK:", token); // 🔥

  if (!token) {
    console.log("NO TOKEN - USER NOT LOGGED IN");
    return;
  }

  await axios.post(`${API}/cart/add`,
    { product_id: productId, quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  await fetchCart();
};

  const removeFromCart = async (itemId) => {
    const token = getToken();

    await axios.delete(`${API}/cart/remove/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    await fetchCart();
  };

  const updateQuantity = async (itemId, quantity) => {
    const token = getToken();

    await axios.put(
      `${API}/cart/update/${itemId}?quantity=${quantity}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await fetchCart();
  };

  return (
    <CartContext.Provider value={{
      cart,
      itemCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}