import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.data import Data, Field
from configs.config import *
from src.milvus_data import (MilvusData, Collection, 
                    CollectionSchema, FieldSchema, 
                    DataType, connections)

"""Add more index in ES here by creating data classes"""

class RedditData(Data):
    index = 'reddit_data'
    fields = [
        Field('width'),
        Field('height'),
        Field('likes'),
        Field('text'),
        Field('img_id'),
        Field('num_comments'),
        Field('upvote_ratio'),
        Field('subreddit'),
        Field('taken_timestamp'),
        Field('url')
    ]

    def find_img_id(self):
        """Find the document with its image id (alphanumerical)"""

        return super().search({"img_id": self.img_id})
    
    def exists(self):
        """Check if an document exsits by find its image id"""

        return not self.find_img_id()['count'] == 0

    def list_hashtags(self):
        """List all possible hashtags in the index"""

        aggs = {
            "bucket": "hashtags_count",
            "agg_type": "terms",
            "field": "hashtags.keyword",
            "agg_size": "2147483647"
        }

        return super().search(aggs=aggs)
    
    def find_in_range(self, lower, upper, field):
        """Find the documents with a numeric field between (lower, upper)"""
        query = {
            "range": {
                field: {
                    "gte": lower,
                    "lte": upper,
                    }
                }
            }
        
        return super().search(query=query)


class InstagramData(Data):
    index = "instagram_data"
    fields = [
        Field('width'),
        Field('height'),
        Field('likes'),
        Field('text'),
        Field('taken_timestamp'),
        Field('img_id'),
        Field('md5hash'),
        Field('url')
    ]

    def find_md5(self):
        """Find the document with its md5 hash id"""

        return super().search({"md5hash": self.md5hash})
    
    def exists(self):
        """Check if an document exsits by find its md5"""

        return not self.find_md5()['count'] == 0

    def list_hashtags(self):
        """List all possible hashtags in the index"""

        aggs = {
            "bucket": "hashtags_count",
            "agg_type": "terms",
            "field": "hashtags.keyword",
            "agg_size": "2147483647"
        }

        return super().search(aggs=aggs)
    
    def find_in_range(self, lower, upper, field):
        """Find the documents with a numeric field between (lower, upper)"""
        query = {
            "range": {
                field: {
                    "gte": lower,
                    "lte": upper,
                    }
                }
            }
        
        return super().search(query=query)

class TwitterData(Data):
    index = "twitter_data"
    fields = [
        Field('width'),
        Field('height'),
        Field('likes'),
        Field('text'),
        Field('taken_timestamp'),
        Field('hashtags'),
        Field('retweet_count'),
        Field('language'),
        Field('post_id'),
        Field('img_id'),
        Field('md5hash'),
        Field('url')
    ]

    def find_md5(self):
        """Find the document with its md5 hash id"""

        return super().search({"md5hash": self.md5hash})
    
    def exists(self):
        """Check if an document exsits by find its md5"""

        return not self.find_md5()['count'] == 0

    def list_hashtags(self):
        """List all possible hashtags in the index"""

        aggs = {
            "bucket": "hashtags_count",
            "agg_type": "terms",
            "field": "hashtags.keyword",
            "agg_size": "2147483647"
        }

        return super().search(aggs=aggs)
    
    def find_in_range(self, lower, upper, field):
        """Find the documents with a numeric field between (lower, upper)"""
        query = {
            "range": {
                field: {
                    "gte": lower,
                    "lte": upper,
                    }
                }
            }
        
        return super().search(query=query)

class InstagramMilvusMapping(Data):
    index = "milvus_instagram_mapping"
    fields = [
        Field('milvus_hash'),
        Field('es_hash'),
        Field('embedding_type'),
        Field('x1'),
        Field('y1'),
        Field('x2'),
        Field('y2')
    ]

    def find_es_hash(self):
        """Find the document with its ES hash in data"""

        return super().search({"es_hash": self.es_hash})

    def exists(self):
        """Check if an document exsits by find its ES hash"""

        return not self.find_es_hash()['count'] == 0

class RedditMilvusMapping(Data):
    index = "milvus_reddit_mapping"
    fields = [
        Field('milvus_hash'),
        Field('es_hash'),
        Field('embedding_type'),
        Field('x1'),
        Field('y1'),
        Field('x2'),
        Field('y2')
    ]

    def find_es_hash(self):
        """Find the document with its ES hash in data"""

        return super().search({"es_hash": self.es_hash})

    def exists(self):
        """Check if an document exsits by find its ES hash"""

        return not self.find_es_hash()['count'] == 0
    
class TwitterMilvusMapping(Data):
    index = "milvus_twitter_mapping"
    fields = [
        Field('milvus_hash'),
        Field('es_hash'),
        Field('embedding_type'),
        Field('x1'),
        Field('y1'),
        Field('x2'),
        Field('y2')
    ]

    def find_es_hash(self):
        """Find the document with its ES hash in data"""

        return super().search({"es_hash": self.es_hash})

    def exists(self):
        """Check if an document exsits by find its ES hash"""

        return not self.find_es_hash()['count'] == 0

