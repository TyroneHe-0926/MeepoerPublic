import sys
import os
import json
import praw
import boto3
import loguru
from math import ceil

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from configs.config import *
from util.search_params import SUBREDDITS
from util.tools import S3Tools, send_warning, get_local_time, is_in_txt

#initalize the s3 client
S3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
s3_tools = S3Tools(client=S3)

#initalize the praw reddit client
reddit = praw.Reddit(client_id=REDDIT_CLIENT_ID, 
                     client_secret=REDDIT_SECRET, 
                     user_agent="script by u/bben555")

def pick_resized_img(length):
    if length > 3:
        idx = ceil(length/2)+1
    else:
        idx = length-1
    return idx

def get_img_list_api(submission, gallery = False):
    """takes a submission with a gallery and return a list of image links to download"""

    all_attr = vars(submission)
    img_list = []

    if gallery:

        if all_attr.get('media_metadata'):
            for img_data in list(all_attr.get('media_metadata').values()):
                try: 
                    img_dims = img_data.get('p')
                    idx = pick_resized_img(len(img_dims))
                    scaled_img_data = img_dims[idx].get('u')
                    img_list.append(scaled_img_data)

                except Exception as e:
                    with open(f'{MEEPOER_PATH}/tmp/reddit_error_log.txt', 'a') as log:
                        now = get_local_time('America/Los_Angeles')
                        log.write(f'Error: {e} occured on {now} \n')
            return img_list

    else:

        try:

            if all_attr.get('preview'):

                resized_imgs = len(all_attr.get('preview').get('images')[0].get('resolutions'))

                if resized_imgs >= 1:
                    idx = pick_resized_img(resized_imgs)
                    scaled_img_data = all_attr.get('preview').get('images')[0].get('resolutions')[idx]
                    img_list.append(scaled_img_data.get('url'))

                    return img_list
        except Exception as e:
            with open(f'{MEEPOER_PATH}/tmp/reddit_error_log.txt', 'a') as log:
                now = get_local_time('America/Los_Angeles')
                log.write(f'Error: {e} occured on {now} \n')

def get_img_list(submission, gallery = False):
    """takes a submission with a gallery and return a list of image links to download"""

    all_attr = vars(submission)
    img_list = []

    if gallery:

        if all_attr.get('media_metadata'):
            for img_data in list(all_attr.get('media_metadata').values()):
                try: 
                    img_dims = img_data.get('p')
                    idx = pick_resized_img(len(img_dims))
                    scaled_img_data = {'url':img_dims[idx].get('u'), 'width':img_dims[idx].get('x'),
                                    'height': img_dims[idx].get('y'), 'id': img_data.get('id')}

                    url = scaled_img_data['url'].split('/')
                    scaled_img_data['id'] = url[3][:13]
                    scaled_img_data['ext'] = url[3][13:url[3].find('?')]
                    img_list.append(scaled_img_data)

                    return img_list
                except Exception as e:
                    with open(f'{MEEPOER_PATH}/tmp/reddit_error_log.txt', 'a') as log:
                        now = get_local_time('America/Los_Angeles')
                        log.write(f'Error: {e} occured on {now} \n')

    else:

        try:

            if all_attr.get('preview'):

                resized_imgs = len(all_attr.get('preview').get('images')[0].get('resolutions'))

                if resized_imgs >= 1:
                    idx = pick_resized_img(resized_imgs)
                    scaled_img_data = all_attr.get('preview').get('images')[0].get('resolutions')[idx]
                    url = scaled_img_data['url'].split('/')
                    scaled_img_data['id'] = url[3][:13]
                    scaled_img_data['ext'] = url[3][13:url[3].find('?')]
                    img_list.append(scaled_img_data)

                    return img_list
        except Exception as e:
            with open(f'{MEEPOER_PATH}/tmp/reddit_error_log.txt', 'a') as log:
                now = get_local_time('America/Los_Angeles')
                log.write(f'Error: {e} occured on {now} \n')


