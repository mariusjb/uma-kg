import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { fetchPosterUrl } from '../../utils/poster';

export default function PreferenceList({ preferences, handleDelete }) {

    return (
        <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
            }}
        >
            {preferences.map((preference) => (
                <PreferenceListItem
                    key={preference.id}
                    preference={preference}
                    onClickDelete={() => handleDelete(preference.id)}
                />
            ))}
        </Box>
    );

}


// ----------------------------------------------------------------------


function PreferenceListItem({ key, preference, onClickDelete }) {

    const { genre, id, imdbId, releaseDate, title } = preference;

    const [posterUrl, setPosterUrl] = useState("https://www.altavod.com/assets/images/poster-placeholder.png"); 

    useEffect(() => {
        const url = fetchPosterUrl(imdbId);
        url.then((url) => {
            setPosterUrl(url);
        })

    }, [imdbId]); // Include imdbId in the dependency array to re-fetch when it changes

    return (
        <Stack
            component={Card}
            direction="column"
            key={key}
            sx={{
                p: 3,
                transition: 'all 0.3s', // Add a transition for all styles
                '&:hover': {
                    transform: 'scale(1.05)', // Scale the item on hover
                },
                margin: 0,
                padding: 0
            }}
            onClick={onClickDelete}
        >
            <img
                src={posterUrl}
                alt="Movie Poster"
                style={{
                    maxWidth: '100%',
                    margin: 0
                }}
            />
            <div
                style={{
                    fontWeight: 'bold',
                    marginTop: '10px',
                    margin: "10px"
                }}
            >
                {title}
            </div>
        </Stack>

    );

}