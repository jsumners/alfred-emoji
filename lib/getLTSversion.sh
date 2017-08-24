#!/bin/bash

type jq >/dev/null
if [ $? -ne 0 ]; then
  echo "Need jq -- https://stedolan.github.io/jq/"
  exit 1
fi

curdir=$(pwd)
cd $(dirname $0)
parentDir=$(pwd)
cd ${curdir}
curl -s https://nodejs.org/dist/index.json | \
  jq 'map(select(.lts != false)) | map(.version)' | \
  node ${parentDir}/latestLTS.js
