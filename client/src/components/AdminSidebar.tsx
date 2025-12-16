import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
} from '@mui/material'
import ROUTES from '../config/routes'
import { useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBoxesStacked,
    faTruck,
    faUser,
    faTicket,
    faKey,
} from '@fortawesome/free-solid-svg-icons'

export default function AdminSidebar(): JSX.Element {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <Box>
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                }}
            >
                <Box
                    sx={{
                        p: 2.5,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Management
                    </Typography>
                </Box>
                <List sx={{ py: 2, px: 2, flex: 1, overflowY: 'auto' }}>
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={
                                location.pathname === ROUTES.ADMIN_PRODUCTS
                            }
                            onClick={() => {
                                navigate(ROUTES.ADMIN_PRODUCTS)
                            }}
                            sx={{
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    borderLeft: 4,
                                    borderLeftColor: 'primary.main',
                                },
                            }}
                        >
                            <FontAwesomeIcon icon={faBoxesStacked} />
                            <ListItemText primary="Products" sx={{ px: 1 }} />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={
                                location.pathname === ROUTES.ADMIN_INVENTORY
                            }
                            onClick={() => {
                                navigate(ROUTES.ADMIN_INVENTORY)
                            }}
                            sx={{
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    borderLeft: 4,
                                    borderLeftColor: 'primary.main',
                                },
                            }}
                        >
                            <FontAwesomeIcon icon={faKey} />
                            <ListItemText primary="Stock Keys" sx={{ px: 1 }} />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={location.pathname === ROUTES.ADMIN_ORDERS}
                            onClick={() => {
                                navigate(ROUTES.ADMIN_ORDERS)
                            }}
                            sx={{
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    borderLeft: 4,
                                    borderLeftColor: 'primary.main',
                                },
                            }}
                        >
                            <FontAwesomeIcon icon={faTruck} />
                            <ListItemText primary="Orders" sx={{ px: 1 }} />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={location.pathname === ROUTES.ADMIN_USERS}
                            onClick={() => {
                                navigate(ROUTES.ADMIN_USERS)
                            }}
                            sx={{
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    borderLeft: 4,
                                    borderLeftColor: 'primary.main',
                                },
                            }}
                        >
                            <FontAwesomeIcon icon={faUser} />
                            <ListItemText primary="Users" sx={{ px: 1 }} />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={
                                location.pathname ===
                                ROUTES.ADMIN_DISCOUNT_CODES
                            }
                            onClick={() => {
                                navigate(ROUTES.ADMIN_DISCOUNT_CODES)
                            }}
                            sx={{
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    borderLeft: 4,
                                    borderLeftColor: 'primary.main',
                                },
                            }}
                        >
                            <FontAwesomeIcon icon={faTicket} />
                            <ListItemText
                                primary="Discount Codes"
                                sx={{ px: 1 }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Box>
    )
}
