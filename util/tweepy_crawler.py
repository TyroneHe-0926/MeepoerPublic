import json
import os
import sys
import tweepy
import loguru
import boto3
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from configs.config import *
from search_params import HASHTAGS, SENSITIVE_HASHTAGS
from util.tools import S3Tools, send_warning, get_local_time, is_in_txt

#connect to the s3 client
S3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
s3_tools = S3Tools(client=S3)

#parse the media information from the meta json, returns a data list
def parse_media(media):
    image_list = []
    if not media:
        return image_list
    
    for item in media:
        if item.get("type") == "photo":
            img_id = item.get("id_str")
            img_url = item.get("media_url")
            data = {
                img_id: img_url
            }
            image_list.append(data)
    return image_list

#check for possible sensitivy in anywhere of the post
def get_sensitivity(result):
    sensitivity = result.get("possibly_sensitive")
    extended_sensitivity = False
    hashtag_sensitivity = False
    retweet_status = result.get("retweeted_status")
    if retweet_status:
        extended_sensitivity = retweet_status.get("possibly_sensitive")

    entities = result.get("entities")

    #filter out sensitive hashtags ourselves
    tweet_hashtags = entities.get("hashtags")
    for hashtag in tweet_hashtags:
        text = hashtag.get("text")
        if any(tag in text for tag in SENSITIVE_HASHTAGS):
            hashtag_sensitivity = True

    return {
        "sensitivity": sensitivity,
        "extended_sensitivity": extended_sensitivity,
        "hashtag_sensitivity": hashtag_sensitivity
    }


#save to the dst dir, with an og json file and the media images
def save(dst, result, hashtag):

    #download image
    def download_data(img_list):
        for data in img_list:
            for img_id, img_url in data.items():
                download_cmd = f"wget -O {dst}/{img_id}.jpg {img_url}"
                loguru.logger.log("INFO", f"Downloading {img_url} to {dst}/{img_id}.jpg")
                os.system(download_cmd)

                #upload image to s3 and delete image locally
                s3_tools.upload_s3(f"{dst}/{img_id}.jpg", "meepoerdata", f"twitter/{hashtag}/{img_id}.jpg", "image/jpeg")
                    
                #write json file
                json_file = open(f'{dst}/{img_id}.json', 'w')
                json_file.write(json.dumps(result, indent=4, sort_keys=True, ensure_ascii=False))
                json_file.close()

                #upload json to s3 and delete json locally
                s3_tools.upload_s3(f"{dst}/{img_id}.json", "meepoerdata", f"twitter/{hashtag}/{img_id}.json")
                
    #check for sensitive, we don't want pronography or hentai
    sensitivity = get_sensitivity(result)
    media_sensitivity = sensitivity.get("sensitivity")
    extended_sensitivity = sensitivity.get("extended_sensitivity")
    hashtag_sensitivity = sensitivity.get("hashtag_sensitivity")

    sencheck_failed = media_sensitivity or extended_sensitivity or hashtag_sensitivity
    if sencheck_failed:
        loguru.logger.log("INFO", "Result contains sensitive content, skipping ...")
        return

    entities = result.get("entities")
    media = entities.get("media")
    media_img_list = parse_media(media)

    download_data(media_img_list)

#initates crawling
def crawl():
    #authentication can be found in config.py
    tweets_per_q = 100
    total_tweets = 10000
    auth = tweepy.OAuthHandler(TWITTER_API_KEY, TWITTER_API_SECRET)
    auth.set_access_token(TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET)
    crawler = tweepy.API(auth, wait_on_rate_limit=True)

    #starts by going through our desired hashtag list
    for hashtag in HASHTAGS:
        if not is_in_txt(f'{MEEPOER_PATH}/tmp/crawled_log.txt', hashtag):
            current_tweets = 0
            max_id = -1
            dst_path = TWITTER_DATA_PATH+'/'+hashtag
            print(dst_path)
            os.system(f"mkdir -p '{dst_path}'")
            loguru.logger.log("INFO", f" ###Crawling under hashtag {hashtag}### ")
            while current_tweets < total_tweets:
                
                if max_id <= 0:
                    time.sleep(0.01)
                    search_result = crawler.search_tweets(q='#'+hashtag, count = tweets_per_q, 
                    result_type="mixed", tweet_mode="extended")
                else:
                    time.sleep(0.01)
                    search_result = crawler.search_tweets(q='#'+hashtag, count = tweets_per_q, max_id=str(max_id - 1),
                    result_type="mixed", tweet_mode="extended")

                if not search_result:
                    break

                for tweet in search_result:
                    save(dst_path, tweet._json, hashtag)


                current_tweets += len(search_result)
                max_id = search_result[-1].id

            with open(f'{MEEPOER_PATH}/tmp/crawled_log.txt', 'a') as crawling_log:
                now = get_local_time('America/Los_Angeles')
                crawling_log.write(f"LAST CRAWLED HASHTAG IS {hashtag} at {now} \n")


if __name__ == "__main__":
    recievers = ["q48he@uwaterloo.ca", "ben5zhang5@hotmail.com", "meepoer@126.com"]
    try:
        crawl()
    except Exception as e:
        msg = f'你好，\n\
                您的爬虫已经停止运行，请修好 !!!! \n\
                错误为 {e} \n\
                谢谢配合\n \
                Alpaca He\n'
        send_warning(msg, recievers)
        exit()

    msg = f'你好，\n\
        您的爬虫已完成运行，恭喜!!!!\n \
        谢谢配合 \n\
        Alpaca He\n'
    send_warning(msg,recievers)
    exit()