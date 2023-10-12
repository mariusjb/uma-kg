from bs4 import BeautifulSoup
from pprint import pprint
import requests
import os


def save_img_from_uri(uri):
    r = requests.get(uri)

    if (r.ok):
        html_doc = r.content
        soup = BeautifulSoup(html_doc, 'html.parser')

        img_url = soup.find_all("table", "infobox vevent")[0].img['src']

        if img_url:
            save_img_to_disk("https:" + img_url, file_path=file_path)


def save_img_to_disk(uri, file_path):
    response = requests.get(uri, stream=True)
    response.raise_for_status()  # Raise an exception for HTTP errors

    with open(file_path, 'wb') as file:
        # Use a reasonable chunk size
        for chunk in response.iter_content(chunk_size=8192):
            file.write(chunk)


if __name__ == "__main__":

    file_path = os.getcwd() + "/img.png"
    save_img_from_uri("https://en.wikipedia.org/wiki/The_Terminator")
