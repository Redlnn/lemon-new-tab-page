import { browser } from 'wxt/browser'
import { defineComponent, h } from 'vue'

const changelogZH = h('section', { class: 'update-content' }, [
  h('h1', null, '1.5.4'),
  h('h2', null, '新特性'),
  h('ul', null, [
    h('li', null, '支持显示日期和农历了'),
    h('li', null, '全新的设置窗口和更新日志窗口'),
    h('li', null, '使用 www.bing.com 而不是 cn.bing.com 避免后续使用 Bing 被重定向'),
    h('li', null, '现在可以改变背景遮罩的颜色了'),
    h('li', null, '现在可以关闭快捷访问区域的背景了'),
    h('li', null, '优化了关闭快速访问区域后搜索栏的位置')
  ]),
  h('h2', null, '修复'),
  h('ul', null, [
    h('li', null, '现在设置页的搜索引擎下拉可以显示完整的 Google 了'),
    h('li', null, '修复聚焦搜索栏时背景模糊被设置为固定数值'),
    h('li', null, '修复使用本地图片作为背景时在浏览器启动时卡死、吃很多 CPU 且内存泄漏的问题')
  ]),
  h('h1', null, '1.5.3'),
  h('h2', null, '新特性'),
  h('ul', null, [
    h('li', null, '部分重构以支持 Firefox 浏览器'),
    h('li', null, '支持缓存 Bing 每日一图'),
    h('li', null, '本地背景或已缓存的 Bing 壁纸新增进入动画'),
    h('li', null, '优化十二小时制时间表示'),
    h('li', null, '[i18n] 国际化支持')
  ]),
  h('h2', null, '修复'),
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
  h('h1', null, '1.5.4'),
  h('h2', null, 'New Features'),
  h('ul', null, [
    h('li', null, 'Now supports displaying dates'),
    h('li', null, 'New settings window and changelog window'),
    h(
      'li',
      null,
      'Use www.bing.com instead of cn.bing.com to avoid being redirected when using Bing'
    ),
    h('li', null, 'You can now change the color of the background mask'),
    h('li', null, 'You can now turn off the background of the shortcut area'),
    h('li', null, 'Optimized the position of the search bar afterdisabling the shortcut area')
  ]),
  h('h2', null, 'Fixes'),
  h('ul', null, [
    h(
      'li',
      null,
      'The search engine drop-down on the settings page now shows the full Google word'
    ),
    h(
      'li',
      null,
      'Fixed the background blur being set to a fixed value when focusing the search bar'
    ),
    h(
      'li',
      null,
      'Fixed the problem of using a local image as the background when the browser starts and freezes, consumes a lot of CPU and leaks memory'
    )
  ]),
  h('h1', null, '1.5.3'),
  h('h2', null, 'New Features'),
  h('ul', null, [
    h('li', null, 'Partial refactor to support Firefox browser'),
    h('li', null, 'Support for caching Bing daily image'),
    h('li', null, 'New entry animation for local backgrounds or cached Bing wallpapers'),
    h('li', null, 'Optimized 12-hour time format display'),
    h('li', null, '[i18n] Internationalization support')
  ]),
  h('h2', null, 'Fixes'),
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

const _ = browser.i18n.getUILanguage().startsWith('zh') ? changelogZH : changelog

export default defineComponent({
  setup() {
    return () => _
  }
})
