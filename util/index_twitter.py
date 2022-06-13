import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from util import tools
from configs.config import *
from src.search import (TwitterData)
import loguru
import json
from datetime import datetime
from elasticsearch.exceptions import NotFoundError

def date_to_timestamp(date):
    """Convert twitters date created into a timestamp for stroing in ES"""

    new_datetime = datetime.strptime(date,'%a %b %d %H:%M:%S +0000 %Y')

    return int(new_datetime.timestamp())

def parse_meta_json(json_path, img_id):
    """parse the response json from api call, get the data we need for the 
       twitter index object, return it"""

    try:
        with open(json_path, 'r') as meta_json:
            meta_data = json.load(meta_json)
            hashtags = []

            created = str(meta_data.get("created_at"))
            post_id = meta_data.get("id_str")
            entities = meta_data.get("entities")
            entitie_hashtags = entities['hashtags']
            for item in entitie_hashtags:
                hashtag = item.get("text")
                hashtags.append(hashtag)
            
            medias = entities.get("media")
            for media in medias:
                if media.get("id_str") == img_id:
                    media_size = media.get("sizes")['large']
                    width = media_size.get('w')
                    height = media_size.get('h')
            
            likes = meta_data.get("favorite_count")
            text = meta_data.get("full_text")
            language = meta_data.get("lang")
            retweets = meta_data.get("retweet_count")

            return {
                "width": width,
                "height": height,
                "likes": likes,
                "text": text,
                "taken_timestamp": date_to_timestamp(created),
                "hashtags": hashtags,
                "retweet_count": retweets,
                "language": language,
                "post_id": post_id
            }
    except Exception as e:
        loguru.logger.log("WARNING", e)
        return None


def save_to_es(twitter_data, index_data, img_id, url, md5hash):
    """Append attr accordingly from the parsed data to twtter index object
       then save the data onto ES"""

    twitter_data.width = index_data["width"]
    twitter_data.height = index_data["height"]
    twitter_data.likes = index_data["likes"]
    twitter_data.text = index_data["text"]
    twitter_data.taken_timestamp = index_data["taken_timestamp"]
    twitter_data.hashtags = index_data["hashtags"]
    twitter_data.retweet_count = index_data["retweet_count"]
    twitter_data.language = index_data["language"]
    twitter_data.post_id = index_data["post_id"]
    twitter_data.img_id = img_id
    twitter_data.url = url
    twitter_data.md5hash = md5hash
    
    try:
        if twitter_data.exists():
            loguru.logger.log("INFO", "Data already indexed in ES, skipping ......")
            return 
    except NotFoundError:
        loguru.logger.log("INFO", "Index not found, creating ......")
        twitter_data.save()
        print(twitter_data.field_dict())

    twitter_data.save()
    print(twitter_data.field_dict())

def index_from_local(data_path):
    """Save local data to ES"""

    loguru.logger.log("INFO", f"Indexing data under {data_path} locally")
    for root, _, files in os.walk(data_path):
        for file in files:
            if tools.is_image(file):
                img_path = os.path.join(root, file)
                fname = tools.fname(img_path)
                json_path = os.path.join(root, f'{fname}.json')
                img_url = f"local_save: {img_path}"
                index_data = parse_meta_json(json_path, fname)
                if index_data:
                    md5hash = tools.md5(fname)
                    twitter_data = TwitterData()
                    save_to_es(twitter_data, index_data, fname, img_url, md5hash)
                    loguru.logger.log("INFO", f"Twitter data {img_path} saved")

def index_from_cloud(data_path):
    """Save S3 data to ES"""

    import boto3 

    S3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
    s3_tools = tools.S3Tools(client=S3)
    bucket_name = "meepoerdata"
    loguru.logger.log("INFO", f"Indexing data under {data_path} from S3")
    hashtag_folders = s3_tools.list_folder_bucket(bucket_name, 'twitter/')

    for folder in hashtag_folders:
        hashtag = folder.split("/")[1]
        files = s3_tools.list_file_abs(bucket_name, folder, suffix='.json')
        for file in files:
            if not os.path.isdir(file):
                fname = tools.fname(file)
                root = file.split('/'+fname)[0]
                json_path = os.path.join(root, f'{fname}.json')
                img_url = f"{S3_BUCKET_DNS}/twitter/{hashtag}/{fname}.jpg"
                index_data = parse_meta_json(json_path, fname)
                if index_data:
                    md5hash = tools.md5(fname)
                    twitter_data = TwitterData()
                    save_to_es(twitter_data, index_data, fname, img_url, md5hash)
                    loguru.logger.log("INFO", f"Twitter data {file} saved")