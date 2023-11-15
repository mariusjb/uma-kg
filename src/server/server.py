import logging
import pickle
import flask
from flask import request, jsonify
from flask_cors import CORS
import requests
from utils.sparql import REF
from utils.result import transform, movie_transform
from utils.model import Recommender, load_graph, load_model
import ast


logging.basicConfig(level=logging.DEBUG)

logging.info("Loading embeddings...")
embeddings = load_model()

logging.info("Loading graph...")
graph = load_graph()

logging.info("Initializing recommender...")
recommender = Recommender(embeddings, graph)

logging.info("Done!")

app = flask.Flask(__name__)
CORS(app)

BASE_ENDPOINT = (
    "https://api.triplydb.com/datasets/Triply/linkedmdb/services/linkedmdb/sparql"
)
HEADERS = {
    "Content-Type": "application/sparql-query",
    "Accept": "application/sparql-results+json",
    "Access-Control-Allow-Origin": "*",
}


@app.route("/movies", methods=["GET"])
def get_movies_by_title(params=None):
    if params is None:
        params = {}
        params["title"] = request.args.get("title")
        params["limit"] = request.args.get("limit", 20)
    if any([v is None for v in params.values()]):
        return AttributeError("Missing required parameter")

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
        FILTER regex(?filmTitle, "{params["title"]}", "i")
    }}
    ORDER BY ?sub
    LIMIT {params["limit"]}
    """

    response = requests.post(BASE_ENDPOINT, headers=HEADERS, data=sparql_query)

    if response.status_code == 200:
        data = response.json()
        data_transformed = transform(movie_transform(data))
        if data_transformed is not None:
            return data_transformed
        else:
            logging.info("No data found")
            return jsonify({"error": "No data found"})

    logging.info("Unable to retrieve movies data")
    return []


@app.route("/movies/id", methods=["GET"])
def get_movie_by_id(params=None):
    if params is None:
        params = {}
        params["movieId"] = request.args.get("movieId")
    if any([v is None for v in params.values()]):
        return AttributeError("Missing required parameter")

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
        FILTER(?filmId = {params["movieId"]})
    }}
    """

    response = requests.post(BASE_ENDPOINT, headers=HEADERS, data=sparql_query)

    if response.status_code == 200:
        data = response.json()
        data_transformed = transform(movie_transform(data))
        if data_transformed is not None:
            return data_transformed[0]
        else:
            logging.info("No data found")
            return []

    logging.info("Unable to retrieve movie data")
    return []


@app.route("/movies/recommendation", methods=["GET"])
def get_movie_recommendations(params=None):
    if params is None:
        params = {
            "movieIds": [],
            "recommendedMovieIds": [],
            "likedMovieIds": [],
            "dislikedMovieIds": [],
            "seenMovieIds": [],
        }
        for key in params.keys():
            if request.args.get(key) is not None:
                params[key] = request.args.get(key).split(",")
    if any([v is None for v in params.values()]):
        return AttributeError("Missing required parameter")

    logging.info(f"Params: {params}")

    embedding = recommender.initial_user_embedding(params["movieIds"])

    for liked_movie_id in params["likedMovieIds"]:
        embedding = recommender.update_user_embedding(
            embedding, liked_movie_id, liked=True
        )

    for disliked_movie_id in params["dislikedMovieIds"]:
        embedding = recommender.update_user_embedding(
            embedding, disliked_movie_id, liked=False
        )

    recommendations_ids = recommender.recommend(embedding)

    updated_recommendations_ids = []
    for movie_id in recommendations_ids:
        if (
            movie_id in params["movieIds"]
            or movie_id in params["recommendedMovieIds"]
            or movie_id in params["seenMovieIds"]
            or movie_id in params["dislikedMovieIds"]
            or movie_id in params["likedMovieIds"]
        ):
            logging.info(f"Skipping movie id: {str(movie_id)}")
            continue
        else:
            updated_recommendations_ids.append(movie_id)
    logging.info(f"Updated recommendations: {len(updated_recommendations_ids)}")

    max_iters = 30
    max_recommendations = 10
    updated_recommendations = []
    iters = 0

    logging.info(f"Searching for {max_recommendations - len(params['recommendedMovieIds'])} movies")
    for movie_id in updated_recommendations_ids:
        if iters == max_iters or len(updated_recommendations) >= max_recommendations - len(params["recommendedMovieIds"]):
            break

        tmp = get_movie_by_id({"movieId": movie_id})
        if tmp != []:
            updated_recommendations.append(tmp)

        iters += 1

    if len(updated_recommendations) > max_recommendations - len(params["recommendedMovieIds"]):
        # If you have exceeded the desired number of recommendations, trim the list
        updated_recommendations = updated_recommendations[:max_recommendations - len(params["recommendedMovieIds"])]

    return updated_recommendations



if __name__ == "__main__":
    app.run(debug=False, port=5000)
