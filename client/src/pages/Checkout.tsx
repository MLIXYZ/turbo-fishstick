import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Paper,
    Divider,
    TextField,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = 'http://localhost:3000/api';
import ROUTES from '../config/routes';

interface CheckoutProps {
    searchQuery: string;
    mobileDrawerOpen: boolean;
    onDrawerClose: () => void;
}

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

function Checkout({
                      searchQuery: _searchQuery,
                      mobileDrawerOpen: _mobileDrawerOpen,
                      onDrawerClose: _onDrawerClose,
                  }: CheckoutProps) {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
    const [billingName, setBillingName] = useState('');
    const [billingEmail, setBillingEmail] = useState('');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [placingOrder, setPlacingOrder] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setCartItems(getCart());
    }, []);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const tax = +(subtotal * 0.1).toFixed(2); // 10% just as an example
    const total = +(subtotal + tax).toFixed(2);

    const handlePlaceOrder = async () => {
        if (!billingName || !billingEmail) {
            alert('Please enter your name and email.');
            return;
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
                        Payment Details (placeholder)
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
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Expiry"
                                    placeholder="MM/YY"
                                    margin="normal"
                                    fullWidth
                                />
                                <TextField
                                    label="CVV"
                                    placeholder="123"
                                    margin="normal"
                                    fullWidth
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
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                will add qr code later
                            </Typography>
                        </Box>
                    )}
                </Paper>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Payment Method (placeholder)
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
                                Tax (placeholder 10%): ${tax.toFixed(2)}
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
