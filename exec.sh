#!/usr/bin/env bash

# parse args
scrape=0
compile=0
write=0

while getopts ":scw" opt; do
    case "$opt" in
    s)  scrape=1
        ;;
    c)  compile=1
        ;;
    w)  write=1
        ;;
    esac
done

# perform actions
if [ "$scrape" -gt "0" ]
then
    cd src && npm run scrape && cd ../
fi

if [ "$compile" -gt "0" ]
then
    cd src && npm run compile && cd ../
fi

if [ "$write" -gt "0" ]
then
    cd src && npm run build-db && cd ../
fi
