from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/movies", methods=["GET"])
def get_data():
    search = request.args.get("search")
    # do something with search

    data = {"movies": [
        {"title": "The Shawshank Redemption", "year": 1994, "tags": ["drama", "prison", "drama", "prison"]},
        {"title": "The Godfather", "year": 1972, "tags": ["drama", "mafia"]},
        {"title": "The Godfather: Part II", "year": 1974, "tags": ["drama", "mafia"]},
        {"title": "The Dark Knight", "year": 2008, "tags": ["action", "superhero"]},
        {"title": "The Dark Knight", "year": 2008, "tags": ["action", "superhero"]},
        ]}
    return jsonify(data)


if __name__ == "__main__":
    app.run()