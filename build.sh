#!/bin/bash
set -e
# deterime if the script is sourced or executed
declare parentDir outputDir iconsDir
init_dirs() {
  # this script's parent directory
  parentDir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd || return)
  outputDir="${parentDir}/output"
  iconsDir="${outputDir}/icons"
  cd "${parentDir}" || return
  mkdir -p "${outputDir}"
  mkdir -p "${iconsDir}"
  # make sure macos tools take precedence
  PATH=/usr/bin:/bin:${PATH}
}
copy_info_plist() {
  echo "Copying info.plist ..."
  cp "${parentDir}/src/info.plist.xml" "${outputDir}/info.plist"
}
get_current_version() {
  local version
  version=$(node -e "console.log(require('${parentDir}/package.json').version)")
  echo "${version}"
}

generate_icons() {
  cd "${iconsDir}" || return
  echo "Generating icons ..."
  node "${parentDir}/lib/genicons.js"
  cd "${parentDir}" || return
  cp "${iconsDir}/beer_mug.png" "${outputDir}/icon.png"
}
create_emojis_pack() {
  echo "Creating emoji pack ..."
  node "${parentDir}/lib/genpack.js"
}
generate_jxa_source() {
  npm run webpack
}
update_version() {
  local curVersion
  curVersion=$(get_current_version)
  echo "Updating version ..."
  sed -i '' 's/{{version}}/'"${curVersion}"'/' "${outputDir}/info.plist"
}
inject_readme() {
  local readme
  readme="${parentDir}/src/Readme.md"
  echo "Injecting readme ..."
  sed -i '' -e "/{{readme}}/{r ${readme}" -e 'd' -e '}' "${outputDir}/info.plist"
}
inject_autoupdate_script() {
  local update
  update="$(mktemp)"
  sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' "${parentDir}/src/update.sh" > "${update}"
  echo "Injecting auto-update script ..."
  sed -i '' -e "/{{update_script}}/{r ${update}" -e 'd' -e '}' "${outputDir}/info.plist"
}
bundle_workflow() {
  echo "Bundling workflow ..."
  cd "${outputDir}" || return
  zip -Z deflate -rq9 "${parentDir}/alfred-emoji.alfredworkflow" -- * -x etc
  cd "${parentDir}" || return
}
main() {
  local run_func
  run_func="${1}"
  if [[ -z "${run_func}" ]]; then
    init_dirs
    copy_info_plist
    generate_icons
    create_emojis_pack
    generate_jxa_source
    update_version
    inject_readme
    inject_autoupdate_script
    bundle_workflow
  elif [[ -n "${run_func}" ]]; then
    init_dirs
    "${run_func}"
  fi
}
main "$@"
