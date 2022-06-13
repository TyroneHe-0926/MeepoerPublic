import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from movienet.tools import PlaceExtractor, PersonDetector, PersonExtractor, ActionExtractor
import numpy as np
from configs.config import *

class FeatureExtractor():

    #default directory for mmlab models
    MODEL_DIR = HOME_PATH+"/Meepoer/movienet-tools/model"

    def __init__(self, model_dir=None):
        if model_dir:
            self.MODEL_DIR = model_dir

    place_weight_path = MODEL_DIR+'/resnet50_places365.pth'
    place_extractor = PlaceExtractor(place_weight_path, gpu=0)

    person_cfg = MODEL_DIR+'/cascade_rcnn_x101_64x4d_fpn.json'
    person_weight_det = MODEL_DIR+'/cascade_rcnn_x101_64x4d_fpn.pth'
    person_detector = PersonDetector('rcnn', person_cfg, person_weight_det)
    person_weight_ext = MODEL_DIR+'/resnet50_csm.pth'
    person_extractor = PersonExtractor(person_weight_ext, gpu=0)

    action_extractor = ActionExtractor()

    def extract_place_embedding(self, frame):
        """extract place embedding"""

        return self.place_extractor.extract(frame).tolist()

    def extract_person_embedding(self, frame, bbox):
        """extract person feature and bounding box for action extraction purpose 
        as well as indexing it into the json"""

        person_imgs = self.person_detector.crop_person(frame, bbox)

        return [self.person_extractor.extract(person).tolist() for person in person_imgs]

    def extract_person_bbox(self, frame):
        """extract just the person bbox of the frame"""

        return self.person_detector.detect(frame, show=False, conf_thr=0.96)

    def extract_action_embedding(self, frames, bboxes):
        """
        extract action embedding, frame should be an list
        """
        """
        needs the corresponding person bbox with each frame,
        these bboxes also needs to be normalized down to range(0,1)

        We should actually ditch this right now, since action feature needs temporal information
        to be accurate, we are only working with images right now. 
        """

        return [action_feat.tolist() for action_feat in self.action_extractor.extract(frames, bboxes)]

    def extract_audio_embedding(self):
        """extract audio embedding, ditch as of right now"""
        pass

    @staticmethod
    def normalize_bbox(bboxes, width, height):
        """normalize the frame bbox to range(0,1)"""

        def dw(x):
            return x/width

        def dh(y):
            return y/height

        functions = [dw, dh, dw, dh]
        normalized = []

        for bbox in bboxes:
            normalized = bbox[np.arange(bbox.size - 1)]

        normalized = [f(coord) for f, coord in zip(functions, normalized)]
        return np.array(normalized)