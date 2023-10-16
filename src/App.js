import React, { useState } from "react";
import CardGrid from "./CardGrid";
import SearchBar from "./SearchBar";

function App() {
  // Define filteredData and its updater function setFilteredData
  const [filteredData, setFilteredData] = useState([]); // Initialize with an empty array
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (searchQuery) => {
    setIsLoading(true);
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/movies?q=${searchQuery}`);
      const data = await response.json();
  
      console.log(data); // Log the entire API response for inspection
  
      const movies = data.movies;
      setFilteredData(movies); // Update the state with fetched data
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <SearchBar onSearch={fetchData} />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <CardGrid filteredData={filteredData} />
      )}
    </div>
  );
}

export default App;
