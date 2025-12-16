import { Model, Optional } from 'sequelize'

// Category
export interface CategoryAttributes {
    id: number
    name: string
    description: string | null
    created_at: Date
    updated_at: Date
}

export type CategoryCreationAttributes = Optional<
    CategoryAttributes,
    'id' | 'description' | 'created_at' | 'updated_at'
>

export interface CategoryInstance
    extends
        Model<CategoryAttributes, CategoryCreationAttributes>,
        CategoryAttributes {}

// Product
export interface ProductAttributes {
    id: number
    title: string
    description: string | null
    price: number
    category_id: number | null
    platform: string | null
    image_url: string | null
    stock: number
    is_active: boolean
    created_at: Date
    updated_at: Date
}

export type ProductCreationAttributes = Optional<
    ProductAttributes,
    | 'id'
    | 'description'
    | 'category_id'
    | 'platform'
    | 'image_url'
    | 'stock'
    | 'is_active'
    | 'created_at'
    | 'updated_at'
>

export interface ProductInstance
    extends
        Model<ProductAttributes, ProductCreationAttributes>,
        ProductAttributes {
    category?: CategoryInstance
}

export interface UserAttributes {
    id: number
    email: string
    password_hash: string
    first_name: string
    last_name: string
    username: string
    phone: string | null
    date_of_birth: string | null
    avatar_url: string | null
    is_verified: boolean
    is_active: boolean
    role: 'customer' | 'admin'
    balance: number
    last_login: Date | null
    created_at: Date
    updated_at: Date
}

export type UserCreationAttributes = Optional<
    UserAttributes,
    | 'id'
    | 'phone'
    | 'date_of_birth'
    | 'avatar_url'
    | 'is_verified'
    | 'is_active'
    | 'role'
    | 'balance'
    | 'last_login'
    | 'created_at'
    | 'updated_at'
>

export interface UserInstance
    extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export interface OrderAttributes {
    id: number
    user_id: number
    order_number: string
    status: 'pending' | 'completed' | 'failed' | 'cancelled'
    subtotal: number
    tax: number
    discount: number
    discount_code: string | null
    total: number
    payment_method: string | null
    payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
    billing_email: string
    billing_name: string
    shipping_address: string | null
    tracking_number: string | null
    ip_address: string | null
    user_agent: string | null
    notes: string | null
    completed_at: Date | null
    created_at: Date
    updated_at: Date
}

export type OrderCreationAttributes = Optional<
    OrderAttributes,
    | 'id'
    | 'status'
    | 'tax'
    | 'discount'
    | 'discount_code'
    | 'payment_method'
    | 'payment_status'
    | 'shipping_address'
    | 'tracking_number'
    | 'ip_address'
    | 'user_agent'
    | 'notes'
    | 'completed_at'
    | 'created_at'
    | 'updated_at'
>

export interface OrderInstance
    extends Model<OrderAttributes, OrderCreationAttributes>, OrderAttributes {
    user?: UserInstance
    items?: OrderItemInstance[]
}

export interface TransactionAttributes {
    id: number
    user_id: number
    order_id: number | null
    transaction_id: string
    type: 'payment' | 'refund' | 'deposit' | 'withdrawal'
    amount: number
    currency: string
    status: 'pending' | 'success' | 'failed' | 'cancelled'
    payment_method: string | null
    payment_gateway: string | null
    gateway_response: string | null
    description: string | null
    metadata: Record<string, unknown> | null
    created_at: Date
    updated_at: Date
}

export type TransactionCreationAttributes = Optional<
    TransactionAttributes,
    | 'id'
    | 'order_id'
    | 'currency'
    | 'status'
    | 'payment_method'
    | 'payment_gateway'
    | 'gateway_response'
    | 'description'
    | 'metadata'
    | 'created_at'
    | 'updated_at'
>

export interface TransactionInstance
    extends
        Model<TransactionAttributes, TransactionCreationAttributes>,
        TransactionAttributes {
    user?: UserInstance
    order?: OrderInstance
}

export interface DiscountCodeLogAttributes {
    id: number
    code: string
    created_at: Date
    by: number | null
    status: 'active' | 'used' | 'expired' | 'disabled'
    used_on: Date | null
    order_number: string | null
    percent_off: number
}

export type DiscountCodeLogCreationAttributes = Optional<
    DiscountCodeLogAttributes,
    'id' | 'created_at' | 'by' | 'status' | 'used_on' | 'order_number'
>

export interface DiscountCodeLogInstance
    extends
        Model<DiscountCodeLogAttributes, DiscountCodeLogCreationAttributes>,
        DiscountCodeLogAttributes {
    creator?: UserInstance
}

export interface StockKeyAttributes {
    id: number
    product_id: number
    game_key: string
    status: 'available' | 'sold' | 'reserved'
    order_id: number | null
    order_number: string | null
    created_at: Date
    assigned_at: Date | null
    notes: string | null
}

export type StockKeyCreationAttributes = Optional<
    StockKeyAttributes,
    'id' | 'order_id' | 'order_number' | 'created_at' | 'assigned_at' | 'notes'
>

export interface StockKeyInstance
    extends
        Model<StockKeyAttributes, StockKeyCreationAttributes>,
        StockKeyAttributes {
    product?: ProductInstance
    order?: OrderInstance
}

export interface OrderItemAttributes {
    id: number
    order_id: number
    product_id: number
    quantity: number
    price: number
    subtotal: number
    created_at: Date
}

export type OrderItemCreationAttributes = Optional<
    OrderItemAttributes,
    'id' | 'created_at'
>

export interface OrderItemInstance
    extends
        Model<OrderItemAttributes, OrderItemCreationAttributes>,
        OrderItemAttributes {
    product?: ProductInstance
    order?: OrderInstance
}
