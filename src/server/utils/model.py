import numpy as np
from gensim.models import Word2Vec
import pickle

def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm_vec1 = np.linalg.norm(vec1)
    norm_vec2 = np.linalg.norm(vec2)
    return dot_product / (norm_vec1 * norm_vec2)

def get_nearest_neighbors(node, model, G, k=10):
    target_embedding = model.wv[node]
    
    similarities = {}
    for other_node in model.wv.index_to_key:
        if other_node == node or G.nodes[other_node]['type'] != 'movie':  # Skip the given node itself and non-movie nodes
            continue
        other_embedding = model.wv[other_node]
        similarities[other_node] = cosine_similarity(target_embedding, other_embedding)
    
    sorted_nodes = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
    nearest_neighbors = [node[0] for node in sorted_nodes[:k]]
    
    return nearest_neighbors

def load_model():
    return Word2Vec.load('src/server/embeddings.model')

def load_graph():
    with open('src/server/graph.pkl', 'rb') as handle:
        return pickle.load(handle)
    

import numpy as np

class Recommender:

    def __init__(self, movie_embeddings: Word2Vec, graph):
        self.movie_embeddings = movie_embeddings
        self.graph = graph
        self.alpha = 0.5  # initial learning rate

    def initial_user_embedding(self, liked_movies:list[str]):
        # Fetch embeddings of liked movies and average them
        liked_movie_embeddings = [self.movie_embeddings.wv[movie] for movie in liked_movies]
        user_embedding = np.mean(liked_movie_embeddings, axis=0)
        return self.normalize_embedding(user_embedding)

    def update_user_embedding(self, user_embedding, movie_id, liked=True):
        if liked:
            # Move user embedding closer to the liked movie's embedding
            user_embedding += self.alpha * (self.movie_embeddings.wv[movie_id] - user_embedding)
        else:
            # Move user embedding away from the disliked movie's embedding
            user_embedding -= self.alpha * (self.movie_embeddings.wv[movie_id] - user_embedding)

        # Optional: reduce learning rate over time (e.g., self.alpha *= 0.99)
        return self.normalize_embedding(user_embedding)

    def normalize_embedding(self, embedding):
        return embedding / np.linalg.norm(embedding)

    def recommend(self, user_embedding): #, n=10):
        similarities = {}
        for node in self.movie_embeddings.wv.index_to_key:
            if self.graph.nodes[node]['type'] != 'movie':  # Skip the given node itself and non-movie nodes
                continue
            movie_embedding = self.movie_embeddings.wv[node]
            similarities[node] = cosine_similarity(user_embedding, movie_embedding)

        sorted_nodes = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
        nearest_neighbors = [node[0] for node in sorted_nodes] #[:n]

        return nearest_neighbors

# Example Usage:
# movie_embeddings = load_model()
# recommender = Recommender(movie_embeddings)

# user_liked_movies = ["546"]
# user_embedding = recommender.initial_user_embedding(user_liked_movies)
# user_embedding = recommender.update_user_embedding(user_embedding, "movie2", liked=False)

# recommended_movies = recommender.recommend(user_embedding, n=10)
# print(recommended_movies)
