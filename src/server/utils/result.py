import pandas as pd

def movie_transform(data):
    return [
        {
            "id": x["filmId"]["value"],
            "imdbId": x["page"]["value"].rstrip("/").split("/")[-1],
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

def transform(list_of_dicts):
    if not list_of_dicts:
        return None
    
    df = pd.DataFrame.from_dict(list_of_dicts)
    export_list = list()

    for _, film_df in df.groupby("id"):
        row_dict = dict()
        for col in film_df.columns:
            if col in ["genre"]:
                unique_list = set(film_df[col].unique())
                unique_list.discard(None)
                row_dict[col] = list(unique_list)
            else:
                row_dict[col] = film_df[col].iloc[0]
        export_list.append(row_dict)

    return export_list
