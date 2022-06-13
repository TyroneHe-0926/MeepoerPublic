import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from util.tools import url_to_image
from configs.config import *
from src.search import (
    RedditData, RedditMilvusMapping, 
    RedditPersonCollection, RedditPlaceCollection
)
from src.feature_extractor import FeatureExtractor
from util import extraction_tools
import numpy as np
import loguru

def index(page):
    rd_data = RedditData()
    rd_mapping = RedditMilvusMapping()
    rd_person = RedditPersonCollection()
    rd_place = RedditPlaceCollection()
    extractor = FeatureExtractor()

    while True:
        es_results = rd_data.search({"deleted":"false"}, page_size=100, page=page)
        es_data = es_results['data']
        if not es_data:
            return
        
        for data in es_data:
            img_url = data['url']
            img_hash = data['img_id']
            rd_mapping.es_hash = img_hash
            if rd_mapping.exists():
                loguru.logger.log("WARNING", "Data already exists in mapping, skipping")
                continue
            
            img_ndarray = url_to_image(img_url)
            if img_ndarray.size == 0:
                loguru.logger.log("WARNING", "Couldn't open image url")
                continue

            place_feat = extractor.extract_place_embedding(img_ndarray)
            extraction_tools.save_place("reddit", rd_place, img_hash, place_feat)
            bboxes = extractor.extract_person_bbox(img_ndarray)
            if not bboxes.size == 0:
                for bbox in bboxes:
                    person_feat = extractor.extract_person_embedding(img_ndarray, np.array([(bbox)]))[0]
                    extraction_tools.save_person("reddit", rd_person, bbox, img_hash, person_feat)
        
        with open(MEEPOER_PATH+'/tmp'+'/milvus_rd_page.txt', 'w') as page_keeper:
            page_keeper.write(str(page))
        
        page += 1
