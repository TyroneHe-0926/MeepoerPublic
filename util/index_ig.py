import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from util import tools
from configs.config import *
from src.search import (InstagramData)
from elasticsearch.exceptions import NotFoundError
import loguru
import json

def parse_meta_json(json_path):
    """parse the response json from api call, get the data we need for the 
    instagram index object, return it"""

    try:
        with open(json_path, 'r') as meta_json:
            meta_data = json.load(meta_json)
            width = str(meta_data.get("dimensions")['height'])
            height = str(meta_data.get("dimensions")['width'])
            likes = str(meta_data.get("edge_liked_by")['count'])

            text = ""
            caption = meta_data.get("edge_media_to_caption")['edges']
            if caption:
                text = caption[0].get("node")['text']
            
            timestamp = str(meta_data.get("taken_at_timestamp"))
            return {
                "width": width,
                "height": height,
                "likes": likes,
                "text": text,
                "timestamp": timestamp,
            }
    except Exception as e:
        loguru.logger.log("WARNING", e)
        return None

def save_to_es(ig_data, index_data, img_id, url, md5hash):
    """Append attr accordingly from the parsed data to instagram index object
       then save the data onto ES"""

    ig_data.width = index_data["width"]
    ig_data.height = index_data["height"]
    ig_data.likes = index_data["likes"]
    ig_data.text = index_data["text"]
    ig_data.taken_timestamp = index_data["timestamp"]
    ig_data.img_id = img_id
    ig_data.url = url
    ig_data.md5hash = md5hash

    try:
        if ig_data.exists():
            loguru.logger.log("INFO", "Data already indexed in ES, skipping ......")
            return 
    except NotFoundError:
        loguru.logger.log("INFO", "Index not found, creating ......")
        ig_data.save()
        print(ig_data.field_dict())

    ig_data.save()
    print(ig_data.field_dict())

def index_from_local(data_path):
    """Save local data to ES"""

    loguru.logger.log("INFO", f"Indexing data under {data_path}")
    for root, _, files in os.walk(data_path):
        for file in files:
            if tools.is_image(file):    
                img_path = os.path.join(root, file)
                fname = tools.fname(img_path)
                json_path = os.path.join(root, f'{fname}.json')
                img_url = f"local_save: {img_path}"
                index_data = parse_meta_json(json_path)
                if index_data:
                    md5hash = tools.md5(fname)
                    ig_data = InstagramData()
                    save_to_es(ig_data, index_data, fname, img_url, md5hash)
                    loguru.logger.log("INFO", f"Instagram data {img_path} saved")
    
def index_from_cloud(data_path):
    """Save S3 data to ES"""

    import boto3 

    S3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
    s3_tools = tools.S3Tools(client=S3)
    bucket_name = "meepoerdata"
    loguru.logger.log("INFO", f"Indexing data under {data_path} from S3")
    hashtag_folders = s3_tools.list_folder_bucket(bucket_name, 'instagram/')

    for folder in hashtag_folders:
        hashtag = folder.split("/")[1]
        files = s3_tools.list_file_abs(bucket_name, folder, suffix='.json')
        for file in files:
            if not os.path.isdir(file):
                fname = tools.fname(file)
                root = file.split('/'+fname)[0]
                json_path = os.path.join(root, f'{fname}.json')
                img_url = f"{S3_BUCKET_DNS}/instagram/{hashtag}/{fname}.jpg"
                index_data = parse_meta_json(json_path)
                if index_data:
                    md5hash = tools.md5(fname)
                    ig_data = InstagramData()
                    save_to_es(ig_data, index_data, fname, img_url, md5hash)
                    loguru.logger.log("INFO", f"Instagram data {file} saved")