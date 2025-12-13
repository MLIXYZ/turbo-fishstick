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

    // TODO
    PROFILE: '/profile',
    ORDERS: '/orders',
    ORDER_DETAIL: (id: string | number) => `/orders/${id}`,

    //  TODO
    CART: '/cart',
    CHECKOUT: '/checkout',
    VALIDATE: '/checkout/validate-card',

    // TODO
    ADMIN: '/admin',
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_USERS: '/admin/users',
    ADMIN_DISCOUNT_CODES: '/admin/discount-codes',
} as const

export default ROUTES
