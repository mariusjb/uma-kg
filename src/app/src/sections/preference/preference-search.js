import PropTypes from 'prop-types';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from '../../components/iconify';
import SearchNotFound from '../../components/search-not-found';

// ----------------------------------------------------------------------

const searchStyles = {
    backgroundColor: 'black',
    borderRadius: '20px', // Add rounded corners
    color: 'white', // Set text color to white
    '& .MuiAutocomplete-inputRoot': {
      color: 'white', // Set text color inside the input
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'red', // Set border color to red
    },
  };

// ----------------------------------------------------------------------

export default function PreferenceSearch({ query, results, handleSearch, handleClick }) {

    const handleKeyUp = (event) => {
        if (query) {
            if (event.key === 'Enter') {
                const selectMovie = results.filter((movie) => movie.title === query)[0];

                handleClick(selectMovie.id);
            }
        }
    };

    return (
        <Autocomplete
            sx={{ width: { xs: 1, sm: 400 } }}
            autoHighlight
            popupIcon={null}
            options={Array.isArray(results) ? results : []}
            onInputChange={(event, newValue) => handleSearch(newValue)}
            getOptionLabel={(option) => option.title}
            noOptionsText={<SearchNotFound query={query} sx={{ bgcolor: 'unset' }} />}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder="Search..."
                    onKeyUp={handleKeyUp}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={searchStyles} // Apply the defined styles
                />

            )}
            renderOption={(props, movie, { inputValue }) => {
                const matches = match(movie.title, inputValue);
                const parts = parse(movie.title, matches);

                return (
                    <Box component="li" {...props} onClick={() => handleClick(movie.id)} key={movie.id}>
                        <div>
                            {parts.map((part, index) => (
                                <Typography
                                    key={index}
                                    component="span"
                                    color={part.highlight ? 'primary' : 'textPrimary'}
                                    sx={{
                                        typography: 'body2',
                                        fontWeight: part.highlight ? 'fontWeightSemiBold' : 'fontWeightMedium',
                                    }}
                                >
                                    {part.text}
                                </Typography>
                            ))}
                        </div>
                    </Box>
                );
            }}
        />
    );
}

PreferenceSearch.propTypes = {
    query: PropTypes.string,
    results: PropTypes.array,
    handleSearch: PropTypes.func,
    handleClick: PropTypes.func,
};