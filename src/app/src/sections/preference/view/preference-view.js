import React, { useState, useCallback } from 'react';
import PreferenceSearch from '../preference-search';

// ----------------------------------------------------------------------

export default function PreferenceView() {

    const [search, setSearch] = useState({
        query: '',
        results: [],
    });

    const [currentPreference, setCurrentPreference] = useState([])

    const handleSearch = useCallback(async (inputValue) => {
        setSearch((prevState) => ({
            ...prevState,
            query: inputValue,
        }));
        console.log("inputValue", inputValue);

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

    // add to currentPreference given id
    const handleClick = useCallback(
        (id) => {
            console.log("handleClick", id);
            const results = search.results.filter((movie) => movie.id === id);
            setCurrentPreference((prevState) => {
                const updatedPreference = [...prevState, results[0]];
                console.log("currentPreference", updatedPreference);
                return updatedPreference;
            });
        },
        [currentPreference, search.results]
    );


    return (
        <div style={{ margin: '10%', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, marginRight: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '20px' }}>What Movies Do You Like?</div>
                <PreferenceSearch
                    query={search.query}
                    results={search.results}
                    handleSearch={handleSearch}
                    handleClick={handleClick}
                />
            </div>
            <div style={{ flex: 2 }}>
                {/* Your results content here */}
            </div>
        </div>

    );
}