def save_submission(submission, subreddit, gallery=False):
    
    #make json depends on the img_list 
    img_ls = get_img_list(submission, gallery)
    all_attr = vars(submission)
    tmp_path = MEEPOER_PATH+'/tmp/'

    if submission.over_18:
        loguru.logger.log("INFO", "Found 18+ image, skipping...")
    elif len(all_attr) > 10 and img_ls:
            #create json for each image in post and upload to s3
            for img_data in img_ls:

                #other fields to be included
                fields = ['subreddit_name_prefixed', 'num_comments', 'upvote_ratio', 'score', 'title', 'created','ups']
                content = {k:v for k,v in all_attr.items() if k in fields}
                
                img_data.update(content)
                
                id = img_data['id']
                ext = img_data['ext']
                url = img_data.get('url')

                #save and upload JSON to s3 then delete locally
                if not url.endswith('.gif'):
                    with open(tmp_path + f'{id}.json', 'w') as w:
                        w.write(json.dumps(img_data, indent=4, sort_keys=True, ensure_ascii=False))
                
                    s3_tools.upload_s3(tmp_path + f'{id}.json', "meepoerdata", f"reddit/{subreddit}/{id}.json")
                
                    #save and upload image to s3 then delete locally
                    download_cmd = f"wget -O "+ tmp_path + f'{id}{ext} ' + f"'{url}'"
                    loguru.logger.log("INFO", f"Downloading {url} to tmp/{id}.jpg")
                    os.system(download_cmd)
                    
                    s3_tools.upload_s3(tmp_path + f'{id}{ext}', "meepoerdata", f"reddit/{subreddit}/{id}.jpg", "image/jpeg")

def reddit_crawl():
    """crawl a list of subreddits on reddit. 
    Image and JSON will be uploaded to s3"""

    #initalize the praw reddit client
    reddit = praw.Reddit(client_id=REDDIT_CLIENT_ID, 
                     client_secret=REDDIT_SECRET, 
                     user_agent="script by u/bben555")

    loguru.logger.log('INFO', "Reddit crawling has started!!")
    
    #run crawler under subreddit sorted by .hot .new .rising .top .controversial
    for subreddit in SUBREDDITS:
        try:
            if not is_in_txt(f'{MEEPOER_PATH}/tmp/crawled_reddit_log.txt', subreddit):
                subred = reddit.subreddit(subreddit)
                loguru.logger.log("INFO", f" ###Crawling under subreddit {subreddit}### ")
                if not subred.over18: 
                    #subred.rising(limit=None) and subred.new(limit=None) if not enough data
                    for submissions in [subred.hot(limit=None), subred.top(limit=None)]:
                        for submission in submissions:
                            if submission.url.endswith(('.jpg', '.png', '.jpeg')):
                                print(submission.permalink)
                                print('Single Pic')
                                save_submission(submission, subreddit, gallery=False)
                            if "/gallery/" in submission.url:
                                print(submission.permalink)
                                print('This is a Gallery')
                                save_submission(submission, subreddit, gallery=True)
                            
                    with open(f'{MEEPOER_PATH}/tmp/crawled_reddit_log.txt', 'a') as crawling_log:
                        now = get_local_time('America/Los_Angeles')
                        crawling_log.write(f"LAST CRAWLED REDDIT SEARCH IS {subreddit} at {now} \n")
        except Exception as e:
            with open(f'{MEEPOER_PATH}/tmp/reddit_error_log.txt', 'a') as log:
                now = get_local_time('America/Los_Angeles')
                log.write(f'Error: {e} occured on {now} \n')



if __name__ == "__main__":
    recievers = ["q48he@uwaterloo.ca", "ben5zhang5@hotmail.com", "meepoer@126.com"]
    try:
        reddit_crawl()
    except Exception as e:
        msg = f'你好，\n\
                您的reddit爬虫已经停止运行，请修好 !!!! \n\
                错误为 {e} \n\
                谢谢配合\n \
                Ben Zhang\n'
        send_warning(msg, recievers)
        exit()

    msg = f'你好，\n\
        您的reddit爬虫已完成运行，恭喜!!!!\n \
        谢谢配合 \n\
        Ben Zhang\n'
    send_warning(msg,recievers)
    exit()