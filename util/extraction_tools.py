import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from util import tools
from time import sleep
import loguru
from src.search import *

redislib = tools.RedisLib()

def get_job_result(job):
    """get an rq worker job status"""

    while True:
        sleep(0.01)
        job_details = redislib.job_status(job.id)
        if job_details["status"] == "finished":
            return job_details.get("result")
        if job_details["status"] == "failed":
            return None

def get_mapping(source):
    """get the mapping type"""

    if source == "twitter":
        return TwitterMilvusMapping()
    elif source == "instagram":
        return InstagramMilvusMapping()
    elif source == "reddit":
        return RedditMilvusMapping()

def save_place(source, collection, img_hash, embedding):
    """
    Save the place embedding (2048) to milvus
    Update the ES mapping with es_hash <-> milvus_id relation
    """

    mapping = get_mapping(source)
    loguru.logger.log("INFO", "saving place feat into milvus")
    milvus_id = collection.insert(embedding)
    mapping.embedding_type = "place"
    mapping.milvus_hash = '#'+milvus_id
    mapping.es_hash = img_hash
    loguru.logger.log("INFO", "saving ES mapping")
    mapping.save()

def save_person(source, collection, bbox, img_hash, embedding):
    """
    Save the person embedding (256) to milvus
    Update the ES mapping with es_hash <-> milvus_id relation
    Also needs to update the ES mapping with the current bbox info
    which is [x1, y1, x2, y2]
    """

    mapping = get_mapping(source)
    loguru.logger.log("INFO", "saving person feat into milvus")
    milvus_id = collection.insert(embedding)
    mapping.embedding_type = "person"
    mapping.milvus_hash = '#'+milvus_id
    mapping.x1 = int(bbox[0])
    mapping.y1 = int(bbox[1])
    mapping.x2 = int(bbox[2])
    mapping.y2 = int(bbox[3])
    mapping.es_hash = img_hash
    loguru.logger.log("INFO", "saving ES mapping")
    mapping.save()

def img_to_place(image):
    """
    Get the place feature from an image array by throwing
    an extraction job to our GPU rq worker
    """

    loguru.logger.log("INFO", "Getting place embedding")
    redq = redislib.redis_queue('feature_extraction')
    job = redq.enqueue("worker_service.get_place_feature", image)
    return get_job_result(job)

def get_bbox(image):
    """
    Get the bounding box(es) by throwing
    an extraction job to our GPU rq worker
    """
    
    loguru.logger.log("INFO", "Getting person bbox")
    redq = redislib.redis_queue('feature_extraction')
    job = redq.enqueue("worker_service.get_person_bbox", image)
    return get_job_result(job)

def img_to_person(image, bbox):
    """
    Get the person feature from a person in the image
    selected by the bounding box(es) by throwing an extraction
    job to our GPU rq worker
    """

    loguru.logger.log("INFO", "Getting person embeddings")
    redq = redislib.redis_queue('feature_extraction')
    job = redq.enqueue("worker_service.get_person_feature", image, bbox)
    return get_job_result(job)

def search_queue(image, page, bbox):
    """
    Send the gpu worker a embedding search job
    """

    loguru.logger.log("INFO", "Searching embedding")
    redq = redislib.redis_queue('feature_extraction')
    job = redq.enqueue("worker_service.search_embedding", image, page, bbox)
    return get_job_result(job)