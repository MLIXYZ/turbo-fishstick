import { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Paper,
    TextField,
    Alert,
    AlertTitle,
    Snackbar,
    CircularProgress,
} from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import ROUTES from '../config/routes'
import { useAuthStore } from '../store/authStore.ts'
const API_URL = import.meta.env.VITE_API_URL
import type { CartItem } from '../services/cart'
import { getCart, clearCart } from '../utils/cart'
import { useDebounce } from '../hooks/useDebounce'

interface FieldErrors {
    billingName?: string
    billingEmail?: string
    billingZip?: string
    cardNumber?: string
    expiry?: string
    cvv?: string
}

interface TouchedFields {
    billingName?: boolean
    billingEmail?: boolean
    billingZip?: boolean
    cardNumber?: boolean
    expiry?: boolean
    cvv?: boolean
}

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

    const [errors, setErrors] = useState<FieldErrors>({})
    const [touched, setTouched] = useState<TouchedFields>({})
    const [checkoutError, setCheckoutError] = useState<string | null>(null)
    const [orderSuccess, setOrderSuccess] = useState(false)
    const [orderNumber, setOrderNumber] = useState<string | null>(null)

    const [taxRate, setTaxRate] = useState<number | null>(null)
    const [taxLoading, setTaxLoading] = useState(false)
    const [taxError, setTaxError] = useState<string | null>(null)

    const [discountCode, setDiscountCode] = useState('')
    const [discountPercent, setDiscountPercent] = useState<number | null>(null)
    const [discountError, setDiscountError] = useState<string | null>(null)
    const [discountLoading, setDiscountLoading] = useState(false)
    const [discountApplied, setDiscountApplied] = useState(false)

    const navigate = useNavigate()

    const user = useAuthStore((state) => state.user)
    const debouncedZip = useDebounce(billingZip, 500)

    useEffect(() => {
        setCartItems(getCart())
    }, [])

    // Scroll to top when there's an error or success
    useEffect(() => {
        if (checkoutError || orderSuccess) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [checkoutError, orderSuccess])

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

    const discount = discountPercent
        ? +(subtotal * (discountPercent / 100)).toFixed(2)
        : 0
    const afterDiscount = subtotal - discount
    const effectiveTaxRate = taxRate ?? 0
    const tax = +(afterDiscount * effectiveTaxRate).toFixed(2)
    const total = +(afterDiscount + tax).toFixed(2)

    useEffect(() => {
        if (!debouncedZip || subtotal <= 0) {
            setTaxRate(null)
            setTaxError(null)
            setTaxLoading(false)
            return
        }

        if (!/^\d{5}$/.test(debouncedZip)) {
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
                    params: { zip: debouncedZip },
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
    }, [debouncedZip, subtotal])

    // Auto-format card number: add space every 4 digits
    const formatCardNumber = (value: string): string => {
        const digits = value.replace(/\D/g, '')
        const groups = digits.match(/.{1,4}/g) || []
        return groups.join(' ').substring(0, 19) // Max 16 digits + 3 spaces
    }

    // Auto-format expiry: MM/YY
    const formatExpiry = (value: string): string => {
        const digits = value.replace(/\D/g, '')
        if (digits.length >= 2) {
            return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`
        }
        return digits
    }

    // Auto-format CVV: digits only, max 4
    const formatCVV = (value: string): string => {
        return value.replace(/\D/g, '').substring(0, 4)
    }

    // Validation functions
    const validateName = (name: string): string | undefined => {
        if (!name.trim()) return 'Full name is required'
        if (name.trim().length < 2) return 'Name must be at least 2 characters'
        return undefined
    }

    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) return 'Invalid email address'
        return undefined
    }

    const validateZip = (zip: string): string | undefined => {
        if (!zip.trim()) return 'ZIP code is required'
        if (!/^\d{5}$/.test(zip)) return 'ZIP code must be 5 digits'
        return undefined
    }

    const validateCardNumber = (card: string): string | undefined => {
        const digits = card.replace(/\D/g, '')
        if (!digits) return 'Card number is required'
        if (digits.length < 13 || digits.length > 19)
            return 'Card number must be 13-19 digits'
        return undefined
    }

    const validateExpiry = (exp: string): string | undefined => {
        if (!exp.trim()) return 'Expiry date is required'
        const [mm, yy] = exp.split('/')
        const month = Number(mm)
        const year = Number(`20${yy}`)

        if (!mm || !yy) return 'Format must be MM/YY'
        if (month < 1 || month > 12) return 'Invalid month (1-12)'
        if (yy.length !== 2) return 'Year must be 2 digits'

        const now = new Date()
        const expDate = new Date(year, month, 1)
        if (expDate <= now) return 'Card is expired'

        return undefined
    }

    const validateCVV = (cvvValue: string): string | undefined => {
        const digits = cvvValue.replace(/\D/g, '')
        if (!digits) return 'CVV is required'
        if (digits.length < 3 || digits.length > 4)
            return 'CVV must be 3-4 digits'
        return undefined
    }

    // Update validation errors when fields change
    useEffect(() => {
        const newErrors: FieldErrors = {}

        if (touched.billingName) {
            const error = validateName(billingName)
            if (error) newErrors.billingName = error
        }

        if (touched.billingEmail) {
            const error = validateEmail(billingEmail)
            if (error) newErrors.billingEmail = error
        }

        if (touched.billingZip) {
            const error = validateZip(billingZip)
            if (error) newErrors.billingZip = error
        }

        if (paymentMethod === 'card') {
            if (touched.cardNumber) {
                const error = validateCardNumber(cardNumber)
                if (error) newErrors.cardNumber = error
            }

            if (touched.expiry) {
                const error = validateExpiry(expiry)
                if (error) newErrors.expiry = error
            }

            if (touched.cvv) {
                const error = validateCVV(cvv)
                if (error) newErrors.cvv = error
            }
        }

        setErrors(newErrors)
    }, [
        billingName,
        billingEmail,
        billingZip,
        cardNumber,
        expiry,
        cvv,
        touched,
        paymentMethod,
    ])

    const handleBlur = (field: keyof TouchedFields) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
    }

    const handleCardNumberChange = (value: string) => {
        const formatted = formatCardNumber(value)
        setCardNumber(formatted)
    }

    const handleExpiryChange = (value: string) => {
        const formatted = formatExpiry(value)
        setExpiry(formatted)
    }

    const handleCVVChange = (value: string) => {
        const formatted = formatCVV(value)
        setCvv(formatted)
    }

    const handleApplyDiscount = async () => {
        const code = discountCode.trim().toUpperCase()
        if (!code) {
            setDiscountError('Please enter a discount code')
            return
        }

        try {
            setDiscountLoading(true)
            setDiscountError(null)

            const res = await axios.get(
                `${API_URL}/checkout/validate-discount`,
                {
                    params: { code },
                }
            )

            if (res.data.valid) {
                setDiscountPercent(res.data.percent_off)
                setDiscountApplied(true)
                setDiscountError(null)
                setDiscountCode(res.data.code) // Use the normalized code from server
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                const errorMsg =
                    err.response.data?.error || 'Invalid discount code'
                setDiscountError(errorMsg)
            } else {
                setDiscountError('Failed to validate discount code')
            }
            setDiscountPercent(null)
            setDiscountApplied(false)
        } finally {
            setDiscountLoading(false)
        }
    }

    const handleRemoveDiscount = () => {
        setDiscountCode('')
        setDiscountPercent(null)
        setDiscountApplied(false)
        setDiscountError(null)
    }

    const handlePlaceOrder = async () => {
        // Mark all fields as touched
        setTouched({
            billingName: true,
            billingEmail: true,
            billingZip: true,
            cardNumber: paymentMethod === 'card',
            expiry: paymentMethod === 'card',
            cvv: paymentMethod === 'card',
        })

        // Validate all fields
        const validationErrors: FieldErrors = {
            billingName: validateName(billingName),
            billingEmail: validateEmail(billingEmail),
            billingZip: validateZip(billingZip),
        }

        if (paymentMethod === 'card') {
            validationErrors.cardNumber = validateCardNumber(cardNumber)
            validationErrors.expiry = validateExpiry(expiry)
            validationErrors.cvv = validateCVV(cvv)
        }

        // Filter out undefined errors
        const actualErrors = Object.fromEntries(
            Object.entries(validationErrors).filter(([, v]) => v !== undefined)
        )

        if (Object.keys(actualErrors).length > 0) {
            setErrors(actualErrors)
            setCheckoutError('Please fix the errors above before continuing.')
            return
        }

        if (cartItems.length === 0) {
            setCheckoutError('Your cart is empty.')
            return
        }

        try {
            setPlacingOrder(true)
            setCheckoutError(null)

            if (paymentMethod === 'card') {
                const [mm, yy] = expiry.split('/')
                const expMonth = Number(mm)
                const expYear = Number(`20${yy}`)

                await axios.post(`${API_URL}/validate-card`, {
                    nameOnCard: billingName,
                    cardNumber: cardNumber.replace(/\s/g, ''),
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
                discount_code: discountApplied ? discountCode : undefined,
            }

            const res = await axios.post(`${API_URL}/checkout`, payload)

            console.log('Order created:', res.data)

            clearCart()

            localStorage.setItem('shopping_cart_v1', '[]')
            setCartItems([])

            // Set success state
            setOrderSuccess(true)
            setOrderNumber(res.data.order?.order_number || null)

            // Navigate to orders page after a delay
            setTimeout(() => {
                navigate(ROUTES.ORDERS)
            }, 2000)
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 422) {
                const data = err.response.data as {
                    valid?: boolean
                    errors?: Array<{ field: string; message: string }>
                }
                const errorMessages =
                    data.errors?.map((e) => `${e.field}: ${e.message}`) || []
                setCheckoutError(
                    errorMessages.join(', ') || 'Card validation failed.'
                )
                return
            }

            console.error('Checkout failed:', err)
            setCheckoutError('Checkout failed. Please try again.')
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

                {orderSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <AlertTitle>Order Placed Successfully!</AlertTitle>
                        {orderNumber && (
                            <>
                                Your order number is <strong>{orderNumber}</strong>.
                                <br />
                            </>
                        )}
                        You will be redirected to your orders page shortly...
                    </Alert>
                )}

                {checkoutError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <AlertTitle>Checkout Error</AlertTitle>
                        {checkoutError}
                    </Alert>
                )}

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Billing Information
                    </Typography>

                    <TextField
                        label="Full Name"
                        placeholder="John Doe"
                        fullWidth
                        required
                        margin="normal"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        onBlur={() => handleBlur('billingName')}
                        error={touched.billingName && !!errors.billingName}
                        helperText={touched.billingName && errors.billingName}
                    />
                    <TextField
                        label="Email"
                        placeholder="john@example.com"
                        type="email"
                        fullWidth
                        required
                        margin="normal"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        onBlur={() => handleBlur('billingEmail')}
                        error={touched.billingEmail && !!errors.billingEmail}
                        helperText={touched.billingEmail && errors.billingEmail}
                    />
                    <TextField
                        label="ZIP / Postal Code"
                        placeholder="94111"
                        fullWidth
                        required
                        margin="normal"
                        value={billingZip}
                        onChange={(e) =>
                            setBillingZip(e.target.value.replace(/\D/g, ''))
                        }
                        onBlur={() => handleBlur('billingZip')}
                        error={touched.billingZip && !!errors.billingZip}
                        helperText={touched.billingZip && errors.billingZip}
                        inputProps={{ maxLength: 5 }}
                    />
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

                    {paymentMethod === 'card' ? (
                        <Box sx={{ mt: 1 }}>
                            <TextField
                                label="Card Number"
                                placeholder="1234 5678 9012 3456"
                                fullWidth
                                required
                                margin="normal"
                                value={cardNumber}
                                onChange={(e) =>
                                    handleCardNumberChange(e.target.value)
                                }
                                onBlur={() => handleBlur('cardNumber')}
                                error={
                                    touched.cardNumber && !!errors.cardNumber
                                }
                                helperText={
                                    touched.cardNumber && errors.cardNumber
                                }
                                inputProps={{ maxLength: 19 }}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Expiry"
                                    placeholder="MM/YY"
                                    margin="normal"
                                    required
                                    fullWidth
                                    value={expiry}
                                    onChange={(e) =>
                                        handleExpiryChange(e.target.value)
                                    }
                                    onBlur={() => handleBlur('expiry')}
                                    error={touched.expiry && !!errors.expiry}
                                    helperText={touched.expiry && errors.expiry}
                                    inputProps={{ maxLength: 5 }}
                                />
                                <TextField
                                    label="CVV"
                                    placeholder="123"
                                    margin="normal"
                                    required
                                    fullWidth
                                    value={cvv}
                                    onChange={(e) =>
                                        handleCVVChange(e.target.value)
                                    }
                                    onBlur={() => handleBlur('cvv')}
                                    error={touched.cvv && !!errors.cvv}
                                    helperText={touched.cvv && errors.cvv}
                                    inputProps={{ maxLength: 4 }}
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

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Order Summary
                    </Typography>

                    {cartItems.length === 0 ? (
                        <Alert severity="info">
                            <AlertTitle>Cart is Empty</AlertTitle>
                            Your cart is empty. Please add items to your cart
                            before checking out.
                            <Button
                                variant="text"
                                onClick={() => navigate(ROUTES.HOME)}
                                sx={{ mt: 1 }}
                            >
                                Continue Shopping
                            </Button>
                        </Alert>
                    ) : (
                        <>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Subtotal: ${subtotal.toFixed(2)}
                            </Typography>

                            {/* Discount Code Section */}
                            <Box sx={{ my: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Discount Code
                                </Typography>
                                {!discountApplied ? (
                                    <>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                placeholder="Enter code"
                                                value={discountCode}
                                                onChange={(e) =>
                                                    setDiscountCode(
                                                        e.target.value.toUpperCase()
                                                    )
                                                }
                                                error={!!discountError}
                                                disabled={discountLoading}
                                                sx={{ flexGrow: 1 }}
                                            />
                                            <Button
                                                variant="outlined"
                                                onClick={handleApplyDiscount}
                                                disabled={
                                                    discountLoading ||
                                                    !discountCode
                                                }
                                            >
                                                {discountLoading
                                                    ? 'Checking...'
                                                    : 'Apply'}
                                            </Button>
                                        </Box>
                                        {discountError && (
                                            <Alert
                                                severity="error"
                                                sx={{ mt: 1 }}
                                            >
                                                {discountError}
                                            </Alert>
                                        )}
                                    </>
                                ) : (
                                    <Alert
                                        severity="success"
                                        onClose={handleRemoveDiscount}
                                        sx={{ mt: 1 }}
                                    >
                                        <AlertTitle>
                                            Discount Code Applied
                                        </AlertTitle>
                                        Code &quot;{discountCode}&quot; ({discountPercent}
                                        % off)
                                    </Alert>
                                )}
                            </Box>

                            {discountApplied && discount > 0 && (
                                <Typography
                                    variant="body2"
                                    sx={{ mb: 0.5, color: 'success.main' }}
                                >
                                    Discount ({discountPercent}% off): -$
                                    {discount.toFixed(2)}
                                </Typography>
                            )}

                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                {taxLoading
                                    ? 'Tax: calculating from ZIP...'
                                    : taxRate === null
                                      ? 'Tax: will be calculated at checkout based on ZIP'
                                      : `Tax (${(taxRate * 100).toFixed(2)}%): $${tax.toFixed(2)}`}
                            </Typography>

                            {taxError && (
                                <Alert severity="warning" sx={{ my: 1 }}>
                                    <AlertTitle>Tax Calculation Warning</AlertTitle>
                                    {taxError}
                                </Alert>
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
                                color={orderSuccess ? 'success' : 'primary'}
                                fullWidth
                                disabled={
                                    placingOrder ||
                                    cartItems.length === 0 ||
                                    orderSuccess
                                }
                                onClick={handlePlaceOrder}
                                size="large"
                                startIcon={
                                    orderSuccess ? (
                                        <CheckCircle />
                                    ) : placingOrder ? (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                    ) : null
                                }
                            >
                                {orderSuccess
                                    ? 'Order Placed Successfully!'
                                    : placingOrder
                                      ? 'Placing Order...'
                                      : 'Place Order'}
                            </Button>
                        </>
                    )}
                </Paper>
            </Container>

            {/* Success Snackbar */}
            <Snackbar
                open={orderSuccess}
                autoHideDuration={6000}
                onClose={() => setOrderSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setOrderSuccess(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    <AlertTitle>Order Placed Successfully!</AlertTitle>
                    {orderNumber
                        ? `Order ${orderNumber} has been placed.`
                        : 'Your order has been placed.'}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default Checkout
