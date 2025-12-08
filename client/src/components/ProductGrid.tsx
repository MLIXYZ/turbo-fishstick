import {
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    CardActions,
    Button,
    Box,
    Chip,
    Snackbar
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import {type JSX, useState} from 'react';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    image_url?: string;
    platform?: string;
}

interface ProductGridProps {
    products: Product[];
}

const placeholderColors = [
    '#667eea',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#30cfd0',
    '#a8edea',
    '#ff9a56'
];

function ProductGrid({ products }: ProductGridProps): JSX.Element {
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    if (products.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                    No products found
                </Typography>
            </Box>
        );
    }

    const handleAddToCart = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const raw = localStorage.getItem('shopping_cart_v1');
        let cart: any[] = [];

        try {
            cart = raw ? JSON.parse(raw) : [];
        } catch {
            cart = [];
        }

        const existing = cart.find((item) => item.productId === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                title: product.title,
                price: product.price,
                quantity: 1,
                image_url: product.image_url
            });
        }

        localStorage.setItem('shopping_cart_v1', JSON.stringify(cart));

        console.log('Added to cart:', product.title);
        setSnackbarOpen(true);


    };

    return (
        <>
            <Grid container spacing={3}>
                {products.map((product, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                        <Card
                            elevation={2}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    height: 180,
                                    bgcolor: product.image_url
                                        ? 'grey.200'
                                        : placeholderColors[index % placeholderColors.length],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {product.image_url ? (
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={product.image_url}
                                        alt={product.title}
                                    />
                                ) : (
                                    <Typography variant="h2" color="white" sx={{ opacity: 0.5 }}>
                                        🎮
                                    </Typography>
                                )}
                            </Box>

                            <CardContent
                                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                            >
                                <Typography
                                    variant="h6"
                                    component="div"
                                    gutterBottom
                                    noWrap
                                >
                                    {product.title}
                                </Typography>

                                {product.platform && (
                                    <Box sx={{ mb: 1 }}>
                                        <Chip
                                            label={product.platform}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>
                                )}

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        mb: 2
                                    }}
                                >
                                    {product.description}
                                </Typography>

                                <Box sx={{ mt: 'auto' }}>
                                    <Typography
                                        variant="h5"
                                        color="primary"
                                        fontWeight="bold"
                                    >
                                        ${product.price.toFixed(2)}
                                    </Typography>
                                </Box>
                            </CardContent>

                            <CardActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    startIcon={<FontAwesomeIcon icon={faCartPlus} />}
                                    onClick={() => handleAddToCart(product.id)}
                                >
                                    Add to Cart
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message="Added to cart"
            />
        </>
    );
}

export default ProductGrid;