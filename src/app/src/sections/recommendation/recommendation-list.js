import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { fetchPosterUrl } from '../../utils/poster';


const LikeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="lightgreen"><path d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22Z" opacity=".5"/><path d="M16.03 8.97a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47l4.47-4.47a.75.75 0 0 1 1.06 0Z"/></g></svg>
);

const DislikeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="red"><path d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22Z" opacity=".5"/><path d="M8.97 8.97a.75.75 0 0 1 1.06 0L12 10.94l1.97-1.97a.75.75 0 1 1 1.06 1.06L13.06 12l1.97 1.97a.75.75 0 1 1-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 0 1-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 0 1 0-1.06Z"/></g></svg>
);

const SeenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="white"><path d="M2 12c0 1.64.425 2.191 1.275 3.296C4.972 17.5 7.818 20 12 20c4.182 0 7.028-2.5 8.725-4.704C21.575 14.192 22 13.639 22 12c0-1.64-.425-2.191-1.275-3.296C19.028 6.5 16.182 4 12 4C7.818 4 4.972 6.5 3.275 8.704C2.425 9.81 2 10.361 2 12Z" opacity=".5"/><path fill-rule="evenodd" d="M8.25 12a3.75 3.75 0 1 1 7.5 0a3.75 3.75 0 0 1-7.5 0Zm1.5 0a2.25 2.25 0 1 1 4.5 0a2.25 2.25 0 0 1-4.5 0Z" clip-rule="evenodd"/></g></svg>
);


export default function RecommendationList({ recommendations, handleLike, handleDislike, handleSeen }) {

    const [currentRecommendation, setCurrentRecommendation] = useState([]);

    useEffect(() => {
        setCurrentRecommendation(recommendations);
    }, [recommendations]);

    const onClickLike = (id) => {
        const updatedRecommendation = currentRecommendation.filter((recommendation) => recommendation.id !== id);
        setCurrentRecommendation(updatedRecommendation);
        handleLike(id);
    }

    const onClickDislike = (id) => {
        const updatedRecommendation = currentRecommendation.filter((recommendation) => recommendation.id !== id);
        setCurrentRecommendation(updatedRecommendation);
        handleDislike(id);
    }

    const onClickSeen = (id) => {
        const updatedRecommendation = currentRecommendation.filter((recommendation) => recommendation.id !== id);
        setCurrentRecommendation(updatedRecommendation);
        handleSeen(id);
    }

    

    return (
        <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(4, 1fr)',
                md: 'repeat(5, 1fr)',
            }}
        >
            {currentRecommendation.map((recommendation) => (
                <RecommendationListItem
                    key={recommendation.id}
                    recommendation={recommendation}
                    onClickLike={() => onClickLike(recommendation.id)}
                    onClickDislike={() => onClickDislike(recommendation.id)}
                    onClickSeen={() => onClickSeen(recommendation.id)}
                />
            ))}
        </Box>
    );

}


// ----------------------------------------------------------------------


function RecommendationListItem({ key, recommendation, onClickLike, onClickDislike, onClickSeen }) {

    const { genre, id, imdbId, releaseDate, title } = recommendation

    const [posterUrl, setPosterUrl] = useState("https://www.altavod.com/assets/images/poster-placeholder.png"); // Initialize the state with null

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
                transition: 'all 0.3s',
                '&:hover': {
                    transform: 'scale(1.05)',
                },
                margin: 0,
                padding: 0,
                position: 'relative', // Add relative positioning
            }}
        >
            <img
                src={posterUrl}
                alt="Movie Poster"
                style={{
                    maxWidth: '100%',
                    margin: 0,
                }}
            />
            <div
                style={{
                    fontWeight: 'bold',
                    marginTop: '10px',
                    margin: '10px',
                }}
            >
                {title}
            </div>
            <Stack direction="column" style={{ position: 'absolute', top: '5px', right: '5px', padding: '5px', backgroundColor: "black", borderRadius: '5px', }}>
                {/* Conditionally render the like and dislike buttons */}
                <div onClick={onClickLike}>
                    <LikeIcon />
                </div>
                <div onClick={onClickDislike}>
                    <DislikeIcon />
                </div>
                <div onClick={onClickSeen}>
                    <SeenIcon sx={{backgroundColor: "red"}} />
                </div>
            </Stack>
        </Stack>
    );
}