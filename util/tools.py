import os
import time
import loguru
import string 
import re 
import json
import sys
import smtplib
import datetime
import hashlib
from dateutil import tz
from email.mime.text import MIMEText
import pickle
import redis
import rq
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from functools import partial
from rq.command import send_stop_job_command

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from configs.config import *
from src.search import *

class MeepoSerializer:
    dumps = partial(pickle.dumps, protocol=4)
    loads = pickle.loads

class RedisLib():
    """Redis library and tools"""

    def redis_server(self):
        """ Return the Redis server from the pool """

        return redis.Redis(connection_pool=redis.ConnectionPool(
            host=BASE_SERVER_IP, port=REDIS_PORT, password=REDIS_PASSWORD))
        
    def __init__(self):
        self.server = self.redis_server()
    
    def redis_queue(self, *args, **kwargs):
        """ Return a Redis queue instance """

        return rq.Queue(*args, **kwargs, connection=self.server, serializer=MeepoSerializer)
    
    def job_status(self, job_id):
        """ Get Job Status """

        try:
            job = rq.job.Job.fetch(job_id, connection=self.server)
        except rq.exceptions.NoSuchJobError:
            return {
                'status': f'No job with ID {job_id}'
            }

        return {
            'status': job.get_status(),
            'origin': job.origin,
            'func_name': job.func_name,
            'args': str(job.args),
            'kwargs': str(job.kwargs),
            'meta': job.meta,
            'result': job.result,
            'enqueued_at': job.enqueued_at,
            'started_at': job.started_at,
            'ended_at': job.ended_at,
            'exc_info': job.exc_info.split('\n') if job.exc_info else '',
            'worker_name': job.worker_name,
            'position': job.get_position()
        }

    def job_cancel(self, job_id):
        """Kill a job"""

        try:
            job = rq.job.Job.fetch(job_id, connection=self.server)
            if job.is_started:
                send_stop_job_command(self.server, job_id)
            else:
                job.cancel()
            return {
                'succ': True,
                'status': f'Job cancelled {job_id}'
            }
        except rq.exceptions.NoSuchJobError:
            return {
                'succ': False,
                'status': f'No job with ID {job_id}'
            }

    def redis_put(self, appid, key, src, value):
        """ Put information into redis key """

        self.server.client_setname('redput')
        key = f'{appid}:{key}:{src}'
        self.server.lpush(key, value)

    def redis_get(self, appid, key, src):
        """ Get information from redis """
      
        self.server.client_setname('redget')
        key = f'{appid}:{key}:{src}'
        msgs = self.server.lrange(key, 0, 0)
        if len(msgs) == 1:
            return msgs[0].decode('utf-8')
        else:
            return ''

    
def remove_emoji(text):
    """Remove all emojis in a file path"""

    regrex_pattern = re.compile(pattern="["
                                u"\U0001F600-\U0001F64F"  # emoticons
                                u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                                u"\U0001F680-\U0001F6FF"  # transport & map symbols
                                # flags (iOS)
                                u"\U0001F1E0-\U0001F1FF"
                                "]+", flags=re.UNICODE)
    return regrex_pattern.sub(r'', text)


def normalize_filename(title):
    """Normalize filename/pathname and exclude all non-ascii chars"""

    title = remove_emoji(title)
    title = title.translate(title.maketrans(
        string.punctuation, "_"*len(string.punctuation)))
    title = title.translate(title.maketrans(
        string.whitespace, "_"*len(string.whitespace)))
    return title

def has_extension(filename, exts):
    """check if file has a specific extension"""

    return os.path.splitext(filename)[1].lower() in exts

def is_image(file):
    """check if the file is an image"""

    return has_extension(file, ['.bmp', '.dib', '.png', '.jpg', '.jpeg', 
                        '.pbm', '.pgm', '.ppm', '.tif', '.tiff', '.webp', '.jfif'])


def is_video(file):
    """check if the file is a video"""

    return has_extension(file, ['.flv', '.mp4', '.mov', '.mkv', '.avi',
                            '.rmvb', '.webm', '.ts'])

def fname(path):
    """return only the filename without the ext and prefix path"""

    if '/' in path:
        filename, _ = os.path.splitext(path.split("/")[-1])
        return filename
    
    filename, _ = os.path.splitext(path)
    return filename

def get_image_size(img):
    """return image size"""
    
    ffprobe_cmd = f"ffprobe -v error -show_entries stream=width,height -of default=noprint_wrappers=1 {img}"
    size = os.popen(ffprobe_cmd).read().split("\n")
    width = size[0].split("=")[-1]
    height = size[1].split("=")[-1]

    result = {
        "width": width,
        "height": height
    }

    return result

def get_local_time(timezone):
    """get local time for timezone, in a format of 'America/Los_Angeles'"""
    
    local_time = tz.gettz(timezone)
    return datetime.datetime.now(tz=local_time)

def parse_value(data):
    """Convert a string to object"""
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except (TypeError, json.decoder.JSONDecodeError):
            pass
    return data

