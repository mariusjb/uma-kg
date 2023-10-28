
export async function fetchPosterUrl(imdbId) {
    try {
        if (imdbId !== "") {
            const response = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=543cd677`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.Poster !== "N/A" || data.Poster !== null) {
                return data.Poster
            }
        }
        return "https://www.altavod.com/assets/images/poster-placeholder.png"
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}