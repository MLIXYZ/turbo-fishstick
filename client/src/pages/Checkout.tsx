import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Paper,
    TextField,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = 'http://localhost:3000/api';
import ROUTES from '../config/routes';
import {useAuthStore} from "../store/authStore.ts";


interface CartItem {
    productId: number;
    title: string;
    price: number;
    quantity: number;
    image_url?: string;
}

function getCart(): CartItem[] {
    try {
        const raw = localStorage.getItem('shopping_cart_v1');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function validateEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
}

function validateCardNumber(num: string) {
    return /^[0-9]{13,19}$/.test(num.replace(/\s+/g, ""));
}

function validateCVV(cvv: string) {
    return /^[0-9]{3,4}$/.test(cvv);
}

function validateExpiry(exp: string) {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
}

function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
    const [billingName, setBillingName] = useState('');
    const [billingEmail, setBillingEmail] = useState('');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);

    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        setCartItems(getCart());
    }, []);

    //prefill info if logged in
    useEffect(() => {
        if (!user) return;

        setBillingEmail((prev) => prev || user.email);

        const fullName = [user.first_name, user.last_name]
            .filter(Boolean)
            .join(' ');

        if (fullName) {
            setBillingName((prev) => prev || fullName);
        }
    }, [user]);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const tax = +(subtotal * 0.1).toFixed(2); // 10% just as an example
    const total = +(subtotal + tax).toFixed(2);

    const handlePlaceOrder = async () => {
        if (!billingName) {
            alert("Please enter your full name.");
            return;
        }

        if (!validateEmail(billingEmail)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        if (paymentMethod === "card") {
            if (!validateCardNumber(cardNumber)) {
                alert("Invalid card number.");
                return;
            }
            if (!validateExpiry(expiry)) {
                alert("Invalid expiry format (MM/YY).");
                return;
            }
            if (!validateCVV(cvv)) {
                alert("Invalid CVV.");
                return;
            }
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        try {
            setPlacingOrder(true);

            const payload = {
                cartItems,
                subtotal,
                tax,
                total,
                paymentMethod,
                billing_name: billingName,
                billing_email: billingEmail,
            };

            const res = await axios.post(`${API_URL}/checkout`, payload);

            console.log('Order created:', res.data);

            localStorage.setItem('shopping_cart_v1', '[]');
            setCartItems([]);

            alert('Order placed successfully!.');
            navigate(ROUTES.HOME);
        } catch (err) {
            console.error('Checkout failed:', err);
            alert('Checkout failed.');
        } finally {
            setPlacingOrder(false);
        }
    };

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
                            variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                            onClick={() => setPaymentMethod('card')}
                        >
                            Credit Card
                        </Button>

                        <Button
                            variant={paymentMethod === 'crypto' ? 'contained' : 'outlined'}
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
                                Tax (10%): ${tax.toFixed(2)}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                Total: ${total.toFixed(2)}
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                disabled={placingOrder || cartItems.length === 0}
                                onClick={handlePlaceOrder}
                            >
                                {placingOrder ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default Checkout;
