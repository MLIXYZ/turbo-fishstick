import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models'

const JWT_SECRET =
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

// Middleware to verify JWT token and attach user info to request

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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
            role: 'customer' | 'admin'
        }

        const user = await User.findByPk(decoded.id)

        if (!user || !user.is_active) {
            res.status(401).json({ error: 'Invalid token or inactive user' })
            return
        }

        // Attach user info to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role as 'customer' | 'admin',
        }

        next()
    } catch (error) {
        console.error('Authentication error:', error)
        res.status(401).json({ error: 'Invalid or expired token' })
    }
}

// iddleware to check if user is admin
// Use after authenticate middleware

export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' })
        return
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' })
        return
    }

    next()
}

/**
 * Middleware to check if user owns the resource
 *
 * @param userIdField - The field name in req.params that contains the user ID (default: 'userId')
 *
 * // Protect a route where :userId must match logged-in user
 * router.get('/users/:userId/orders', authenticate, requireOwner('userId'), getOrders)
 *
 * // Protect a route where :id must match logged-in user
 * router.put('/profile/:id', authenticate, requireOwner('id'), updateProfile)
 */
export const requireOwner = (userIdField: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' })
            return
        }

        const resourceUserId = parseInt(req.params[userIdField])

        if (isNaN(resourceUserId)) {
            res.status(400).json({ error: 'Invalid user ID' })
            return
        }

        if (req.user.id !== resourceUserId) {
            res.status(403).json({
                error: 'Access denied.',
            })
            return
        }

        next()
    }
}

/**
 * Middleware to check if user is the owner of the resource OR is an admin
 * Use after authenticate middleware
 *
 * @param userIdField - The field name in req.params that contains the user ID (default: 'userId')
 *
 * @example
 * // Allow users to access their own data OR admins to access any data
 * router.get('/users/:userId/orders', authenticate, requireOwnerOrAdmin('userId'), getOrders)
 */
export const requireOwnerOrAdmin = (userIdField: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' })
            return
        }

        const resourceUserId = parseInt(req.params[userIdField])

        if (isNaN(resourceUserId)) {
            res.status(400).json({ error: 'Invalid user ID' })
            return
        }

        // Allow if user is admin OR if user is the owner of the resource
        if (req.user.role === 'admin' || req.user.id === resourceUserId) {
            next()
        } else {
            res.status(403).json({
                error: 'Access denied. You can only access your own resources.',
            })
        }
    }
}

/**
 * Optional authentication - attaches user info if token is provided but doesn't fail if not, Useful for routes that behave differently for authenticated vs unauthenticated users
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next()
        return
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number
        email: string
        role: 'customer' | 'admin'
    }

    const user = await User.findByPk(decoded.id)

    if (user && user.is_active) {
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role as 'customer' | 'admin',
        }
    }

    next()
}
