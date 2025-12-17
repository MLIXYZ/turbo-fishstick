import { useState, MouseEvent } from 'react'
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Divider,
    Typography,
    Avatar,
    ListItemIcon,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUser,
    faShoppingBag,
    faRightFromBracket,
    faShield,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ROUTES from '../config/routes'

function UserMenu() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = () => {
        logout()
        handleClose()
        navigate(ROUTES.HOME)
    }

    const handleMenuItemClick = (path?: string) => {
        handleClose()
        if (path) {
            navigate(path)
        }
    }

    if (!user) return null

    const getInitials = () => {
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    }

    return (
        <Box>
            {/* Desktop Button */}
            <Button
                id="user-menu-button"
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontWeight: 600,
                    px: { xs: 1.5, md: 2 },
                    '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                    },
                    display: { xs: 'none', sm: 'flex' },
                    gap: 1.5,
                    alignItems: 'center',
                    textTransform: 'none',
                }}
            >
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.dark',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                    }}
                    src={user.avatar_url || undefined}
                >
                    {getInitials()}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        {user.first_name} {user.last_name}
                    </Typography>
                    {user.role === 'admin' && (
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                opacity: 0.8,
                                fontSize: '0.65rem',
                            }}
                        >
                            Admin
                        </Typography>
                    )}
                </Box>
            </Button>

            {/* Mobile Button */}
            <Button
                onClick={handleClick}
                sx={{
                    display: { xs: 'flex', sm: 'none' },
                    minWidth: 'auto',
                    p: 1,
                    color: 'white',
                }}
            >
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.dark',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                    }}
                    src={user.avatar_url || undefined}
                >
                    {getInitials()}
                </Avatar>
            </Button>

            <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'user-menu-button',
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        mt: 1.5,
                        minWidth: 220,
                        borderRadius: 2,
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1.25,
                            gap: 1.5,
                        },
                    },
                }}
            >
                {/* User Info Header */}
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={600}>
                        {user.first_name} {user.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user.email}
                    </Typography>
                </Box>

                {/* Profile */}
                <MenuItem onClick={() => handleMenuItemClick(ROUTES.PROFILE)}>
                    <ListItemIcon>
                        <FontAwesomeIcon icon={faUser} />
                    </ListItemIcon>
                    <Typography variant="body2">Profile</Typography>
                </MenuItem>

                {/* Orders - Only show for non-admin users */}
                {user.role !== 'admin' && (
                    <MenuItem
                        onClick={() => handleMenuItemClick(ROUTES.ORDERS)}
                    >
                        <ListItemIcon>
                            <FontAwesomeIcon icon={faShoppingBag} />
                        </ListItemIcon>
                        <Typography variant="body2">My Orders</Typography>
                    </MenuItem>
                )}

                {/* Admin Panel (only for admins) */}
                {user.role === 'admin' && (
                    <>
                        <Divider />
                        <MenuItem
                            onClick={() => handleMenuItemClick(ROUTES.ADMIN)}
                        >
                            <ListItemIcon>
                                <FontAwesomeIcon icon={faShield} />
                            </ListItemIcon>
                            <Typography variant="body2" color="primary">
                                Admin Panel
                            </Typography>
                        </MenuItem>
                    </>
                )}

                <Divider />

                {/* Logout */}
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: 'error.main',
                    }}
                >
                    <ListItemIcon>
                        <FontAwesomeIcon
                            icon={faRightFromBracket}
                            color="inherit"
                        />
                    </ListItemIcon>
                    <Typography variant="body2">Logout</Typography>
                </MenuItem>
            </Menu>
        </Box>
    )
}

export default UserMenu
