# To run this code, first edit config.py with your configuration, then:
#
# python twitter_couchdb_mel.py
#
# It will produce the list of tweets for the query "apple"
# in the file data/stream_apple.json

import tweepy
from tweepy import Stream
from tweepy import OAuthHandler
from tweepy.streaming import StreamListener
import time
import config
import json
import couchdb

class MyListener(StreamListener):

    def on_data(self, data):

        couchserver = couchdb.Server("http://team41:team41@127.0.0.1:5984")

        dbname = "twitter_mel"
        if dbname in couchserver:
            db = couchserver[dbname]
        else:
            db = couchserver.create(dbname)

        try:
            json_data = json.loads(data)
            db.save(json_data)
            return True


        except BaseException as e:
            print("Error on_data: %s" % str(e))
            time.sleep(5)
        return True

    def on_error(self, status):
        print(status)
        return True


if __name__ == '__main__':

    auth = OAuthHandler(config.consumer_key, config.consumer_secret)
    auth.set_access_token(config.access_token, config.access_secret)
    api = tweepy.API(auth)
    twitter_stream = Stream(auth, MyListener())

    mel = [144.59,-38.43,145.51,-37.51]
    syd = [150.52,-34.12,151.34,-33.58]
    vic = [140.96,-39.18,144.04,-33.98,144.04,-39.16,149.98,-35.91]    
    twitter_stream.filter(locations=mel)
