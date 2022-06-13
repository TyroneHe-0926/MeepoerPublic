import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from util import (
    index_ig, index_twitter, index_reddit, 
)
import argparse
import loguru
from util.tools import send_warning

class falseUsageException(Exception):
    pass

def init():
    parser = argparse.ArgumentParser(
        description="This is for dataprocessing, currently supports twitter, reddit, and instagram, use --help for manual",
        formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('--source', help="eg. --source {twitter/reddit/instagram}")
    parser.add_argument('--path', help="data folder path, for s3 path is the dir after bucketname.")
    parser.add_argument('--data_type', help="index to ES from local data (local) or S3 data (s3)")
    parser.add_argument('--dst', help="to ES or Milvus")
    parser.add_argument('--page', help="which page of ES to request when indexing data into milvus")

    args = parser.parse_args()

    data_path = args.path
    source = args.source
    data_type = args.data_type
    dst = args.dst
    page = int(args.page) if args.page else 1
    
    if not data_path or not source:
        loguru.logger.log("ERROR","False usage, use --help to check the manual")
        raise falseUsageException
    
    try:
        if source == 'twitter':
            loguru.logger.log("INFO", "Indexing twitter data to ES")
            if data_type == 'local' and dst == 'es':
                index_twitter.index_from_local(data_path)
            if data_type == 's3' and dst == 'es':
                index_twitter.index_from_cloud(data_path)
            if data_type == 's3' and dst == 'milvus':
                from util import milvus_twitter
                milvus_twitter.index(page)
        if source == 'instagram':
            loguru.logger.log("INFO", "Indexing instagram data to ES")
            if data_type == 'local' and dst == 'es':
                index_ig.index_from_local(data_path)
            if data_type == 's3' and dst == 'es':
                index_ig.index_from_cloud(data_path)
            if data_type == 's3' and dst == 'milvus':
                from util import milvus_ig
                milvus_ig.index(page)
        if source == 'reddit':
            if data_type == 's3' and dst == 'milvus':
                loguru.logger.log("INFO", "Indexing reddit data to Milvus")
                from util import milvus_reddit
                milvus_reddit.index(page)
            if data_type == 's3' and dst == 'es':
                loguru.logger.log("INFO", "Indexing reddit data to ES")
                index_reddit.index_from_cloud(data_path)

    except Exception as e:
        recievers = ["q48he@uwaterloo.ca", "ben5zhang5@hotmail.com", "meepoer@126.com"]
        msg = f'你好，\n\
                Index Data 运行时遇到错误 \n\
                错误为 {e} \n\
                请进行查看 \n\
                谢谢配合\n \
                Alpaca He\n'
        send_warning(msg, recievers)
        exit()

if __name__ == "__main__":
    init()
