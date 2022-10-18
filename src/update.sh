# Based On The OneUpdater workflow, but heavily simplified for github releases
# https://github.com/vitorgalvao/alfred-workflows/tree/master/OneUpdater

# THESE VARIABLES MUST BE SET.
readonly github_repo='jsumners/alfred-emoji'
readonly frequency_check=${update_check_frequency:-1} # days

# FROM HERE ON, CODE SHOULD BE LEFT UNTOUCHED!
readonly info_plist='info.plist'

function abort {
  echo "${1}" >&2
  exit 1
}

function notification {
  osascript -e "display notification \"${1}\" with title \"${alfred_workflow_name}\" subtitle \"A new version is available\""
}

function semver_major_notification {
  osascript -e "display notification \"${1}\" with title \"${alfred_workflow_name}\" subtitle \"A new major version is available\""
}

function fetch_remote_version {
  curl --silent "https://api.github.com/repos/${github_repo}/releases/latest" | grep 'tag_name' | head -1 | sed -E 's/.*tag_name": "v?(.*)".*/\1/'
}

function fetch_download_url {
  curl --silent "https://api.github.com/repos/${github_repo}/releases/latest" | grep 'browser_download_url.*\.alfredworkflow"' | head -1 | sed -E 's/.*browser_download_url": "(.*)".*/\1/'
}

function download_and_install {
  readonly tmpfile="$(mktemp).alfredworkflow"
  notification 'Downloading and installing…'
  curl --silent --location --output "${tmpfile}" "${1}"
  open "${tmpfile}"
}

# Local sanity checks
[[ -n "${alfred_workflow_version}" ]] || abort "'alfred_workflow_version' must be set."
[[ -n "${alfred_workflow_name}" ]] || abort "'alfred_workflow_name' must be set."
[[ "${github_repo}" =~ ^.+\/.+$ ]] || abort "'github_repo' (${github_repo}) must be in the format 'username/repo'."
[[ "${frequency_check}" =~ ^[0-9]+$ ]] || abort "'frequency_check' (${frequency_check}) must be a number."

# Check for updates
if [[ $(find "${info_plist}" -mtime +"${frequency_check}"d) ]]; then
  REMOTE_VERSION=$(fetch_remote_version)
  CURRENT_MAJOR=$(echo "${alfred_workflow_version}" | cut -d'.' -f1)
  REMOTE_MAJOR=$(echo "${REMOTE_VERSION}" | cut -d'.' -f1)

  if [[ $(echo "${REMOTE_MAJOR} > ${CURRENT_MAJOR}") -eq 1 ]]; then
    semver_major_notification "alfred-emoji ${REMOTE_VERSION} is available. You have ${alfred_workflow_version}."
    touch "${info_plist}"
    exit 0
  fi

  if [[ "${alfred_workflow_version}" == "$(fetch_remote_version)" ]]; then
    touch "${info_plist}" # Reset timer by touching local file
    exit 0
  fi

  download_and_install "$(fetch_download_url)"
fi
