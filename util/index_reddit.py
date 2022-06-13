import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from util import tools
from configs.config import *
from src.search import (RedditData)
import loguru
import json
from datetime import datetime
from elasticsearch.exceptions import NotFoundError

def parse_reddit_json(js_path):

    try:
        with open(f"{js_path}", 'r') as meta_json:
            meta_data = json.load(meta_json)

        return {
            'width': meta_data.get('width'),
            'height': meta_data.get('width'),
            'likes': meta_data.get('ups'),
            'title': meta_data.get('title'),
            'img_id': meta_data.get('id'),
            'num_comments': meta_data.get('num_comments'),
            'upvote_ratio': meta_data.get('upvote_ratio'), 
            'subreddit': meta_data.get('subreddit_name_prefixed'),
            'taken_timestamp': round(meta_data.get('created')),
            'url' : meta_data.get('url'),
            'ext' : meta_data.get('ext')
        }
    
    except Exception as e:
        loguru.logger.log('ERROR', f"Could not parse the JSON, Error: {e}")
        return None
        


def save_to_es(reddit_data, index_data, img_id, url):
    """Append attr accordingly from the parsed data to twtter index object
       then save the data onto ES"""

    reddit_data.width = index_data["width"]
    reddit_data.height = index_data["height"]
    reddit_data.likes = index_data["likes"]
    reddit_data.text = index_data["title"]
    reddit_data.taken_timestamp = index_data["taken_timestamp"]
    reddit_data.num_comments = index_data["num_comments"]
    reddit_data.img_id = img_id
    reddit_data.url = url
    reddit_data.upvote_ratio = index_data['upvote_ratio']
    reddit_data.subreddit = index_data['subreddit']
    
    try:
        if reddit_data.exists():
            loguru.logger.log("INFO", "Data already indexed in ES, skipping ......")
            return 
    except NotFoundError:
        loguru.logger.log("INFO", "Index not found, creating ......")
        reddit_data.save()
        print(reddit_data.field_dict())

    reddit_data.save()
    print(reddit_data.field_dict())


def index_from_cloud(data_path):
    """Save S3 data to ES"""

    import boto3 

    S3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
    s3_tools = tools.S3Tools(client=S3)
    bucket_name = "meepoerdata"
    loguru.logger.log("INFO", f"Indexing data under {bucket_name}/reddit/ from S3")
    hashtag_folders = s3_tools.list_folder_bucket(bucket_name, 'reddit/')
    
    for folder in hashtag_folders:
        print(folder)
        hashtag = folder.split("/")[1]
        files = s3_tools.list_file_abs(bucket_name, folder, suffix='.json')
        for file in files:
            loguru.logger.log('INFO', f"Indexing {file} onto ES")
            if not os.path.isdir(file):
                fname = tools.fname(file)
                root = file.split('/'+fname)[0]
                json_path = os.path.join(root, f'{fname}.json')
                index_data = parse_reddit_json(json_path)
                img_url = f"{S3_BUCKET_DNS}/reddit/{hashtag}/{fname}.jpg"
                
                if index_data:
                    reddit_data = RedditData()
                    save_to_es(reddit_data, index_data, fname, img_url)
                    loguru.logger.log("INFO", f"Reddit data {file} saved")
    
