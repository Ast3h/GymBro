"""
import requests
import json
url = "https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1/exercises?limit=200"

headers = {
	"x-rapidapi-key": "49c1769500msh7e6b64e98036f39p1c67c7jsndc84e87c2a31",
	"x-rapidapi-host": "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
all_ex = []
all_id = []
#print(response.json())
exercises = response.json()


i = 1
while(i!=201):
    for ex in exercises['data']:
        all_id.append(ex['exerciseId'])
        i = i +1
    
    url = "https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1/exercises?limit=200&after=" + all_id[-1]
    response = requests.get(url, headers=headers)
    exercises = response.json()
    
    
print(all_id)

i = 1
for id in all_id:
    url = "https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1/exercises/" + id
    response = requests.get(url, headers=headers)
    exercises = response.json()
    
    print(i)
    all_ex.append({
        "id" : i,
        "name": exercises['data']['name'],
        "bodyPart" : exercises['data']['bodyParts'],
        "videoUrl" : exercises['data']['videoUrl']
    })
    i = i +1
    
    

        
print(all_id)

with open("exercises.json", "w", encoding="utf-8") as f:
    json.dump(all_ex, f, indent=2, ensure_ascii=False)

"""

"""
for ex in exercises:
    print(ex['name'], ex['id'], ex['bodyPart'])
"""
###PRENDO GIF


"""
BACK
CALVES
CHEST
FOREARMS
HIPS
NECK
SHOULDERS
THIGHS
WAIST
HANDS
FEET
FACE
FULL BODY
BICEPS
UPPER ARMS
TRICEPS
HAMSTRINGS
QUADRICEPS
"""

"""

import json

# Mapping bodyPart → (macroPart, bodyPart italiano)
mapping = {
    'CHEST':      ('petto',   'petto'),
    'BACK':       ('dorso',   'schiena'),
    'SHOULDERS':  ('spalle',  'spalle'),
    'BICEPS':     ('braccia', 'bicipiti'),
    'TRICEPS':    ('braccia', 'tricipiti'),
    'UPPER ARMS': ('braccia', 'braccia'),
    'FOREARMS':   ('braccia', 'avambracci'),
    'QUADRICEPS': ('gambe',   'quadricipiti'),
    'HAMSTRINGS': ('gambe',   'femorali'),
    'THIGHS':     ('gambe',   'cosce'),
    'CALVES':     ('gambe',   'polpacci'),
    'HIPS':       ('gambe',   'glutei'),
}

# Questi li ignori
ignore = {'WAIST', 'FULL BODY', 'NECK', 'FACE', 'HANDS', 'FEET'}

with open('exercises.json', 'r') as f:
    exercises = json.load(f)

result = []
for ex in exercises:
    # Prendi la prima body part valida (non ignorata)
    macroPart = None
    bodyPartIta = None
    
    for bp in ex['bodyPart']:
        if bp in ignore:
            continue
        if bp in mapping:
            macroPart, bodyPartIta = mapping[bp]
            break
    
    if not macroPart:
        continue  # salta esercizi con solo body parts ignorate

    result.append({
        "id": ex["id"],
        "name": ex["name"],
        "bodyPart": bodyPartIta,
        "macroPart": macroPart,
        "videoUrl": ex["videoUrl"]
    })

with open('exercises_mapped.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"Salvati {len(result)} esercizi su {len(exercises)} totali")

"""


import sqlite3
import json

conn = sqlite3.connect('dev.db')
cursor = conn.cursor()

with open('/home/asteh/exercises_final.json', "r") as f:
    exercises = json.load(f)
    


for ex in exercises:
    cursor.execute("INSERT INTO Exercise (id, bodyPart, macroPart, name, nameIt, videoUrl) VALUES (?, ?, ?, ?, ?, ?)",
    (ex['id'], ex['bodyPart'], ex['macroPart'], ex['name'], ex['nameIta'], ex['videoUrl']))
    print("INSERT INTO Exercise (id, bodyPart, macroPart, name, nameIt, videoUrl) VALUES (?, ?, ?, ?, ?, ?)",
    (ex['id'], ex['bodyPart'], ex['macroPart'], ex['name'], ex['nameIta'], ex['videoUrl']))


conn.commit()

conn.close()