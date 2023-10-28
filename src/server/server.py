import logging
import flask
from flask import request, jsonify
from flask_cors import CORS
import requests
from utils.sparql import REF
from utils.result import transform, movie_transform


app = flask.Flask(__name__)
CORS(app)

BASE_ENDPOINT = (
    "https://api.triplydb.com/datasets/Triply/linkedmdb/services/linkedmdb/sparql"
)
HEADERS = {
    "Content-Type": "application/sparql-query",
    "Accept": "application/sparql-results+json",
}


@app.route("/movies", methods=["GET"])
def get_movies_by_title():
    title = request.args.get("title")
    limit = request.args.get("limit", 20)

    sparql_query = f"""
    {REF}
    SELECT DISTINCT ?filmId ?filmTitle ?releaseDate ?filmGenre ?page
    WHERE {{
        ?sub a lmdb:Film.
        ?sub lmdb:filmid ?filmId.
        ?sub rdfs:label ?filmTitle.
        OPTIONAL {{
            ?sub lmdb:initial_release_date ?releaseDate.
            ?sub lmdb:genre ?genreResource.
            ?genreResource lmdb:film_genre_name ?filmGenre.
        }}
        ?sub foaf:page ?page.
        FILTER regex(?page, "http://www.imdb.com/title/tt", "i")
        FILTER regex(?filmTitle, "{title}", "i")
    }}
    ORDER BY ?sub
    LIMIT {limit}
    """

    response = requests.post(BASE_ENDPOINT, headers=HEADERS, data=sparql_query)

    if response.status_code == 200:
        data = response.json()
        data_transformed = movie_transform(data)
        return transform(data_transformed)
    
    return jsonify({"error": "Unable to retrieve movie data"})


@app.route("/movies/id", methods=["GET"])
def get_movie_by_id():
    movieId = request.args.get("movieId")

    sparql_query = f"""
    {REF}
    SELECT DISTINCT ?filmId ?filmTitle ?releaseDate ?filmGenre ?page
    WHERE {{
        ?sub a lmdb:Film.
        ?sub lmdb:filmid ?filmId.
        ?sub rdfs:label ?filmTitle.
        OPTIONAL {{
            ?sub lmdb:initial_release_date ?releaseDate.
            ?sub lmdb:genre ?genreResource.
            ?genreResource lmdb:film_genre_name ?filmGenre.
        }}
        ?sub foaf:page ?page.
        FILTER regex(?page, "http://www.imdb.com/title/tt", "i")
        FILTER(?filmId = {movieId})
    }}
    """

    response = requests.post(BASE_ENDPOINT, headers=HEADERS, data=sparql_query)

    if response.status_code == 200:
        data = response.json()
        data_transformed = movie_transform(data)
        return transform(data_transformed)

    return jsonify({"error": "Unable to retrieve movie data"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
