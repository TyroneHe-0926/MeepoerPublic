import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from configs.config import *

from pymilvus import (
    connections, FieldSchema, CollectionSchema, 
    DataType,Collection,
)
from pymilvus.orm.exceptions import IndexNotExistException
import loguru
    
class MilvusData():
    """
    Base class for milvus collection
    Milvus Data Representation: 
       Milvus ↓
        - Collection ↓
         - FieldSchema ↓
          - embedding
          - milvus_id
          ...
         - FieldSchema ↓
          - embedding
          - milvus_id
          - ...
        - Collection ↓
         - FieldSchema
          - ...
         - FieldSchema 
         - FieldSchema
        - Collection ↓
         - FieldSchema
         - FieldSchema
    """

    dim = None
    collection_name = None
    collection_descp = None

    #init collection = Collection(name=self.name, schema=default_schema) in subclass
    collection = None

    #Default generates a milvus id
    default_fields = [
        FieldSchema(name="id", dtype=DataType.INT64,
                    is_primary=True, auto_id=True, description="milvus_id"),
    ]


    def schema_field_list(self, exclude=None):
        """Save all current fields in Data and subclass in a field list"""

        exclude = exclude or []

        schema_fields = MilvusData.default_fields + self.schema_fields
        return [field for field in schema_fields if field not in exclude]

    def get_info(self):
        """list the collections current status"""
        
        info = {
                "name": self.collection_name,
                "description": self.collection_descp,
                "dim": self.dim,
                "schemas": self.schema_field_list(),
                "index": None
        }

        try:
            index = self.collection.index()
        except IndexNotExistException:
            info.update({"index": None})
            return info
        
        info.update({"index": index})
        return info

    def get_num_data(self):
        """return total number of entities in the collection"""

        return self.collection.num_entities

    def insert(self, vector):
        """insert vector data to milvus, return corresponding milvus id"""
        
        data = [[vector]]
        milvus_id = self.collection.insert(data).primary_keys[0]
        
        loguru.logger.log("INFO", f"Data {milvus_id} inserted to milvus")

        return str(milvus_id)

    def search(self, vector, query=None, limit=None, **kwargs):
        """
        find data in milvus, could either just search or query

        Example of finding a vector with top 20 result
        twitter_milvus_data.search(search_vector, limit=20)

        return:
        ["['(distance: 352.6655578613281, id: 430561433697124411)']"]


        Example of querying, say if you want both the id and vectors to be returned
        query_params = {
            "expr": "id in [430561433697124411, 430561433697124412]",
            "output_fields":[
                "id",
                "vector"
            ]
        }
        test_ig.search(test_data, query=True, **query_params)
        
        return:
        [(315.86199951171875, 430975514234356189), (318.6726379394531, 431128056666907805), (321.6065673828125, 430801468020348299), (321.60906982421875, 431012175518192417), (323.0221252441406, 431146529888725529), (323.29766845703125, 430935984020142225), (323.8021545410156, 430935984020315889), (324.35614013671875, 431146529888855749), (325.51141357421875, 431012175518300073), (325.7296447753906, 431050733872928033)]

        refer https://milvus.io/docs/search.md and https://milvus.io/docs/query.md
        """

        self.collection.load()
        limit = limit or 10

        if query:
            results = self.collection.query(expr=kwargs['expr'], output_fields=kwargs['output_fields'])
            return results
        
        search_params = {"metric_type": "L2", "params": {"nprobe": 12}}
        results = [
            (result.distance, result.id) for result in
            self.collection.search([vector], "vector", param=search_params, limit=limit)[0]
        ]

        return results

    def delete(self):
        """
        delete the whole collection, since milvus doesn't support delete by entities yet
        i know, its crazy.
        """

        self.collection.drop()