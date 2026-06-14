import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customizations?: Array<{ name: string; value: string; additionalPrice: number }>;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemTotal: (item: CartItem) => number;
} | null>(null);

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const itemPrice = item.price + (item.customizations?.reduce((sum, c) => sum + c.additionalPrice, 0) || 0);
    return total + (itemPrice * item.quantity);
  }, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;

  switch (action.type) {
    case 'LOAD_CART':
      return action.payload;

    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        const items = state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        newState = { items, total: calculateTotal(items) };
      } else {
        const items = [...state.items, { ...action.payload, quantity: 1 }];
        newState = { items, total: calculateTotal(items) };
      }
      break;
    }

    case 'REMOVE_ITEM': {
      const items = state.items.filter(item => item.id !== action.payload);
      newState = { items, total: calculateTotal(items) };
      break;
    }

    case 'UPDATE_QUANTITY': {
      const items = state.items.map(item =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      ).filter(item => item.quantity > 0);
      newState = { items, total: calculateTotal(items) };
      break;
    }

    case 'CLEAR_CART':
      newState = { items: [], total: 0 };
      break;

    default:
      return state;
  }

  // Persist to localStorage
  try { localStorage.setItem('cart', JSON.stringify(newState)); } catch (e) {}
  return newState;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.items?.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: parsed });
        }
      }
    } catch (e) {}
  }, []);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });
  };

  const removeFromCart = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const getItemTotal = (item: CartItem): number => {
    const itemPrice = item.price + (item.customizations?.reduce((sum, c) => sum + c.additionalPrice, 0) || 0);
    return itemPrice * item.quantity;
  };

  return (
    <CartContext.Provider value={{ state, dispatch, addToCart, removeFromCart, updateQuantity, clearCart, getItemTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
