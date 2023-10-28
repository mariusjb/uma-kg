import numpy as np

class Session:
    def __init__(self, embedding_size) -> None:
        self.__session_embedding = np.zeros(embedding_size)
        
    def update_embedding(self) -> None:
        pass
    
    def get_embedding(self) -> None:
        pass
    


class Recommender():
    def __init__(self) -> None:
        pass
    
    def recommend(self, user_embedding, num_recommendations, exploration_factor):
        pass