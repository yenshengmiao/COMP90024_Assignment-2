import couchdb
import json

couchserver = couchdb.Server("http://team41:team41@localhost:15984/")

db_store = "twitter_extract"
if db_store in couchserver:
    db_s = couchserver[db_store]
else:
    db_s = couchserver.create(db_store)

f = open('4.json', 'r')
line = f.readline()

while line:
    try:
        line = f.readline()
        db_s.save(json.loads(line[:-2]))
    except Exception:
        print('exception occured')