#!/usr/bin/env bash

# parse args
scrape=0
compile=0
production=0

while getopts ":scp" opt; do
    case "$opt" in
    s)  scrape=1
        ;;
    c)  compile=1
        ;;
    p)  production=1
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

if [ "$production" -gt "0" ]
then
    cd src && npm run build-production-db && cd ../
else
    cd src && npm run build-local-db && cd ../
fi
