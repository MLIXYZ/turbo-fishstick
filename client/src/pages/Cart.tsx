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
import type { CartItem } from '../services/cart'
import { getCart, updateQuantity, removeFromCart } from '../utils/cart'
const API_URL = import.meta.env.VITE_API_URL

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
        const fetchStock = async () => {
            if (cartItems.length === 0) {
                setStockMap({})
                setStockLoading(false)
                return
            }

            setStockLoading(true)

            // Get unique product IDs in case there are duplicates
            const productIds = [...new Set(cartItems.map((item) => item.productId))]

            try {
                // Fire all requests in parallel
                const responses = await Promise.all(
                    productIds.map((id) =>
                        axios.get(`${API_URL}/products/${id}`)
                    )
                )

                const nextStockMap: Record<number, number | null> = {}

                responses.forEach((res, index) => {
                    const id = productIds[index]
                    const stock = res.data?.stock
                    nextStockMap[id] =
                        typeof stock === 'number' ? stock : null
                })

                setStockMap(nextStockMap)
            } catch (err) {
                console.error('Error fetching stock:', err)

                // If one fails, mark all as unknown (or keep previous map if you prefer)
                const fallback: Record<number, number | null> = {}
                for (const id of productIds) {
                    fallback[id] = null
                }
                setStockMap(fallback)
            } finally {
                setStockLoading(false)
            }
        }

        fetchStock()
    }, [cartItems])

    const handleChangeQuantity = (productId: number, change: number) => {
        const currentQty =
            cartItems.find((i) => i.productId === productId)?.quantity || 1
        const newQty = currentQty + change

        if (newQty <= 0) {
            const updated = removeFromCart(productId)
            setCartItems(updated)
            return
        }

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
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'stretch', sm: 'center' },
                                    gap: 2,
                                    width: '100%',
                                }}
                            >

                                {item.image_url && (
                                    <Box
                                        component="img"
                                        src={item.image_url}
                                        alt={item.title}
                                        sx={{
                                            width: { xs: '100%', sm: 180 },
                                            height: { xs: 150, sm: 90 },
                                            objectFit: 'cover',
                                            borderRadius: 1,
                                            flexShrink: 0,
                                            order: { xs: 0, sm: 0 },
                                        }}
                                    />
                                )}

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        flexShrink: 0,
                                        minWidth: { xs: '100%', sm: 90 },
                                        width: { xs: '100%', sm: 'auto' },
                                        justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                                        order: { xs: 3, sm: 1 },       // 👈 bottom on mobile, left on desktop
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
                                        minWidth: { xs: '100%', sm: 80 },
                                        textAlign: { xs: 'left', sm: 'right' },
                                        order: { xs: 2, sm: 3 },
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
