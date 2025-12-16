import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Badge,
    Button,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faShoppingCart,
    faGamepad,
    faUser,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import UserMenu from './UserMenu'
import { useAuthStore } from '../store/authStore'
import ROUTES from '../config/routes'
import { type JSX, useEffect, useState } from 'react'
import { getCart } from '../utils/cart'

interface HeaderProps {
    onSearch: (query: string) => void
    onMenuClick?: () => void
}

function Header({ onSearch, onMenuClick }: HeaderProps): JSX.Element {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()

    const [cartCount, setCartCount] = useState(0)

    useEffect(() => {
        const updateCount = () => {
            const cart = getCart()
            const total = cart.reduce((sum, item) => sum + item.quantity, 0)
            setCartCount(total)
        }

        updateCount()
        window.addEventListener('cart-updated', updateCount)

        return () => {
            window.removeEventListener('cart-updated', updateCount)
        }
    }, [])

    const handleCartClick = () => {
        navigate(ROUTES.CART)
        console.log('Cart clicked')
    }

    const handleLoginClick = () => {
        navigate(ROUTES.LOGIN)
    }

    const handleLogoClick = () => {
        navigate(ROUTES.HOME)
    }

    return (
        <AppBar position="sticky" color="primary">
            <Toolbar>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 2,
                    }}
                >
                    {/* Left Side - Logo/Menu */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexShrink: 0,
                            minWidth: { xs: 'auto', md: 200 },
                        }}
                    >
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                edge="start"
                                onClick={onMenuClick}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Box
                            onClick={handleLogoClick}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                },
                            }}
                        >
                            <FontAwesomeIcon icon={faGamepad} size="lg" />
                            <Typography
                                variant="h6"
                                component="div"
                                fontWeight="bold"
                                sx={{ display: { xs: 'none', sm: 'block' } }}
                                noWrap
                            >
                                Game Store
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            maxWidth: {
                                xs: 'calc(100% - 120px)',
                                sm: 600,
                                md: 700,
                            },
                            mx: 'auto',
                        }}
                    >
                        <Box sx={{ width: '100%' }}>
                            <SearchBar onSearch={onSearch} />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: { xs: 0.5, md: 2 },
                            alignItems: 'center',
                            flexShrink: 0,
                            minWidth: { xs: 'auto', md: 200 },
                            justifyContent: 'flex-end',
                        }}
                    >
                        <IconButton color="inherit" onClick={handleCartClick}>
                            {cartCount > 0 ? (
                                <Badge badgeContent={cartCount} color="error">
                                    <FontAwesomeIcon
                                        icon={faShoppingCart}
                                        size="lg"
                                    />
                                </Badge>
                            ) : (
                                <FontAwesomeIcon
                                    icon={faShoppingCart}
                                    size="lg"
                                />
                            )}
                        </IconButton>

                        {/* Conditionally render UserMenu or Login Button */}
                        {isAuthenticated ? (
                            <UserMenu />
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    onClick={handleLoginClick}
                                    startIcon={
                                        <FontAwesomeIcon icon={faUser} />
                                    }
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: { xs: 1.5, md: 2.5 },
                                        '&:hover': {
                                            background:
                                                'rgba(255, 255, 255, 0.3)',
                                            border: '1px solid rgba(255, 255, 255, 0.5)',
                                        },
                                        display: { xs: 'none', sm: 'flex' },
                                    }}
                                >
                                    Login
                                </Button>

                                <IconButton
                                    color="inherit"
                                    onClick={handleLoginClick}
                                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                                >
                                    <FontAwesomeIcon icon={faUser} />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default Header
