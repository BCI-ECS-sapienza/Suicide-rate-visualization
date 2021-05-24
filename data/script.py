import pandas as pd 
import urllib, json

# this is a script to visualize the differences between
# states present in our database, but not in geojson and viceversa 
# we had to change some countries name in our dataset to 
# have a corrispondence with the geojson 

# creating a set from the data.csv
csv_f = pd.read_csv('data.csv')
countries = set(csv_f['country'].unique())

# creating a set from the geojson file
url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
response = urllib.urlopen(url)
data = json.loads(response.read())

countrySet = set()
for i in range(len(data["features"])):
    properties = countrySet.add(str(data["features"][i]["properties"]["name"]))

csv_countries = countries.difference(countrySet)
json_countries = countrySet.difference(countries)

print(len(csv_countries))
print(len(json_countries))

print(sorted(csv_countries))
print(sorted(json_countries))

