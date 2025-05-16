<<<<<<< HEAD
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '../services/productService'

// 购物车商品接口
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

// 购物车状态接口
interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

// 创建购物车状态存储
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => set((state) => {
        const existingItem = state.items.find(item => item.id === product.id)
        
        if (existingItem) {
          return {
            items: state.items.map(item => 
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
        } else {
          return {
            items: [...state.items, {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity
            }]
          }
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.id === id
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      totalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
=======
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '../services/productService'

// 购物车商品接口
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

// 购物车状态接口
interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

// 创建购物车状态存储
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => set((state) => {
        const existingItem = state.items.find(item => item.id === product.id)
        
        if (existingItem) {
          return {
            items: state.items.map(item => 
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
        } else {
          return {
            items: [...state.items, {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity
            }]
          }
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.id === id
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      totalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
>>>>>>> master
) 