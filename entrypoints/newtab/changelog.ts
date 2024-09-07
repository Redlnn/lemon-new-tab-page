import { browser } from 'wxt/browser'
import { h } from 'vue'

const changelogZH = h('section', { class: 'update-content' }, [
  h('h3', null, '新特性'),
  h('ul', null, [
    h('li', null, '部分重构以支持 Firefox 浏览器'),
    h('li', null, '支持缓存 Bing 每日一图'),
    h('li', null, '本地背景或已缓存的 Bing 壁纸新增进入动画'),
    h('li', null, '优化十二小时制时间表示'),
    h('li', null, '[i18n] 国际化支持')
  ]),
  h('h3', null, '修复'),
  h('ul', null, [
    h('li', null, '修复撤销取消置顶不生效的问题'),
    h('li', null, '修复无法删除经常访问的问题 (#8)'),
    h('li', null, '修复【启用最常访问】开关不生效的问题'),
    h('li', null, '修复隐藏最常访问后可能出现重复书签的问题'),
    h('li', null, '在 Firefox 浏览器隐藏Chrome独有提示'),
    h('li', null, '修复无法显示搜索建议API候选及无法显示图标的问题'),
    h('li', null, 'Remove Herobrine')
  ])
])

const changelog = h('section', { class: 'update-content' }, [
  h('h3', null, 'New Features'),
  h('ul', null, [
    h('li', null, 'Partial refactor to support Firefox browser'),
    h('li', null, 'Support for caching Bing daily image'),
    h('li', null, 'New entry animation for local backgrounds or cached Bing wallpapers'),
    h('li', null, 'Optimized 12-hour time format display'),
    h('li', null, '[i18n] Internationalization support')
  ]),
  h('h3', null, 'Fixes'),
  h('ul', null, [
    h('li', null, 'Fixed issue where undoing unpin did not take effect'),
    h('li', null, 'Fixed issue where frequently visited sites could not be deleted (#8)'),
    h('li', null, 'Fixed issue where "Enable Most Visited" switch did not take effect'),
    h(
      'li',
      null,
      'Fixed issue where hiding most visited sites could result in duplicate bookmarks'
    ),
    h('li', null, 'Hide Chrome-specific prompts in Firefox browser'),
    h(
      'li',
      null,
      'Fixed issue where search suggestion API candidates and icons could not be displayed'
    ),
    h('li', null, 'Remove Herobrine')
  ]),
  h('h5', null, 'Translate by Copilot.')
])

const _ = browser.i18n.getMessage('@@ui_locale').startsWith('zh') ? changelogZH : changelog

export default _
