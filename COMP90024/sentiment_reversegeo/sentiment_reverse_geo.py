# ___json___
# curl -X PUT http://team41:team41@localhost:5984/twitter_json/_design/default -d '{"_id": "_design/default","language": "javascript","views": {"query": {"map":"function(doc) {if(doc.doc){emit(doc.doc[\"_id\"], [doc.doc[\"text\"],doc.doc.coordinates[\"coordinates\"]]);}}"}}}'
import couchdb
import json
import requests
from textblob import TextBlob
import reverse_geocoder as rg

HOMELESS = ["charity", "charities", "donate", "donation", "sympathy", "donator", "beneficence", "mercy", "Charitable", "kind-hearted", "benevolence", "kindness", "nonprofit", "non-profit", "harmonious", "harmony", "welfare", "happyness"]

CHILDREN = ["kid", "kids", "child", "children", "boy", "boys", "girl", "girls", "teen", "teens", "toy", "toys", "baby", "babysitter", "babies", "stroller","youth", "juveniles", "minor", "infant", "impubes"]

SB = ["sedentary", "colon cancer", "driving", "work all day", "computer games", "reading", "metabolic disorder", "atherosclerosis", "breast cancer", "arthritis", "osteoporosis", "depressed", "anxiety ","depression","high blood pressure", "cardiovascular", "pre-mature aging", "socially aloof","backache"]

user = "team41"
password = "team41"
couchserver = couchdb.Server("http://%s:%s@localhost:5984/" % (user, password))

db_retrieve = "twitter_json"
if db_retrieve in couchserver:
    db_r = couchserver[db_retrieve]
else:
    db_r = couchserver.create(db_retrieve)

# __________________sentiment_store___________________________

def have_keyword(text,keys):
    for key in keys:
        if key in text:
            return True
    return False

db_store = "overall_twitter"
if db_store in couchserver:
    db_s = couchserver[db_store]
else:
    db_s = couchserver.create(db_store)
i = 0
for item in db_r.view('default/query'):
    try:
        i+=1
        if i %1000 ==0:
            print("Json:",i)
        text = item.value[0]
        coordinates = item.value[1]
        # text,coordinates,sentiment,sent_value,sub,area = get_all(item)
        sent_value = TextBlob(text).sentiment.polarity
        if sent_value < -0.6:
            sent = 'very negative'
        elif -0.6 <= sent_value and sent_value < -0.2:
            sent = 'negative'
        elif -0.2 <= sent_value and sent_value < 0.2:
            sent = 'neutral'
        elif 0.2 <= sent_value and sent_value < 0.6:
            sent = 'positive'
        else:
            sent = 'very positive'
        # print(sent)

        longitude, latitude = coordinates

        results = rg.search([latitude,longitude])[0]
        sub_name = results['name']
        aal2 = results['admin2']

        hl = 0
        if have_keyword(text,HOMELESS):
            hl = 1

        ch = 0
        if have_keyword(text,CHILDREN):
            ch = 1

        sed = 0
        if have_keyword(text,SB):
            sed = 1

        afl = 0
        if have_keyword(text,['AFL']):
            afl = 1
        # db_s[item.key] = {'text': item.value[0], 'coordinates': item.value[1]}
        # db_s[item.key] = {'text':text, 'coordinates':coordinates,'sentiment':sent,'sentiment_value':sent_value}
        db_s[item.key] = {'text':text, 'coordinates':coordinates,'sentiment':sent,'sentiment_value':sent_value,'suberb':sub_name,'area':aal2,'homeless':hl,'children':ch,'sedentary_behaviour':sed,'afl':afl}
    except Exception:
        print('error has ocured ... ')
        pass