
import express, { Request, Response } from 'express'
import { Review, User } from '../models'
import axios from 'axios'

const router = express.Router()

// Verify Turnstile token
async function verifyTurnstile(token: string): Promise<boolean> {
    try {
        const secretKey = process.env.TURNSTILE_SECRET_KEY
        if (!secretKey) {
            console.error('TURNSTILE_SECRET_KEY not configured')
            return false
        }

        const response = await axios.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                secret: secretKey,
                response: token,
            }
        )

        return response.data.success === true
    } catch (error) {
        console.error('Error verifying Turnstile token:', error)
        return false
    }
}

// GET /api/products/:productId/reviews - Get all approved reviews for a product
router.get('/:productId/reviews', async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params

        const reviews = await Review.findAll({
            where: {
                product_id: productId,
                is_approved: true,
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'first_name', 'last_name'],
                },
            ],
            order: [['created_at', 'DESC']],
        })

        // Format the response to include reviewer name
        const formattedReviews = reviews.map((review) => {
            const reviewData = review.toJSON() as any
            let displayName = reviewData.reviewer_name || 'Anonymous'

            // If there's a user, use their name instead
            if (reviewData.user) {
                displayName = reviewData.user.username ||
                    `${reviewData.user.first_name} ${reviewData.user.last_name}`
            }

            return {
                id: reviewData.id,
                rating: reviewData.rating,
                title: reviewData.title,
                comment: reviewData.comment,
                reviewer_name: displayName,
                is_verified: reviewData.is_verified,
                helpful_count: reviewData.helpful_count,
                created_at: reviewData.created_at,
            }
        })

        res.json(formattedReviews)
    } catch (error) {
        console.error('Error fetching reviews:', error)
        res.status(500).json({ error: 'Failed to fetch reviews' })
    }
})

// POST /api/products/:productId/reviews - Create a new review
router.post('/:productId/reviews', async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params
        const {
            rating,
            title,
            comment,
            reviewer_name,
            reviewer_email,
            turnstile_token,
        } = req.body

        // Validate required fields
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Valid rating (1-5) is required' })
            return
        }

        if (!turnstile_token) {
            res.status(400).json({ error: 'Security verification failed' })
            return
        }

        // Verify Turnstile token
        const isValidToken = await verifyTurnstile(turnstile_token)
        if (!isValidToken) {
            res.status(400).json({ error: 'Security verification failed' })
            return
        }

        // Get IP address and user agent for spam prevention
        const ip_address = req.ip || req.headers['x-forwarded-for'] as string || null
        const user_agent = req.headers['user-agent'] || null

        // Create the review
        const review = await Review.create({
            product_id: parseInt(productId),
            rating,
            title: title || null,
            comment: comment || null,
            reviewer_name: reviewer_name || 'Anonymous',
            reviewer_email: reviewer_email || null,
            turnstile_token,
            ip_address,
            user_agent,
            is_approved: true, // Auto-approve, but can be moderated later
            is_verified: false,
        })

        res.status(201).json({
            id: review.id,
            message: 'Review submitted successfully',
        })
    } catch (error) {
        console.error('Error creating review:', error)
        res.status(500).json({ error: 'Failed to create review' })
    }
})

// GET /api/products/:productId/reviews/stats - Get review statistics for a product
router.get('/:productId/reviews/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params

        const reviews = await Review.findAll({
            where: {
                product_id: productId,
                is_approved: true,
            },
            attributes: ['rating'],
        })

        const totalReviews = reviews.length
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0

        // Calculate rating distribution
        const ratingDistribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
        }

        res.json({
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
        })
    } catch (error) {
        console.error('Error fetching review stats:', error)
        res.status(500).json({ error: 'Failed to fetch review stats' })
    }
})

export default router
