import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '../services/productService'
import { useAuthStore } from './authStore'

// 购物车商品接口
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

// 用户购物车映射接口
interface UserCartMap {
  [userId: string]: CartItem[]
}

// 购物车状态接口
interface CartState {
  userCarts: UserCartMap
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
  syncCart: (userId?: string | null) => void
}

// 创建购物车状态存储
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      userCarts: {},
      items: [],
      
      // 同步购物车与当前用户
      syncCart: (userId) => set((state) => {
        // 如果没有传入用户ID，尝试从authStore获取
        if (!userId) {
          const authState = useAuthStore.getState();
          userId = authState.user?.id;
        }
        
        // 如果有用户ID，使用该用户的购物车
        if (userId) {
          const userCart = state.userCarts[userId] || [];
          return { items: userCart };
        }
        
        // 如果没有用户ID（未登录），使用空购物车
        return { items: [] };
      }),
      
      addItem: (product, quantity = 1) => set((state) => {
        // 获取当前用户ID
        const userId = useAuthStore.getState().user?.id;
        const currentItems = [...state.items];
        const existingItem = currentItems.find(item => item.id === product.id);
        
        let newItems;
        if (existingItem) {
          newItems = currentItems.map(item => 
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...currentItems, {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity
          }];
        }
        
        // 如果有用户ID，更新该用户的购物车
        if (userId) {
          return {
            items: newItems,
            userCarts: {
              ...state.userCarts,
              [userId]: newItems
            }
          };
        }
        
        // 未登录状态，只更新临时购物车
        return { items: newItems };
      }),
      
      removeItem: (id) => set((state) => {
        // 获取当前用户ID
        const userId = useAuthStore.getState().user?.id;
        const newItems = state.items.filter(item => item.id !== id);
        
        // 如果有用户ID，更新该用户的购物车
        if (userId) {
          return {
            items: newItems,
            userCarts: {
              ...state.userCarts,
              [userId]: newItems
            }
          };
        }
        
        // 未登录状态，只更新临时购物车
        return { items: newItems };
      }),
      
      updateQuantity: (id, quantity) => set((state) => {
        // 获取当前用户ID
        const userId = useAuthStore.getState().user?.id;
        const newItems = state.items.map(item => 
          item.id === id
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        );
        
        // 如果有用户ID，更新该用户的购物车
        if (userId) {
          return {
            items: newItems,
            userCarts: {
              ...state.userCarts,
              [userId]: newItems
            }
          };
        }
        
        // 未登录状态，只更新临时购物车
        return { items: newItems };
      }),
      
      clearCart: () => set((state) => {
        // 获取当前用户ID
        const userId = useAuthStore.getState().user?.id;
        
        // 如果有用户ID，清空该用户的购物车
        if (userId) {
          return {
            items: [],
            userCarts: {
              ...state.userCarts,
              [userId]: []
            }
          };
        }
        
        // 未登录状态，只清空临时购物车
        return { items: [] };
      }),
      
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      totalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage'
    }
  )
) 