def send_warning(msg, recievers):
    """Send the input email a warning msg using smtp"""
    
    sender = WARN_EMAIL
    body = msg
    msg = MIMEText(body, 'plain')
    time = get_local_time('America/Los_Angeles')
    msg["Subject"] = f"Meepoer Warning at {time}"
    msg["From"] = sender
    msg["To"] = ','.join(recievers)

    try:
        smtp_conn = smtplib.SMTP_SSL(host=SMTP_SERVER)
        smtp_conn.login(user=sender, password=WARN_EMAIL_SECRET)
        smtp_conn.sendmail(sender, recievers, msg.as_string())
        loguru.logger.log("INFO", "warning sent sucessfully")
        smtp_conn.quit()
    except Exception as e:
        loguru.logger.log("WARNING", "failed to send warning to emails")
        loguru.logger.log("WARNING", str(e))

class S3Tools():
    """S3 utility tools"""

    def __init__(self, client):
        self.client = client
    
    def upload_s3(self, src, bucket, dst, content_type=None):
        """Upload the file to the spcefied bucket and dst path on S3"""
        from botocore.exceptions import NoCredentialsError

        if not content_type:
            content_type = ""
        try:
            time.sleep(0.01)
            self.client.upload_file(src, bucket, dst, {"ContentType":content_type})
            loguru.logger.log("INFO", f"{src} uploaded to S3 {bucket}/{dst} successfully")
            os.remove(src)
        except FileNotFoundError:
            loguru.logger.log("INFO", "Src file Not Found...")
        except NoCredentialsError:
            loguru.logger.log("INFO", "S3 Client Not Verified...")
    
    def list_file_abs(self, bucket, src, suffix=None):
        """return a list of all files under bukcet/src including full path locally"""

        file_list = []
        paginator = self.client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=src, Delimiter=suffix)

        for page in pages:
            for content in page.get('Contents', []):
                 file_list.append(S3_PATH+'/'+content.get('Key'))
        
        return file_list
    
    def list_file_bucket(self, bucket, src, suffix=None):
        """return a list of all files under bucket/src excluding full path locally"""

        file_list = []
        paginator = self.client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=src, Delimiter=suffix)

        for page in pages:
            for content in page.get('Contents', []):
                 file_list.append(content.get('Key'))
        
        return file_list

    def list_folder_abs(self, bucket, src):
        """returns a list of current level folders under bucket/src including full path locally"""

        file_list = []
        paginator = self.client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=src, Delimiter='/')

        for page in pages:
            for content in page.get('CommonPrefixes', []):
                file_list.append(S3_PATH+'/'+content.get('Prefix'))

        return file_list
    
    def list_folder_bucket(self, bucket, src):
        """returns a list of current level folders under bucket/src excluding full path locally"""

        file_list = []
        paginator = self.client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=src, Delimiter='/')

        for page in pages:
            for content in page.get('CommonPrefixes', []):
                file_list.append(content.get('Prefix'))

        return file_list

def is_in_txt(file, target):
    """Returns boolean if target is in file.txt"""

    with open(file, 'r') as txt:
        lines = txt.readlines()
        for line in lines:
            if target in line:
                loguru.logger.log("INFO", f'{target} was found in {file}, skipping !!!! ')            
                return True

    loguru.logger.log("INFO", f'{target} is not found in {file}')
    return False

def md5(string):
    """Returns a md5 hashed string"""

    return hashlib.md5(string.encode('utf-8')).hexdigest()

def url_to_image(url):
    """convert an url into nd image array"""
    from urllib.request import urlopen
    from urllib.parse import quote

    import cv2
    print(url)
    try:
        non_idna_str = url.split("https://")[1]
        resp = urlopen("https://"+quote(non_idna_str))
    except Exception as e:
        loguru.logger.log("WARNING", "Error while attempting to open the url "+str(e))
        return np.array([])
    
    try:
        image = np.asarray(bytearray(resp.read()), dtype="uint8")
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    except Exception as e:
        loguru.logger.log("WARNING", "Error while attempting to decode image "+str(e))
        return np.array([])

    if image is None:
        return np.array([])
    return image

def remove_url_in_str(text_str): 
    regexurl = r'(https?://[^\s]+)'

    return "".join([element for element in re.split(regexurl, text_str) if not element.startswith('https://')])


def remove_dup_img(combined_d):
    """Removes potential duplicate images by filtering posts with similar text fields.
       combined_d is a list of dicts (posts)
    """
    
    texts = [remove_url_in_str(data['text']) for data in combined_d]

    stemmer = nltk.stem.porter.PorterStemmer()
    remove_punctuation_map = dict((ord(char), None) for char in string.punctuation)

    def stem_tokens(tokens):
        return [stemmer.stem(item) for item in tokens]

    '''remove punctuation, lowercase, stem'''
    def normalize(text):
        return stem_tokens(nltk.word_tokenize(text.lower().translate(remove_punctuation_map)))

    vectorizer = TfidfVectorizer(tokenizer=normalize, stop_words='english')

    tfidf = vectorizer.fit_transform(texts)
    
    arr = (tfidf * tfidf.T).A

    def check_sim (array):
        pairs = []
        for idx, element in np.ndenumerate(array):
            if element > 0.90 and (idx[0] != idx[1]):
                if idx[0] < idx[1]:
                    pairs.append((idx[0], idx[1]))
                else: 
                    pairs.append((idx[1], idx[0]))
        return set(pairs)

    pairs = check_sim(arr)


    for pair in pairs:
        combined_d[pair[1]] = ""

    return [value for value in combined_d if value != ""]

def remove_filler_words(text):
    """Remove filler words from a text"""

    str_without_stopwords = " "
    text_tokens = nltk.word_tokenize(text.lower())
    return str_without_stopwords.join([word for word in text_tokens if not word in stopwords.words()])