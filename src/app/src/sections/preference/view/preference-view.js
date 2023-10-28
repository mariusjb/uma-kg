import React, { useState, useCallback } from 'react';
import PreferenceSearch from '../preference-search';
import PreferenceList from '../preference-list';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// ----------------------------------------------------------------------

export default function PreferenceView() {

    const initialPreference = JSON.parse(localStorage.getItem('preference'));

    const [search, setSearch] = useState({
        query: '',
        results: [],
    });

    const [currentPreference, setCurrentPreference] = useState(initialPreference || []);

    const navigate = useNavigate();
    
    const handleSearch = useCallback(async (inputValue) => {
        setSearch((prevState) => ({
            ...prevState,
            query: inputValue,
        }));

        if (inputValue) {
            try {
                // Query the API and wait for the response with await
                const response = await fetch(`http://127.0.0.1:5000/movies?title=${inputValue}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setSearch((prevState) => ({
                    ...prevState,
                    results: data, // Set results with the data array
                }));
            } catch (error) {
                console.log(error);
                setSearch((prevState) => ({
                    ...prevState,
                    results: [], // Set results as an empty array in case of an error
                }));
            }
        }
    }, [search.query]);


    const handleClick = useCallback(
        (id) => {
            const isDuplicate = currentPreference.some((movie) => movie.id === id);
            if (isDuplicate) {
                return;
            }
            const results = search.results.filter((movie) => movie.id === id);
            setCurrentPreference((prevState) => {
                const updatedPreference = [results[0], ...prevState];
                return updatedPreference;
            });
        },
        [currentPreference, search.results]
    );

    const handleDelete = useCallback(
        (id) => {
            setCurrentPreference((prevState) => {
                const updatedPreference = prevState.filter((movie) => movie.id !== id);
                return updatedPreference;
            });
        },
        [currentPreference]
    );

    const handleNavigate = useCallback(async () => {
        localStorage.setItem('preference', JSON.stringify(currentPreference));
    
        // Wait for the data to be stored in localStorage before navigating
        await navigate('/recommendation');
    }, [currentPreference, navigate]);

    return (
        <div>
            <div style={{ margin: '5%', display: 'flex' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingRight: '5%' }}>
                    <div style={{ fontSize: '24px', marginBottom: '20px' }}>What Movies Do You Like?</div>
                    <PreferenceSearch
                        query={search.query}
                        results={search.results}
                        handleSearch={handleSearch}
                        handleClick={handleClick}
                    />
                </div>
                <div style={{ flex: 2 }}>
                    <PreferenceList preferences={currentPreference} handleDelete={handleDelete} />
                </div>
            </div>
            <div style={{ position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'red', height: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px' }}>
                    <Button onClick={handleNavigate} sx={{ color: "black", backgroundColor: 'white', top: "50%", transform: "translateY(-50%)", position: "absolute" }} endIcon={<ArrowForwardIcon />}>Recommend</Button>
                </div>
            </div>
        </div>
    );
}