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

export enum ClockWeight {
  Normal = 'normal', // 400
  Medium = 'medium', // 500
  Bold = 'bold', // 600
  ExtraBold = 'extra-bold', // 700
  Heavy = 'heavy', // 800
  Black = 'black' // 900
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
