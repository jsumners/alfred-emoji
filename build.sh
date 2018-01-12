#!/bin/bash

PWD=$(pwd)

# this script's parent directory
cd $(dirname $0)
parentDir=$(pwd)

cd ${PWD}

[ ! -d output ] && mkdir output
cd output

cp ${parentDir}/src/emoji.js .
cp ${parentDir}/src/search.js .
cp ${parentDir}/src/info.plist.xml ./info.plist

echo "Installing emojilib ..."
npm install --silent --prefix ./ emojilib
ltsVersion=$(${parentDir}/lib/getLTSversion.sh)
ltsURL="https://nodejs.org/dist/${ltsVersion}/node-${ltsVersion}-darwin-x64.tar.gz"

echo "Downloading node binary ..."
curl -sO ${ltsURL} && \
  tar zxf node-${ltsVersion}-darwin-x64.tar.gz && \
  cp ./node-${ltsVersion}-darwin-x64/bin/node . && \
  rm -rf node-${ltsVersion}-darwin-x64*

if [ $? -ne 0 ]; then
  echo "Failed to get node binary"
  exit 1
fi

echo "Generating icons ..."
[ ! -d icons ] && mkdir icons
cd icons
node ${parentDir}/lib/genicons.js
cd ..

cp icons/beer.png ./icon.png

echo "Updating version ..."
curVersion=$(cat ${parentDir}/package.json | jq '.version' | sed 's/"//g')
sed -i '' 's/{{version}}/'${curVersion}'/' info.plist

echo "Injecting readme ..."
readme="${parentDir}/src/Readme.md"
sed -i '' -e "/{{readme}}/{r ${readme}" -e 'd' -e '}' info.plist

echo "Injecting auto-update script ..."
update="$(mktemp)"
cat ${parentDir}/src/update.sh | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' > ${update}
sed -i '' -e "/{{update_script}}/{r ${update}" -e 'd' -e '}' info.plist

echo "Bundling workflow ..."
zip -Z deflate -rq9 ${parentDir}/alfred-emoji.alfredworkflow * -x etc
