import type { SettingsInterfaceVer8, SettingsInterfaceVer9 } from '..'

function clockSizeToNumber(size: 'small' | 'medium' | 'large'): number {
  switch (size) {
    case 'small':
      return 40
    case 'medium':
      return 50
    case 'large':
      return 70
    default:
      return 50
  }
}

export function migrateFromVer8To9(oldSettings: SettingsInterfaceVer8): SettingsInterfaceVer9 {
  return {
    ...oldSettings,
    clock: {
      ...oldSettings.clock,
      size: clockSizeToNumber(oldSettings.clock.size)
    },
    version: 9
  }
}
