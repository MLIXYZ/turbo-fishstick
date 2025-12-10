import { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Typography,
    useTheme,
    useMediaQuery,
    Button,
    IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useNavigate } from 'react-router-dom'
import ROUTES from '../config/routes'
import axios from 'axios'
import { useAuthStore } from '../store/authStore.ts'

const API_URL = 'http://localhost:3000/api'

interface CartItem {
    productId: number
    title: string
    price: number
    quantity: number
    image_url?: string
}

function getCart(): CartItem[] {
    try {
        const raw = localStorage.getItem('shopping_cart_v1')
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function updateQuantity(productId: number, newQty: number) {
    const cart = getCart().map((item) =>
        item.productId === productId
            ? { ...item, quantity: Math.max(newQty, 1) }
            : item
    )
    localStorage.setItem('shopping_cart_v1', JSON.stringify(cart))
    return cart
}

function Cart() {
    const theme = useTheme()
    useMediaQuery(theme.breakpoints.down('md'))
    const navigate = useNavigate()

    //Checks if user is logged in
    const user = useAuthStore((state) => state.user)
    const isLoggedIn = !!user

    const [stockMap, setStockMap] = useState<Record<number, number | null>>({})
    const [stockLoading, setStockLoading] = useState(true)
    const [cartItems, setCartItems] = useState<CartItem[]>(() => getCart())

    useEffect(() => {
        async function fetchStock() {
            if (cartItems.length === 0) {
                setStockLoading(false)
                return
            }

            const nextStockMap: Record<number, number | null> = {}

            for (const item of cartItems) {
                try {
                    const res = await axios.get(
                        `${API_URL}/products/${item.productId}`
                    )
                    nextStockMap[item.productId] =
                        typeof res.data.stock === 'number'
                            ? res.data.stock
                            : null
                } catch {
                    nextStockMap[item.productId] = null
                }
            }

            setStockMap(nextStockMap)
            setStockLoading(false)
        }

        fetchStock()
    }, [cartItems])

    const handleChangeQuantity = (productId: number, change: number) => {
        const currentQty =
            cartItems.find((i) => i.productId === productId)?.quantity || 1
        const newQty = currentQty + change

        if (newQty < 1) return

        if (
            stockMap[productId] != null &&
            newQty > (stockMap[productId] as number)
        ) {
            return
        }

        const updated = updateQuantity(productId, newQty)
        setCartItems(updated)
    }

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    )

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                minHeight: 'calc(100vh - 64px)',
                marginLeft: 0,
                display: 'flex',
            }}
        >
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <Typography variant="h4" fontWeight="bold">
                        Shopping Cart
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {cartItems.length === 0
                            ? 'Your cart is empty.'
                            : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`}
                    </Typography>
                </Box>

                {cartItems.length === 0 ? (
                    <Typography variant="body1" color="text.secondary">
                        Add items from the store to see them here.
                    </Typography>
                ) : (
                    <>
                        {cartItems.map((item) => (
                            <Box
                                key={item.productId}
                                sx={{
                                    mb: 2,
                                    pb: 2,
                                    borderBottom: '1px solid #eee',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        flexShrink: 0,
                                        minWidth: 90,
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleChangeQuantity(
                                                item.productId,
                                                -1
                                            )
                                        }
                                    >
                                        <RemoveIcon fontSize="small" />
                                    </IconButton>

                                    <Typography variant="body1">
                                        {item.quantity}
                                    </Typography>

                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleChangeQuantity(
                                                item.productId,
                                                1
                                            )
                                        }
                                        disabled={
                                            stockMap[item.productId] != null &&
                                            item.quantity >=
                                                (stockMap[
                                                    item.productId
                                                ] as number)
                                        }
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle1">
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        ${item.price.toFixed(2)} ×{' '}
                                        {item.quantity}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {stockLoading
                                            ? 'Checking stock...'
                                            : stockMap[item.productId] == null
                                              ? 'Stock unavailable'
                                              : `Current stock: ${stockMap[item.productId]}`}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        minWidth: 80,
                                        textAlign: 'right',
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        $
                                        {(item.price * item.quantity).toFixed(
                                            2
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}

                        <Typography variant="h6" sx={{ mt: 3 }}>
                            Subtotal: ${subtotal.toFixed(2)}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(ROUTES.CHECKOUT)}
                            >
                                {isLoggedIn
                                    ? 'Proceed to Checkout'
                                    : 'Checkout as Guest'}
                            </Button>
                        </Box>
                    </>
                )}
            </Container>
        </Box>
    )
}

export default Cart
