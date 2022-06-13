import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask,request
from src.feature_extractor import FeatureExtractor
import numpy as np

Extractor = FeatureExtractor()
app = Flask(__name__)

@app.route("/model", methods=['POST'])
def load():
    app = request.json.get("app")
    print("Application: "+app)
    frame = np.array(request.json.get("frame"))

    if app == "extract_place_embedding":
        result = Extractor.extract_place_embedding(frame)
        print("Job finished got result")
        return {"result": result}

    if app == "extract_person_bbox":
        result = Extractor.extract_person_bbox(frame).tolist()
        print("Job finished got result")
        return {"result": result}

    if app == "extract_person_embedding":
        person_bboxes = np.array(request.json.get("person_bboxes"))
        print(person_bboxes)
        person_feat = Extractor.extract_person_embedding(frame, person_bboxes)
        print("Job finished got result")
        return {"result": person_feat}

    if app == "normalize_bbox":
        person_bboxes = np.array(request.json.get("person_bboxes"))
        frameWidth = request.json.get("frameWidth")
        frameHeight = request.json.get("frameHeight")
        result = Extractor.normalize_bbox(
            person_bboxes, frameWidth, frameHeight).tolist()
        print("Job finished got result")
        return {"result": result}

    if app == "extract_action_embedding":
        frame_list = request.json.get("frame_list")
        bboxes_list = request.json.get("bboxes_list")

        frame_ndarr = [np.array(each_frame) for each_frame in frame_list]
        bboxes_ndarr = [np.array(each_bbox) for each_bbox in bboxes_list]

        result = Extractor.extract_action_embedding(
            frame_ndarr, np.array(bboxes_ndarr))

        result_list = [
            each_result["action_feature"].tolist() for each_result in result]
        print("Job finished got result")
        return {"result": result_list}

    return {"result": "Invalid application type"}
