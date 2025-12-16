export const ROUTES = {
    // Public routes
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',

    // Product routes
    PRODUCTS: '/products',
    PRODUCT_DETAIL: (id: string | number) => `/products/${id}`,

    // Category routes
    CATEGORY: (id: string | number) => `/category/${id}`,

    PROFILE: '/profile',
    ORDERS: '/orders',
    ORDER_DETAIL: (id: string | number) => `/orders/${id}`,

    CART: '/cart',
    CHECKOUT: '/checkout',

    ADMIN: '/admin',
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_USERS: '/admin/users',
    ADMIN_DISCOUNT_CODES: '/admin/discount-codes',
    ADMIN_INVENTORY: '/admin/inventory',
} as const

export default ROUTES
