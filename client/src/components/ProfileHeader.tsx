import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Badge,
    IconButton
} from "@mui/material";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faGamepad, faHouse } from '@fortawesome/free-solid-svg-icons';
import ROUTES from '../config/routes';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    cartItemCount?: number;
}

export default function ProfileHeader({ cartItemCount = 0 }: HeaderProps): JSX.Element {
    const navigate = useNavigate();

    const handleCartClick = () => {
        // TODO: Implement cart modal/page navigation
        console.log('Cart clicked');
    };

    return (
        <AppBar position="sticky" color='primary'>
            <Toolbar>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 2
                    }}
                >
                    {/* logo and menu */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexShrink: 0,
                            minWidth: { xs: 'auto', md: 200 }
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
                    {/* buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: { xs: 0.5, md: 2 },
                            alignItems: 'center',
                            flexShrink: 0,
                            minWidth: { xs: 'auto', md: 200 },
                            justifyContent: 'flex-end'
                        }}
                    >
                        <IconButton color="inherit" onClick={handleCartClick}>
                            {cartItemCount > 0 ? (
                                <Badge badgeContent={cartItemCount} color="error">
                                    <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                                </Badge>
                            ) : (
                                <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                            )}
                        </IconButton>
                        <IconButton color="inherit" onClick={() => navigate(ROUTES.HOME)}>
                            <FontAwesomeIcon icon={faHouse} size="lg" />
                        </IconButton>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    )
}