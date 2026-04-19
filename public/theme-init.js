// @ts-check
;(function () {
  const ls = localStorage.getItem('vueuse-color-scheme')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = ls === 'dark' || (ls !== 'light' && systemDark)
  const h = document.documentElement
  if (isDark) {
    h.classList.add('dark')
    h.style.colorScheme = 'dark'
    h.style.backgroundColor = '#0a0a0a'
  } else {
    h.classList.add('light')
    h.style.colorScheme = 'light'
    h.style.backgroundColor = '#f2f3f5'
  }
})()
