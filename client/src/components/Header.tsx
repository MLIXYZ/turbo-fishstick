import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faGamepad } from '@fortawesome/free-solid-svg-icons';
import SearchBar from './SearchBar';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMenuClick?: () => void;
  cartItemCount?: number;
}

function Header({ onSearch, onMenuClick, cartItemCount = 0 }: HeaderProps): JSX.Element {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleCartClick = () => {
    // TODO: Implement cart modal/page navigation
    console.log('Cart clicked');
  };

  return (
    <AppBar position="sticky" color="primary">
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
          {/* Left Side - Logo/Menu */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
              minWidth: { xs: 'auto', md: 200 }
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

          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              maxWidth: { xs: 'calc(100% - 120px)', sm: 600, md: 700 },
              mx: 'auto'
            }}
          >
            <Box sx={{ width: '100%' }}>
              <SearchBar onSearch={onSearch} />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
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
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
