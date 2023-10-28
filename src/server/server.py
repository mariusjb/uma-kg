import flask
from flask import request, jsonify
from flask_cors import CORS
import requests
from utils.sparql import REF
from utils.result import get_unique_dicts 


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
def get_movies():
    title = request.args.get(
        "title"
    )  # -> http://127.0.0.1:5000/movies?title=The%20Godfather

    limit = request.args.get("limit", 50)

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
    data = response.json()

    data_transformed = [
        {
            "id": x["filmId"]["value"],
            "imdbId": x["page"]["value"].split("/")[-1],
            "title": x["filmTitle"]["value"],
            "releaseDate": x["releaseDate"]["value"]
            if x.get("releaseDate") is not None
            else None,
            "genre": x["filmGenre"]["value"]
            if x.get("filmGenre") is not None
            else None,
        }
        for x in data["results"]["bindings"]
    ]

    return get_unique_dicts(data_transformed)  # handle duplicates of dicts in the list for now


if __name__ == "__main__":
    app.run(debug=True, port=5000)
