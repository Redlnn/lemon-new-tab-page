/** @deprecated */
export enum OldBgType {
  none,
  Local,
  Bing,
  Online
}

export enum BgType {
  None = 'none',
  Local = 'local',
  Bing = 'bing',
  Online = 'online'
}

export enum ClockSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

/**
 * - Normal: 400
 * - Medium: 500
 * - Bold: 600
 * - ExtraBold: 700
 * - Heavy: 800
 * - Black: 900
 */
export enum ClockWeight {
  Normal = 'normal',
  Medium = 'medium',
  Bold = 'bold',
  ExtraBold = 'extra-bold',
  Heavy = 'heavy',
  Black = 'black'
}

export enum DrawerDirection {
  ltr = 'ltr',
  rtl = 'rtl',
  ttb = 'ttb',
  btt = 'btt'
}

export enum SortMode {
  Original = 'original',
  NameAsc = 'name-asc',
  NameDesc = 'name-desc',
  CreatedAsc = 'created-asc',
  CreatedDesc = 'created-desc',
  ModifiedAsc = 'modified-asc',
  ModifiedDesc = 'modified-desc'
}
