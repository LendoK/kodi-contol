#!/bin/bash

# Required settings
host=192.168.178.28
port=9090

send_json()
{
    curl \
  -i \
	-X POST \
  -H "Accept: application/json" \
	-H "Content-Type: application/json; charset=UTF-8" \
  -H "Content-Length: 1234" \
	-d '{"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":"'"$1"'"}},"id":1}' \
	http://$host:$port/jsonrpc \
	|| error "Failed to send link - is Kodi running?"
}

# Dialog box?
input="$1"

nc -lp 1234< "$input" &
trap "kill $!" EXIT
	
url="tcp://192.168.178.27:1234"


# if [[ $input =~ \.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff)(\?.*)?$ ]]; then
#      url="$input"
# fi
#  & echo  "play from send"

send_json "$url" 

# Wait for netcat to exit
wait
# Don't kill netcat
trap - EXIT &&
