import type { CartItem } from '../services/cart'

const CART_KEY = 'shopping_cart_v1'

export function getCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(CART_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function notifyCartChanged() {
    window.dispatchEvent(new CustomEvent('cart-updated'))
}

export function addToCart(product: {
    id: number
    title: string
    price: number
    image_url?: string
}) {
    const cart = getCart()

    const existing = cart.find((item) => item.productId === product.id)

    if (existing) {
        existing.quantity += 1
    } else {
        cart.push({
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
            image_url: product.image_url,
        })
    }

    setCart(cart)
    notifyCartChanged()
    return cart
}

export function setCart(cart: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    notifyCartChanged()
}

export function updateQuantity(productId: number, newQty: number) {
    const cart = getCart().map((item) =>
        item.productId === productId
            ? { ...item, quantity: Math.max(newQty, 1) }
            : item
    )

    setCart(cart)
    return cart
}

export function removeFromCart(productId: number) {
    const cart = getCart().filter((item) => item.productId !== productId)
    setCart(cart)
    return cart
}

export function clearCart() {
    setCart([])
}
