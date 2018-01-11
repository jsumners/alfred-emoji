# Based On The OneUpdater workflow, but heavily simplified for github releases
# https://github.com/vitorgalvao/alfred-workflows/tree/master/OneUpdater

# THESE VARIABLES MUST BE SET.
readonly github_repo='jsumners/alfred-emoji'
readonly frequency_check='1' # days

# FROM HERE ON, CODE SHOULD BE LEFT UNTOUCHED!
readonly info_plist='info.plist'

function abort {
  echo "${1}" >&2
  exit 1
}

function notification {
  osascript -e "display notification \"${1}\" with title \"${alfred_workflow_name}\" subtitle \"A new version is available\""
}

function fetch_remote_version {
  curl --silent "https://api.github.com/repos/${github_repo}/releases/latest" | grep 'tag_name' | head -1 | sed -E 's/.*tag_name": "v?(.*)".*/\1/'
}

function fetch_download_url {
  curl --silent "https://api.github.com/repos/${github_repo}/releases/latest" | grep 'browser_download_url.*\.alfredworkflow"' | head -1 | sed -E 's/.*browser_download_url": "(.*)".*/\1/'
}

function download_and_install {
  notification 'Downloading and installing…'
  curl --silent --location --output "${HOME}/Downloads/${alfred_workflow_name}.alfredworkflow" "${1}"
  open "${HOME}/Downloads/${alfred_workflow_name}.alfredworkflow"
}

# Local sanity checks
[[ -n "${alfred_workflow_version}" ]] || abort "'alfred_workflow_version' must be set."
[[ -n "${alfred_workflow_name}" ]] || abort "'alfred_workflow_name' must be set."
[[ "${github_repo}" =~ ^.+\/.+$ ]] || abort "'github_repo' (${github_repo}) must be in the format 'username/repo'."
[[ "${frequency_check}" =~ ^[0-9]+$ ]] || abort "'frequency_check' (${frequency_check}) must be a number."

# Check for updates
if [[ $(find "${info_plist}" -mtime +"${frequency_check}"d) ]]; then
  if [[ "${alfred_workflow_version}" == "$(fetch_remote_version)" ]]; then
    touch "${info_plist}" # Reset timer by touching local file
    exit 0
  fi

  download_and_install "$(fetch_download_url)"
fi
