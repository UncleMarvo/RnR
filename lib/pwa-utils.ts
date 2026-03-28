export function getDeviceType(): 'ios' | 'android' | 'desktop' | 'other' {
  if (typeof window === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Windows|Mac|Linux/.test(ua)) return 'desktop'
  return 'other'
}

export function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true
}

export function shouldShowInstallPrompt(): boolean {
  if (typeof window === 'undefined') return false
  if (isInStandaloneMode()) return false
  if (getDeviceType() === 'desktop') return false
  const dismissed = localStorage.getItem('rnr-install-prompted')
  return !dismissed
}

export function markInstallPrompted(): void {
  localStorage.setItem('rnr-install-prompted', 'true')
}
