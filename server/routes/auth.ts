import express, { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models'
import { verifyTurnstileToken } from '../utils/turnstile'
import { authenticate } from '../middleware/auth'

const router = express.Router()
const JWT_SECRET =
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const SALT_ROUNDS = 10

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            email,
            password,
            first_name,
            last_name,
            username,
            phone,
            date_of_birth,
            turnstileToken,
        } = req.body

        const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
        if (!isTurnstileValid) {
            res.status(400).json({
                error: 'Invalid verification token. Please try again.',
            })
            return
        }

        if (!email || !password || !first_name || !last_name || !username) {
            res.status(400).json({ error: 'Missing required fields' })
            return
        }

        const existingUser = await User.findOne({
            where: {
                email,
            },
        })

        const existingUsername = await User.findOne({
            where: {
                username,
            },
        })

        if (existingUser || existingUsername) {
            res.status(400).json({
                error: 'Unable to create account with the provided information',
            })
            return
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

        const user = await User.create({
            email,
            password_hash,
            first_name,
            last_name,
            username,
            phone: phone || null,
            date_of_birth: date_of_birth || null,
            role: 'customer',
            is_verified: false,
            is_active: true,
            balance: 0,
        })

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        // Return user data (excluding password_hash)
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                phone: user.phone,
                date_of_birth: user.date_of_birth,
                avatar_url: user.avatar_url,
                role: user.role,
                balance: user.balance,
                is_verified: user.is_verified,
                is_active: user.is_active,
            },
        })
    } catch (error) {
        console.error('Error during signup:', error)
        res.status(500).json({ error: 'Failed to create user' })
    }
})

// Login route
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, turnstileToken } = req.body

        const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
        if (!isTurnstileValid) {
            res.status(400).json({
                error: 'Invalid verification token. Please try again.',
            })
            return
        }

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' })
            return
        }

        const user = await User.findOne({
            where: {
                email,
            },
        })

        const dummyHash =
            '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTU' // bcrypt format
        const passwordToCheck = user ? user.password_hash : dummyHash
        const isPasswordValid = await bcrypt.compare(password, passwordToCheck)

        if (!user || !isPasswordValid || !user.is_active) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        await user.update({
            last_login: new Date(),
        })

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                phone: user.phone,
                date_of_birth: user.date_of_birth,
                avatar_url: user.avatar_url,
                role: user.role,
                balance: user.balance,
                is_verified: user.is_verified,
                is_active: user.is_active,
                last_login: user.last_login,
            },
        })
    } catch (error) {
        console.error('Error during login:', error)
        res.status(500).json({ error: 'Failed to login' })
    }
})

router.get('/verify', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' })
            return
        }

        const token = authHeader.substring(7)

        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: number
            email: string
            role: string
        }

        const user = await User.findByPk(decoded.id)

        if (!user || !user.is_active) {
            res.status(401).json({ error: 'Invalid token' })
            return
        }

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                phone: user.phone,
                date_of_birth: user.date_of_birth,
                avatar_url: user.avatar_url,
                role: user.role,
                balance: user.balance,
                is_verified: user.is_verified,
                is_active: user.is_active,
            },
        })
    } catch (error) {
        console.error('Error verifying token:', error)
        res.status(401).json({ error: 'Invalid token' })
    }
})

// Update password - requires authentication
router.put(
    '/update-password',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { currentPassword, newPassword } = req.body
            const userId = req.user!.id

            // Validate input
            if (!currentPassword || !newPassword) {
                res.status(400).json({
                    error: 'Current password and new password are required',
                })
                return
            }

            // Password strength validation
            if (newPassword.length < 8) {
                res.status(400).json({
                    error: 'New password must be at least 8 characters long',
                })
                return
            }

            // Get user with password
            const user = await User.findByPk(userId)

            if (!user || !user.is_active) {
                res.status(404).json({ error: 'User not found' })
                return
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(
                currentPassword,
                user.password_hash
            )

            if (!isCurrentPasswordValid) {
                res.status(401).json({ error: 'Current password is incorrect' })
                return
            }

            // Check if new password is same as current
            const isSamePassword = await bcrypt.compare(
                newPassword,
                user.password_hash
            )

            if (isSamePassword) {
                res.status(400).json({
                    error: 'New password must be different from current password',
                })
                return
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)

            // Update password
            await user.update({
                password_hash: newPasswordHash,
            })

            res.status(200).json({
                message: 'Password updated successfully',
            })
        } catch (error) {
            console.error('Error updating password:', error)
            res.status(500).json({ error: 'Failed to update password' })
        }
    }
)

export default router
