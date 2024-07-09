#!/bin/bash

TRANCENDENCE_NETWORK=""

docker-compose down -v

if [ -z $TRANCENDENCE_NETWORK]; then
    echo There is no network to free
fi

#docker rmi $(docker images -q)