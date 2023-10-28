import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import RecommendationList from '../recommendation-list';

export default function RecommendationView({ ids }) {

    const navigate = useNavigate();

    ids = ["1236", "1237", "1238", "1239", "1246", "1501"]
    console.log(ids)

    const preference = JSON.parse(localStorage.getItem('preference'));

    const [currentRecommendation, setCurrentRecommendation] = useState([]);

    useEffect(() => {
        const preferenceIds = preference.map((movie) => movie.id);
        const recommendationIds = ids.filter((id) => !preferenceIds.includes(id));
        try {
            const fetchPromises = recommendationIds.map((id) => fetch(`http://127.0.0.1:5000/movies/id?movieId=${id}`));
            Promise.all(fetchPromises)
                .then((responses) => Promise.all(responses.map((response) => response.json())))
                .then((data) => {
                    const allRecommendations = data.flatMap((recommendation) => recommendation);
                    setCurrentRecommendation(allRecommendations);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

    const handleLike = (id) => {
        console.log(id);
    }

    const handleDislike = (id) => {
        console.log(id);
    }

    const handleSeen = (id) => {
        console.log(id);
    }

    return (
        <div>
            <div style={{ margin: '5%', display: 'flex' }}>
                <RecommendationList recommendations={currentRecommendation} handleLike={handleLike} handleDislike={handleDislike} handleSeen={handleSeen}/>
            </div>
            <div style={{ position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'red', height: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 20px' }}>
                    <Button onClick={() => navigate('/preference')} sx={{ color: "black", backgroundColor: 'white', top: "50%", transform: "translateY(-50%)", position: "absolute" }} startIcon={<ArrowBackIcon />}>Back</Button>
                </div>
            </div>
        </div>
    );
}