import json
import sys
from ytmusicapi import YTMusic
ytmusic = YTMusic()

functName = sys.argv[1]
query = sys.argv[2]
filter = sys.argv[3]


def searchAll(query):
    result = ytmusic.search(query=query)
    return json.dumps(result)


def searchFilter(query, filter):
    result = ytmusic.search(query=query, filter=filter)
    return json.dumps(result)


def getSong(query):
    result = ytmusic.get_song(videoId=query)
    return json.dumps(result)


def getArtist(query):
    result = ytmusic.get_artist(channelId=query)
    return json.dumps(result)


def getAlbum(query):
    result = ytmusic.get_album(browseId=query)
    return json.dumps(result)


def getPlaylist(query):
    result = ytmusic.get_playlist(playlistId=query)
    return json.dumps(result)


if (query == "empty" and filter == "empty"):
    print(locals()[functName]())
elif (filter == "empty"):
    print(locals()[functName](query))
else:
    print(locals()[functName](query, filter))
