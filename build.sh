#!/bin/bash

PWD=$(pwd)

# this script's parent directory
cd $(dirname $0)
parentDir=$(pwd)

cd ${PWD}

npm run webpack

cd output

cp ${parentDir}/src/info.plist.xml ./info.plist

echo "Generating icons ..."
[ ! -d icons ] && mkdir icons
cd icons
node ${parentDir}/lib/genicons.js
cd ..

cp icons/beer.png ./icon.png

echo "Updating version ..."
curVersion=$(node -e "console.log(require('${parentDir}/package.json').version)")
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
