import { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Paper,
    TextField,
} from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import ROUTES from '../config/routes'
import { useAuthStore } from '../store/authStore.ts'
const API_URL = import.meta.env.VITE_API_URL;
import type { CartItem } from '../services/cart'
import { getCart, clearCart } from '../utils/cart'

function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>(
        'card'
    )

    const [billingZip, setBillingZip] = useState('')
    const [billingName, setBillingName] = useState('')
    const [billingEmail, setBillingEmail] = useState('')
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')
    const [placingOrder, setPlacingOrder] = useState(false)

    const [taxRate, setTaxRate] = useState<number | null>(null)
    const [taxLoading, setTaxLoading] = useState(false)
    const [taxError, setTaxError] = useState<string | null>(null)

    const navigate = useNavigate()

    const user = useAuthStore((state) => state.user)

    useEffect(() => {
        setCartItems(getCart())
    }, [])

    //prefill info if logged in
    useEffect(() => {
        if (!user) return

        setBillingEmail((prev) => prev || user.email)

        const fullName = [user.first_name, user.last_name]
            .filter(Boolean)
            .join(' ')

        if (fullName) {
            setBillingName((prev) => prev || fullName)
        }
    }, [user])

    // for UI only, CheckoutRouter.ts validates prices from DB when checking out
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    )

    const effectiveTaxRate = taxRate ?? 0
    const tax = +(subtotal * effectiveTaxRate).toFixed(2)
    const total = +(subtotal + tax).toFixed(2)

    useEffect(() => {
        if (!billingZip || subtotal <= 0) {
            setTaxRate(null)
            setTaxError(null)
            setTaxLoading(false)
            return
        }

        if (!/^\d{5}$/.test(billingZip)) {
            setTaxRate(null)
            setTaxError('Please enter a valid 5-digit ZIP code.')
            setTaxLoading(false)
            return
        }

        let cancelled = false

        const fetchTax = async () => {
            try {
                setTaxLoading(true)
                setTaxError(null)

                const res = await axios.get(`${API_URL}/checkout/tax`, {
                    params: { zip: billingZip },
                })

                if (cancelled) return

                const rate = res.data?.rate
                if (typeof rate === 'number' && rate >= 0 && rate < 1) {
                    setTaxRate(rate)
                } else {
                    setTaxRate(null)
                    setTaxError('Could not calculate tax for that ZIP.')
                }
            } catch (err) {
                console.error('Tax quote failed:', err)
                if (!cancelled) {
                    setTaxRate(null)
                    setTaxError('Could not calculate tax for that ZIP.')
                }
            } finally {
                if (!cancelled) {
                    setTaxLoading(false)
                }
            }
        }

        fetchTax()

        return () => {
            cancelled = true
        }
    }, [billingZip, subtotal])

    const handlePlaceOrder = async () => {
        if (!billingName) {
            alert('Please enter your full name.')
            return
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty.')
            return
        }

        try {
            setPlacingOrder(true)

            if (paymentMethod === 'card') {
                const [mm, yy] = expiry.split('/')
                const expMonth = Number(mm)
                const expYear = Number(`20${yy}`)

                await axios.post(`${API_URL}/validate-card
`, {
                    nameOnCard: billingName,
                    cardNumber,
                    expMonth,
                    expYear,
                    cvv,
                    billingPostalCode: billingZip,
                })
            }

            const payload = {
                cartItems,
                paymentMethod,
                billing_name: billingName,
                billing_email: billingEmail,
                billing_zip: billingZip,
            }

            const res = await axios.post(`${API_URL}/checkout`, payload)

            console.log('Order created:', res.data)

            clearCart()

            localStorage.setItem('shopping_cart_v1', '[]')
            setCartItems([])

            alert('Order placed successfully!.')
            navigate(ROUTES.HOME)

        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 422) {
                const data = err.response.data as {
                    valid?: boolean
                    errors?: Array<{ field: string; message: string }>
                }
                const msg =
                    data.errors?.map((e) => `${e.field}: ${e.message}`).join('\n') ||
                    'Card validation failed.'
                alert(msg)
                return
            }

            console.error('Checkout failed:', err)
            alert('Checkout failed.')
        } finally {
            setPlacingOrder(false)
        }
    }

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
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Checkout
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Complete your purchase below.
                    </Typography>
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Payment Details
                    </Typography>

                    <TextField
                        label="Full Name"
                        placeholder="John Doe"
                        fullWidth
                        margin="normal"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                    />
                    <TextField
                        label="Email"
                        placeholder="john@example.com"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                    />
                    <TextField
                        label="ZIP / Postal Code"
                        placeholder="94111"
                        fullWidth
                        margin="normal"
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value)}
                    />

                    {paymentMethod === 'card' ? (
                        <Box sx={{ mt: 1 }}>
                            <TextField
                                label="Card Number"
                                placeholder="1234 5678 9012 3456"
                                fullWidth
                                margin="normal"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Expiry"
                                    placeholder="MM/YY"
                                    margin="normal"
                                    fullWidth
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                />
                                <TextField
                                    label="CVV"
                                    placeholder="123"
                                    margin="normal"
                                    fullWidth
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                />
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ mt: 1 }}>
                            <TextField
                                label="Crypto Wallet Address"
                                placeholder="0x1234... (placeholder only)"
                                fullWidth
                                margin="normal"
                            />
                        </Box>
                    )}
                </Paper>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Payment Method
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{ mb: 2 }}
                    >
                        <Button
                            variant={
                                paymentMethod === 'card'
                                    ? 'contained'
                                    : 'outlined'
                            }
                            onClick={() => setPaymentMethod('card')}
                        >
                            Credit Card
                        </Button>

                        <Button
                            variant={
                                paymentMethod === 'crypto'
                                    ? 'contained'
                                    : 'outlined'
                            }
                            onClick={() => setPaymentMethod('crypto')}
                        >
                            Crypto
                        </Button>
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Order Summary
                    </Typography>

                    {cartItems.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Your cart is empty.
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Subtotal: ${subtotal.toFixed(2)}
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                {taxLoading
                                    ? 'Tax: calculating from ZIP...'
                                    : taxRate === null
                                        ? 'Tax: will be calculated at checkout based on ZIP'
                                        : `Tax (${(taxRate * 100).toFixed(
                                            2
                                        )}%): $${tax.toFixed(2)}`}
                            </Typography>

                            {taxError && (
                                <Typography
                                    variant="caption"
                                    color="error"
                                    sx={{ display: 'block', mb: 0.5 }}
                                >
                                    {taxError}
                                </Typography>
                            )}

                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ mb: 2 }}
                            >
                                Total: ${total.toFixed(2)}
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                disabled={
                                    placingOrder || cartItems.length === 0
                                }
                                onClick={handlePlaceOrder}
                            >
                                {placingOrder
                                    ? 'Placing Order...'
                                    : 'Place Order'}
                            </Button>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    )
}

export default Checkout
