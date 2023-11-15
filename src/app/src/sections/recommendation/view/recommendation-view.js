import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import RecommendationList from '../recommendation-list';

export default function RecommendationView() {

    const navigate = useNavigate();

    const preference = JSON.parse(localStorage.getItem('preference'));

    const [currentRecommendation, setCurrentRecommendation] = useState([]);

    const [likedRecommendation, setLikedRecommendation] = useState([]);

    const [dislikedRecommendation, setDislikedRecommendation] = useState([]);

    const [seenRecommendation, setSeenRecommendation] = useState([]);


    const filterRecommendations = () => {
        return currentRecommendation.filter((movie) => {
            return (
                !likedRecommendation.includes(movie.id) &&
                !dislikedRecommendation.includes(movie.id) &&
                !seenRecommendation.includes(movie.id)
            );
        });
    };

    const fetchUpdatedRecommendation = async () => {
        const filteredRecommendations = filterRecommendations();

        const preferenceIds = preference.map((movie) => movie.id).join(',');
        const recommendationIds = currentRecommendation.map((movie) => movie.id).join(',');
        const likedMovieIds = likedRecommendation.join(',');
        const dislikedMovieIds = dislikedRecommendation.join(',');
        const seenMovieIds = seenRecommendation.join(',');

        try {
            const params = new URLSearchParams();
            if (likedMovieIds) {
                params.append('likedMovieIds', likedMovieIds);
            }
            if (dislikedMovieIds) {
                params.append('dislikedMovieIds', dislikedMovieIds);
            }
            if (seenMovieIds) {
                params.append('seenMovieIds', seenMovieIds);
            }
            if (preferenceIds) {
                params.append('movieIds', preferenceIds);
            }
            if (recommendationIds) {
                params.append('recommendedMovieIds', recommendationIds);
            }

            const response = await fetch(`http://127.0.0.1:5000/movies/recommendation?${params.toString()}`);

            if (!response.ok) {
                console.error('Error fetching recommendations');
                return;
            }

            const recommendations = await response.json();
            console.log(recommendations)
            setCurrentRecommendation([...currentRecommendation, ...recommendations]);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    useEffect(() => {
        fetchUpdatedRecommendation();
    }, [likedRecommendation, dislikedRecommendation, seenRecommendation]);


    const handleLike = (id) => {
        setLikedRecommendation((prevLiked) => {
            const newLiked = [...prevLiked, id];
            return newLiked;
        });

        setCurrentRecommendation(filterRecommendations());
    };

    const handleDislike = (id) => {
        setDislikedRecommendation((prevDisliked) => {
            const newDisliked = [...prevDisliked, id];
            return newDisliked;
        });
        setCurrentRecommendation(filterRecommendations());
    };

    const handleSeen = (id) => {
        setSeenRecommendation((prevSeen) => {
            const newSeen = [...prevSeen, id];
            return newSeen;
        });
        setCurrentRecommendation(filterRecommendations());
    };


    return (
        <div>
            <div style={{ margin: '5%', display: 'flex' }}>
                <RecommendationList recommendations={currentRecommendation} handleLike={handleLike} handleDislike={handleDislike} handleSeen={handleSeen} />
            </div>
            <div style={{ position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'red', height: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 20px' }}>
                    <Button onClick={() => navigate('/preference')} sx={{ color: "black", backgroundColor: 'white', top: "50%", transform: "translateY(-50%)", position: "absolute" }} startIcon={<ArrowBackIcon />}>Back</Button>
                </div>
            </div>
        </div>
    );
}