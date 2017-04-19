#!/bin/bash

# Required settings
host=192.168.178.28
port=9090


send_json_play()
{
    curl \
	${user:+--user "$user:$pass"} \
  -i \
	-X POST \
  -H "Accept: application/json" \
	-H "Content-Type: application/json; charset=UTF-8" \
  -H "Content-Length: 1234" \
	-d '{"jsonrpc": "2.0", "method": "Player.Stop", "params": { "playerid": 2 }, "id": 1}' \
	http://$host:$port/jsonrpc \
	|| error "Failed to send link - is Kodi running?"
}

send_json_play &