import re
import requests
import tqdm
import pickle
import os

from collections import namedtuple
import networkx as nx
from node2vec import Node2Vec

import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

from typing import Union
from pprint import pprint


BASE_ENDPOINT = (
    "https://api.triplydb.com/datasets/Triply/linkedmdb/services/linkedmdb/sparql"
)

HEADERS = {
    "Content-Type": "application/sparql-query",
    "Accept": "application/sparql-results+json",
}

MAX_LIMIT = 10000

QUERY = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX lmdb: <https://triplydb.com/Triply/linkedmdb/vocab/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?film_id ?title ?release_date ?runtime ?sequel_id ?prequel_id
	   (GROUP_CONCAT(DISTINCT ?genre; SEPARATOR=",") AS ?genres)
       (GROUP_CONCAT(DISTINCT ?subject; SEPARATOR=",") AS ?subjects)
       (GROUP_CONCAT(DISTINCT ?actor; SEPARATOR=",") AS ?actors) 
       (GROUP_CONCAT(DISTINCT ?director; SEPARATOR=",") AS ?directors)
       
    WHERE {{
  		?sub a lmdb:Film.
  		?sub lmdb:filmid ?film_id.
  		?sub rdfs:label ?title.
  		OPTIONAL {{?sub lmdb:initial_release_date ?release_date.}}
  		OPTIONAL {{?sub lmdb:runtime ?runtime.}}
  		OPTIONAL {{?sub lmdb:sequel ?sequel. ?sequel lmdb:filmid ?sequel_id}}
		OPTIONAL {{?sub lmdb:prequel ?prequel.?prequel lmdb:filmid ?prequel_id}}
    	OPTIONAL {{?sub lmdb:actor ?actor.}}
  		OPTIONAL {{?sub lmdb:film_subject ?subject.}}
  		OPTIONAL {{?sub lmdb:director ?director.}}
  		OPTIONAL {{?sub lmdb:genre ?genre.}}
    }}
GROUP BY ?film_id ?title ?release_date ?runtime ?sequel_id ?prequel_id
LIMIT {limit}
OFFSET {offset}
"""


def query_movies(offset, limit=MAX_LIMIT):
    query = QUERY.format(offset=offset, limit=limit)
    response = requests.post(BASE_ENDPOINT, headers=HEADERS, data=query)

    # Check if the request was successful
    if response.status_code == 200:
        return response.json()

    else:
        print(
            f"Request failed with status code {response.status_code}. Reason: {response.text}")


def get_year(movie):
    match = re.search(r"\d{4}", movie)
    if match:
        return match.group(1)
    else:
        return ""


def extract_year(date_str):
    match = re.match(r'(\d{4})', date_str)
    return match.group(1) if match else ""


def extract_value(attribute):
    if isinstance(attribute, dict) and 'value' in attribute:
        return attribute['value']
    return attribute


def serialize_movies(movies_list, filename):
    if not os.path.exists('movies_data'):
        os.makedirs('movies_data')

    filepath = os.path.join('movies_data', filename)

    with open(filepath, 'wb') as f:
        pickle.dump(movies_list, f)

    print(f"Movies serialized to {filepath}.")


Movie = namedtuple(
    "Movie", "film_id title release_date genres subjects runtime actors sequel_id prequel_id directors")


def extract_and_store_movies(offset=0, step_size=10000, verbose=False):

    default_values = {
        "film_id": 0,
        "title": "",
        "release_date": 0,
        "genres": None,
        "runtime": 0,
        "actors": None,
        "sequel_id": "",
        "prequel_id": "",
        "directors": None,
        "subjects": None
    }

    iteration = 0
    more_movies_available = True
    while more_movies_available:
        iteration += 1
        movies = []

        response = query_movies(offset=offset, limit=step_size)
        more_movies_available = len(response["results"]["bindings"]) > 0

        if verbose:
            print(response)

        for movie in response["results"]["bindings"]:
            merged_data = {k: extract_value(v) for k, v in {
                **default_values, **movie}.items()}
            movies.append(Movie(**merged_data))

        serialize_movies(movies, filename=f"movies{iteration * MAX_LIMIT}.pkl")

        if verbose:
            print("Num movies serialized:" + str(iteration * MAX_LIMIT))
            print(len(movies))

        offset += step_size


extract_and_store_movies(verbose=True)
