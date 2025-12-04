import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import SearchBar from './SearchBar';

interface HeaderProps {
  onSearch: (query: string) => void;
}

function Header({ onSearch }: HeaderProps) {
  const handleLogin = () => {
    console.log('Login clicked');
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexShrink: 0 }}>
          Game Key Store
        </Typography>

        <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 2 }}>
          <SearchBar onSearch={onSearch} />
        </Box>

        <Button color="inherit" onClick={handleLogin}>
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
