const HELP_CENTER_ACCESS_KEY = 'help-center-access-granted'

export const isHelpCenterAccessGranted = () => {
  return window.sessionStorage.getItem(HELP_CENTER_ACCESS_KEY) === 'true'
}

export const grantHelpCenterAccess = () => {
  window.sessionStorage.setItem(HELP_CENTER_ACCESS_KEY, 'true')
}

export const revokeHelpCenterAccess = () => {
  window.sessionStorage.removeItem(HELP_CENTER_ACCESS_KEY)
}
