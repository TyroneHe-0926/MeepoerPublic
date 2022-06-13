from audioop import reverse
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from configs.config import MODEL_FLASK_SERVER
import requests
import numpy as np
import itertools
from src.search import *

def get_place_feature(img):
    """Use Extractor and extract place feature from img ndarray"""

    img = img.astype("float32")
    params = {
        "app": "extract_place_embedding",
        "frame": img.tolist()
    }
    place_feat = requests.post(
        MODEL_FLASK_SERVER, json=params).json().get("result")
    return place_feat

def get_person_bbox(img):
    """Use Extractor and extract person bbox from img ndarray"""

    img = img.astype("float32")
    params = {
        "app": "extract_person_bbox",
        "frame": img.tolist()
    }
    bbox = requests.post(MODEL_FLASK_SERVER, json=params).json().get("result")
    return bbox
    
def get_person_feature(img, bbox):
    """Use Extractor and extract person feature from img ndarry"""
    
    img = img.astype("float32")
    params = {
        "app": "extract_person_embedding",
        "person_bboxes": bbox,
        "frame": img.tolist()
    }
    person_feat = requests.post(MODEL_FLASK_SERVER, json=params).json().get("result")
    
    return person_feat

def get_action_feature(img):
    """Use Extractor and extract action feature from img ndarray"""
    """Ditched as of right now"""

    params = {
        "app": "extract_person_bbox",
        "frame": img.tolist()
    }
    person_bbox = np.array(requests.post(
        MODEL_FLASK_SERVER, json=params).json().get("result"))
    
    height = img.shape[0]
    width = img.shape[1]
    params = {
        "app": "normalize_bbox",
        "person_bboxes": person_bbox.tolist(),
        "frameWidth": height,
        "frameHeight": width
    }
    normalized_bbox = requests.post(
            MODEL_FLASK_SERVER, json=params).json().get("result")
    
    params = {
        "app": "extract_action_embedding",
        "frame_list": [img],
        "bboxes_list": [normalized_bbox]
    }
    action_feat = requests.post(
            MODEL_FLASK_SERVER, json=params).json().get("result")
    return str(action_feat)

def get_es_data(mapper, es, distance, milvus_id):
    es_hash = mapper.search({"milvus_hash": f"#{milvus_id}"}).get("data")[0]["es_hash"]
    if es.index == 'reddit_data':
        result = es.search({"img_id": es_hash}).get("data")[0]
    else:
        result = es.search({"md5hash": es_hash}).get("data")[0]
    result.update({"distance": distance})
    return result

def remove_dup(results):
    return [next(b) for _, b in itertools.groupby(results, lambda y: y[0])]

def search_embedding(img, page, bbox=None):
    top_k=30
    instagram_place_collection = InstagramPlaceCollection()
    instagram_person_collection = InstagramPersonCollection()
    twitter_place_collection = TwitterPlaceCollection()
    twitter_person_collection = TwitterPersonCollection()
    instagram_mapping = InstagramMilvusMapping()
    twitter_mapping = TwitterMilvusMapping()
    instagram_data = InstagramData()
    twitter_data = TwitterData()
    reddit_data = RedditData()
    reddit_place_collection = RedditPlaceCollection()
    reddit_person_collection = RedditPersonCollection()
    reddit_mapping = RedditMilvusMapping()
    print(f"Requesting for page {page}")
    start, end = page*3-3, page*3

    if not bbox: 
        embedding = get_place_feature(img)
        twitter_results = remove_dup(twitter_place_collection.search(embedding, limit=top_k)[start:end])
        instagram_results = remove_dup(instagram_place_collection.search(embedding, limit=top_k)[start:end])
        reddit_results = remove_dup(reddit_place_collection.search(embedding, limit=top_k)[start:end])
    else:
        embedding = get_person_feature(img, bbox)[0]    
        twitter_results = remove_dup(twitter_person_collection.search(embedding, limit=top_k)[start:end])
        instagram_results = remove_dup(instagram_person_collection.search(embedding, limit=top_k)[start:end])
        reddit_results = remove_dup(reddit_person_collection.search(embedding, limit=top_k)[start:end])

    
    es_data = []
    for twitter_result, instagram_result, reddit_result in zip(twitter_results, instagram_results, reddit_results):
        es_data.append(get_es_data(twitter_mapping, twitter_data, twitter_result[0], twitter_result[1]))
        es_data.append(get_es_data(instagram_mapping, instagram_data, instagram_result[0], instagram_result[1]))
        es_data.append(get_es_data(reddit_mapping, reddit_data, reddit_result[0], reddit_result[1]))
    return sorted(es_data, key=lambda d: d["distance"], reverse=True)