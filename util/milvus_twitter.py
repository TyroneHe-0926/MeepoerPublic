import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from util.tools import url_to_image
from configs.config import *
from src.search import (
    TwitterData, TwitterMilvusMapping, 
    TwitterPersonCollection, TwitterPlaceCollection
)
from src.feature_extractor import FeatureExtractor
from util import extraction_tools
import numpy as np
import loguru

def index(page):
    twitter_data = TwitterData()
    twitter_mapping = TwitterMilvusMapping()
    twitter_person = TwitterPersonCollection()
    twitter_place = TwitterPlaceCollection()
    extractor = FeatureExtractor()

    while True:
        es_results = twitter_data.search({"deleted":"false"}, page_size=100, page=page)
        es_data = es_results['data']
        if not es_data:
            return
        
        for data in es_data:
            img_url = data['url']
            img_hash = data['md5hash']
            twitter_mapping.es_hash = img_hash
            if twitter_mapping.exists():
                loguru.logger.log("WARNING", "Data already exists in mapping, skipping")
                continue
            
            img_ndarray = url_to_image(img_url)
            if img_ndarray.size == 0:
                loguru.logger.log("WARNING", "Couldn't open image url")
                continue

            place_feat = extractor.extract_place_embedding(img_ndarray)
            extraction_tools.save_place("twitter", twitter_place, img_hash, place_feat)
            bboxes = extractor.extract_person_bbox(img_ndarray)
            if not bboxes.size == 0:
                for bbox in bboxes:
                    person_feat = extractor.extract_person_embedding(img_ndarray, np.array([(bbox)]))[0]
                    extraction_tools.save_person("twitter", twitter_person, bbox, img_hash, person_feat)
        
        with open(MEEPOER_PATH+'/tmp'+'/milvus_twitter_page.txt', 'w') as page_keeper:
            page_keeper.write(str(page))
        
        page += 1