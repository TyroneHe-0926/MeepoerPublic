import json
import os
import sys
import loguru
import boto3
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from configs.config import *
from search_params import HASHTAGS
from util.tools import S3Tools, send_warning, get_local_time, is_in_txt

#connect to the s3 client
S3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
s3_tools = S3Tools(client=S3)

#number of posts to crawl under a hashtag
NUM_POSTS = "848"

#save to s3
def save(hashtag_dir):
    loguru.logger.log("INFO", f"Uploading {hashtag_dir} to S3")
    for root, _ , files in os.walk(hashtag_dir):
        for file in files:
            path = os.path.join(root, file)
            hashtag = root.split("/")[-1]
            if hashtag:
                if file.endswith(".jpg"):
                    s3_tools.upload_s3(path, "meepoerdata", f"instagram/{hashtag}/{file}", "image/jpeg")
                    loguru.logger.log("INFO", (f"{path} uploaded"))
                if file.endswith(".json"):
                    s3_tools.upload_s3(path, "meepoerdata", f"instagram/{hashtag}/{file}")
                    loguru.logger.log("INFO", (f"{path} uploaded"))

#init
def crawl():
    for hashtag in HASHTAGS:
        if not is_in_txt(f'{MEEPOER_PATH}/tmp/crawled_log_ig.txt', hashtag):
            data_folder = f"{IG_DATA_PATH}/{hashtag}"
            os.system(f"mkdir -p '{data_folder}'")
            loot_cmd = f"instalooter hashtag {hashtag} {data_folder} -n {NUM_POSTS} --dump-json --new"
            os.system(loot_cmd)
            save(data_folder)

            with open(f'{MEEPOER_PATH}/tmp/crawled_log_ig.txt', 'a') as crawling_log:
                    now = get_local_time('America/Los_Angeles')
                    crawling_log.write(f"LAST CRAWLED HASHTAG IS {hashtag} at {now} \n")

if __name__ == "__main__":
    recievers = ["q48he@uwaterloo.ca", "ben5zhang5@hotmail.com", "meepoer@126.com"]
    try:
        crawl()
    except Exception as e:
        msg = f'你好，\n\
                您的 Instagram 爬虫已经停止运行，请修好 !!!! \n\
                错误为 {e} \n\
                谢谢配合\n \
                Alpaca He\n'
        send_warning(msg, recievers)
        exit()

    msg = f'你好，\n\
        您的 Instagram 爬虫已完成运行，恭喜!!!!\n \
        谢谢配合 \n\
        Alpaca He\n'
    send_warning(msg,recievers)
    exit()