class InstagramPlaceCollection(MilvusData):
    dim = 2048
    collection_name = "instagram_place_collection"
    collection_descp = "instagram place embeddings data"
    schema_fields = [
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, 
        dim=dim, description="embeddings"),
    ]
    
    def __init__(self):
        connections.connect("default", host=LOCAL_HOST, port=MILVUS_SERVER_PORT)
        self.collection = Collection(
            name=self.collection_name, 
            schema=CollectionSchema(
            fields = super().schema_field_list(), 
            description=self.collection_descp
        ))

        if not super().get_info()['index']:
            default_index = {
                "index_type": "IVF_FLAT",
                "params": {"nlist": 128}, 
                "metric_type": "L2"
            }
            self.collection.create_index(
                field_name="vector",
                index_params=default_index
            )

class InstagramPersonCollection(MilvusData):
    dim = 256
    collection_name = "instagram_person_collection"
    collection_descp = "instagram person embeddings data"
    schema_fields = [
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, 
        dim=dim, description="embeddings"),
    ]
    
    def __init__(self):
        connections.connect("default", host=LOCAL_HOST, port=MILVUS_SERVER_PORT)
        self.collection = Collection(
            name=self.collection_name, 
            schema=CollectionSchema(
            fields = super().schema_field_list(), 
            description=self.collection_descp
        ))

        if not super().get_info()['index']:
            default_index = {
                "index_type": "IVF_FLAT",
                "params": {"nlist": 128}, 
                "metric_type": "L2"
            }
            self.collection.create_index(
                field_name="vector",
                index_params=default_index
            )


class RedditPlaceCollection(MilvusData):
    dim = 2048
    collection_name = "reddit_place_collection"
    collection_descp = "reddit place embeddings data"
    schema_fields = [
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, 
        dim=dim, description="embeddings"),
    ]
    
    def __init__(self):
        connections.connect("default", host=LOCAL_HOST, port=MILVUS_SERVER_PORT)
        self.collection = Collection(
            name=self.collection_name, 
            schema=CollectionSchema(
            fields = super().schema_field_list(), 
            description=self.collection_descp
        ))

        if not super().get_info()['index']:
            default_index = {
                "index_type": "IVF_FLAT",
                "params": {"nlist": 128}, 
                "metric_type": "L2"
            }
            self.collection.create_index(
                field_name="vector",
                index_params=default_index
            )
            
class RedditPersonCollection(MilvusData):
    dim = 256
    collection_name = "reddit_person_collection"
    collection_descp = "reddit person embeddings data"
    schema_fields = [
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, 
        dim=dim, description="embeddings"),
    ]
    
    def __init__(self):
        connections.connect("default", host=LOCAL_HOST, port=MILVUS_SERVER_PORT)
        self.collection = Collection(
            name=self.collection_name, 
            schema=CollectionSchema(
            fields = super().schema_field_list(), 
            description=self.collection_descp
        ))

        if not super().get_info()['index']:
            default_index = {
                "index_type": "IVF_FLAT",
                "params": {"nlist": 128}, 
                "metric_type": "L2"
            }
            self.collection.create_index(
                field_name="vector",
                index_params=default_index
            )
            
            
class TwitterPlaceCollection(MilvusData):
    dim = 2048
    collection_name = "twitter_place_collection"
    collection_descp = "twitter place embeddings data"
    schema_fields = [
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, 
        dim=dim, description="embeddings"),
    ]
    
    def __init__(self):
        connections.connect("default", host=LOCAL_HOST, port=MILVUS_SERVER_PORT)
        self.collection = Collection(
            name=self.collection_name, 
            schema=CollectionSchema(
            fields = super().schema_field_list(), 
            description=self.collection_descp
        ))

        if not super().get_info()['index']:
            default_index = {
                "index_type": "IVF_FLAT",
                "params": {"nlist": 128}, 
                "metric_type": "L2"
            }
            self.collection.create_index(
                field_name="vector",
                index_params=default_index
            )

class TwitterPersonCollection(MilvusData):
    dim = 256
    collection_name = "twitter_person_collection"
    collection_descp = "twitter person embeddings data"
    schema_fields = [
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, 
        dim=dim, description="embeddings"),
    ]
    
    def __init__(self):
        connections.connect("default", host=LOCAL_HOST, port=MILVUS_SERVER_PORT)
        self.collection = Collection(
            name=self.collection_name, 
            schema=CollectionSchema(
            fields = super().schema_field_list(), 
            description=self.collection_descp
        ))

        if not super().get_info()['index']:
            default_index = {
                "index_type": "IVF_FLAT",
                "params": {"nlist": 128}, 
                "metric_type": "L2"
            }
            self.collection.create_index(
                field_name="vector",
                index_params=default_index
            )