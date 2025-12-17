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
    Snackbar,
    Modal,
    IconButton,
    TextField,
    Rating,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { type JSX, useState, useEffect } from 'react'
import { addToCart } from '../utils/cart.ts'
import axios from 'axios'
import CloudflareTurnstile from './CloudflareTurnstile'
import { useTurnstile } from '../hooks/useTurnstile'

interface Product {
    id: number
    title: string
    description: string
    price: number
    image_url?: string
    platform?: string
}

interface Review {
    id: number
    rating: number
    title: string | null
    comment: string | null
    reviewer_name: string
    is_verified: boolean
    helpful_count: number
    created_at: string
}

interface ProductGridProps {
    products: Product[]
}

const placeholderColors = [
    '#667eea',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#30cfd0',
    '#a8edea',
    '#ff9a56',
]

function ProductGrid({ products }: ProductGridProps): JSX.Element {
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loadingReviews, setLoadingReviews] = useState(false)
    const [reviewFormData, setReviewFormData] = useState({
        rating: 5,
        title: '',
        comment: '',
        reviewer_name: '',
    })
    const [submittingReview, setSubmittingReview] = useState(false)
    const [reviewError, setReviewError] = useState<string | null>(null)
    const [reviewSuccess, setReviewSuccess] = useState(false)
    const {
        token: turnstileToken,
        error: turnstileError,
        handleVerify,
        handleError,
        handleExpire,
    } = useTurnstile()

    const API_URL = import.meta.env.VITE_API_URL
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

    useEffect(() => {
        if (selectedProduct && modalOpen) {
            fetchReviews(selectedProduct.id)
        }
    }, [selectedProduct, modalOpen])

    const fetchReviews = async (productId: number) => {
        setLoadingReviews(true)
        try {
            const response = await axios.get(`${API_URL}/products/${productId}/reviews`)
            setReviews(response.data)
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setLoadingReviews(false)
        }
    }

    const handleSubmitReview = async () => {
        if (!selectedProduct || !turnstileToken) {
            setReviewError('Please complete the security check')
            return
        }

        if (reviewFormData.rating < 1 || reviewFormData.rating > 5) {
            setReviewError('Please select a rating')
            return
        }

        setSubmittingReview(true)
        setReviewError(null)

        try {
            await axios.post(`${API_URL}/products/${selectedProduct.id}/reviews`, {
                ...reviewFormData,
                turnstile_token: turnstileToken,
            })

            setReviewSuccess(true)
            setReviewFormData({
                rating: 5,
                title: '',
                comment: '',
                reviewer_name: '',
            })

            // Refresh reviews
            fetchReviews(selectedProduct.id)

            // Hide success message after 3 seconds
            setTimeout(() => setReviewSuccess(false), 3000)
        } catch (error: any) {
            setReviewError(error.response?.data?.error || 'Failed to submit review')
        } finally {
            setSubmittingReview(false)
        }
    }

    if (products.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                    No products found
                </Typography>
            </Box>
        )
    }

    const handleAddToCart = (productId: number) => {
        const product = products.find((p) => p.id === productId)
        if (!product) return

        addToCart(product)
        setSnackbarOpen(true)
    }

    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product)
        setModalOpen(true)
        setReviewSuccess(false)
        setReviewError(null)
    }

    const handleCloseModal = () => {
        setModalOpen(false)
        setSelectedProduct(null)
        setReviews([])
        setReviewFormData({
            rating: 5,
            title: '',
            comment: '',
            reviewer_name: '',
        })
        setReviewError(null)
        setReviewSuccess(false)
    }

    const handleAddToCartFromModal = () => {
        if (selectedProduct) {
            addToCart(selectedProduct)
            setSnackbarOpen(true)
        }
    }

    return (
        <>
            <Grid container spacing={3}>
                {products.map((product, index) => (
                    <Grid
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        key={product.id}
                    >
                        <Card
                            elevation={2}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                            }}
                            onClick={() => handleOpenModal(product)}
                        >
                            <Box
                                sx={{
                                    height: 180,
                                    bgcolor: product.image_url
                                        ? 'grey.200'
                                        : placeholderColors[
                                              index % placeholderColors.length
                                          ],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
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
                                    <Typography
                                        variant="h2"
                                        color="white"
                                        sx={{ opacity: 0.5 }}
                                    >
                                        🎮
                                    </Typography>
                                )}
                            </Box>

                            <CardContent
                                sx={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
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
                                        mb: 2,
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
                                    startIcon={
                                        <FontAwesomeIcon icon={faCartPlus} />
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleAddToCart(product.id)
                                    }}
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

            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        width: '90%',
                        maxWidth: 800,
                        maxHeight: '90vh',
                        overflow: 'auto',
                    }}
                >
                    {selectedProduct && (
                        <>
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    zIndex: 1,
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                        bgcolor: 'grey.200',
                                    },
                                }}
                                onClick={handleCloseModal}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </IconButton>

                            <Box
                                sx={{
                                    height: 400,
                                    bgcolor: selectedProduct.image_url
                                        ? 'grey.200'
                                        : placeholderColors[
                                              products.indexOf(selectedProduct) %
                                                  placeholderColors.length
                                          ],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '8px 8px 0 0',
                                }}
                            >
                                {selectedProduct.image_url ? (
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        image={selectedProduct.image_url}
                                        alt={selectedProduct.title}
                                    />
                                ) : (
                                    <Typography
                                        variant="h1"
                                        color="white"
                                        sx={{ opacity: 0.5, fontSize: '8rem' }}
                                    >
                                        🎮
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ p: 4 }}>
                                <Typography
                                    variant="h4"
                                    component="h2"
                                    gutterBottom
                                    fontWeight="bold"
                                >
                                    {selectedProduct.title}
                                </Typography>

                                {selectedProduct.platform && (
                                    <Box sx={{ mb: 2 }}>
                                        <Chip
                                            label={selectedProduct.platform}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>
                                )}

                                <Typography
                                    variant="h5"
                                    color="primary"
                                    fontWeight="bold"
                                    sx={{ mb: 3 }}
                                >
                                    ${selectedProduct.price.toFixed(2)}
                                </Typography>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    paragraph
                                >
                                    {selectedProduct.description}
                                </Typography>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    startIcon={
                                        <FontAwesomeIcon icon={faCartPlus} />
                                    }
                                    onClick={handleAddToCartFromModal}
                                    sx={{ mt: 2 }}
                                >
                                    Add to Cart
                                </Button>

                                <Divider sx={{ my: 4 }} />

                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    Reviews
                                </Typography>

                                {loadingReviews ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : reviews.length > 0 ? (
                                    <Box sx={{ mb: 4 }}>
                                        {reviews.map((review) => (
                                            <Box key={review.id} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #e0e0e0' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Rating value={review.rating} readOnly size="small" />
                                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                                                        {review.reviewer_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                {review.title && (
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                        {review.title}
                                                    </Typography>
                                                )}
                                                {review.comment && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {review.comment}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                        No reviews yet. Be the first to review this product!
                                    </Typography>
                                )}

                                <Divider sx={{ my: 4 }} />

                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                    Write a Review
                                </Typography>

                                {reviewSuccess && (
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        Review submitted successfully!
                                    </Alert>
                                )}

                                {reviewError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {reviewError}
                                    </Alert>
                                )}

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        Rating *
                                    </Typography>
                                    <Rating
                                        value={reviewFormData.rating}
                                        onChange={(_, newValue) => {
                                            setReviewFormData({ ...reviewFormData, rating: newValue || 5 })
                                        }}
                                        size="large"
                                    />
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Your Name"
                                    value={reviewFormData.reviewer_name}
                                    onChange={(e) => setReviewFormData({ ...reviewFormData, reviewer_name: e.target.value })}
                                    sx={{ mb: 2 }}
                                    placeholder="Anonymous"
                                />

                                <TextField
                                    fullWidth
                                    label="Review Title (Optional)"
                                    value={reviewFormData.title}
                                    onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Your Review (Optional)"
                                    value={reviewFormData.comment}
                                    onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                                    multiline
                                    rows={4}
                                    sx={{ mb: 2 }}
                                />

                                <Box sx={{ mb: 2 }}>
                                    <CloudflareTurnstile
                                        siteKey={siteKey}
                                        onVerify={handleVerify}
                                        onError={handleError}
                                        onExpire={handleExpire}
                                        theme="light"
                                    />
                                </Box>

                                {turnstileError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {turnstileError}
                                    </Alert>
                                )}

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview || !turnstileToken}
                                >
                                    {submittingReview ? <CircularProgress size={24} /> : 'Submit Review'}
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>
        </>
    )
}

export default ProductGrid
