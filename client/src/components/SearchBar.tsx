import { useState } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

interface SearchBarProps {
    onSearch: (query: string) => void
}

function SearchBar({ onSearch }: SearchBarProps): JSX.Element {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value
        setSearchQuery(query)
        onSearch(query)
    }

    return (
        <TextField
            fullWidth
            size="small"
            placeholder="Search games..."
            value={searchQuery}
            onChange={handleSearch}
            variant="outlined"
            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
        />
    )
}

export default SearchBar
