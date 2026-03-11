import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('saga_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('saga_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            if (prev.find(i => i.id === product.id)) return prev;
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
    const clearCart = () => setCartItems([]);
    const getTotal = () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const isInCart = (id) => cartItems.some(i => i.id === id);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getTotal, isInCart, count: cartItems.length }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
