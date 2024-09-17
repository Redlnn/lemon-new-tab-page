import { browser } from 'wxt/browser'
import { defineComponent } from 'vue'

const changelogZH = (
  <section>
    <h1>1.5.4</h1>
    <h2>新特性</h2>
    <ul>
      <li>支持显示日期和农历了</li>
      <li>全新的设置窗口和更新日志窗口</li>
      <li>使用 www.bing.com 而不是 cn.bing.com 避免后续使用 Bing 被重定向</li>
      <li>现在可以改变背景遮罩的颜色了</li>
      <li>现在可以关闭快捷访问区域的背景了</li>
      <li>优化了关闭快速访问区域后搜索栏的位置</li>
    </ul>
    <h2>修复</h2>
    <ul>
      <li>现在设置页的搜索引擎下拉可以显示完整的 Google 了</li>
      <li>修复聚焦搜索栏时背景模糊被设置为固定数值</li>
      <li>修复使用本地图片作为背景时在浏览器启动时卡死、吃很多 CPU 且内存泄漏的问题</li>
    </ul>
    <h1>1.5.3</h1>
    <h2>新特性</h2>
    <ul>
      <li>部分重构以支持 Firefox 浏览器</li>
      <li>支持缓存 Bing 每日一图</li>
      <li>本地背景或已缓存的 Bing 壁纸新增进入动画</li>
      <li>优化十二小时制时间表示</li>
      <li>[i18n] 国际化支持</li>
    </ul>
    <h2>修复</h2>
    <ul>
      <li>修复撤销取消置顶不生效的问题</li>
      <li>修复无法删除经常访问的问题 (#8)</li>
      <li>修复【启用最常访问】开关不生效的问题</li>
      <li>修复隐藏最常访问后可能出现重复书签的问题</li>
      <li>在 Firefox 浏览器隐藏Chrome独有提示</li>
      <li>修复无法显示搜索建议API候选及无法显示图标的问题</li>
      <li>Remove Herobrine</li>
    </ul>
  </section>
)

const changelog = (
  <section>
    <h1>1.5.4</h1>
    <h2>New Features</h2>
    <ul>
      <li>Now supports displaying dates</li>
      <li>New settings window and changelog window</li>
      <li>Use www.bing.com instead of cn.bing.com to avoid being redirected when using Bing</li>
      <li>You can now change the color of the background mask</li>
      <li>You can now turn off the background of the shortcut area</li>
      <li>Optimized the position of the search bar afterdisabling the shortcut area</li>
    </ul>
    <h2>Fixes</h2>
    <ul>
      <li>The search engine drop-down on the settings page now shows the full Google word</li>
      <li>Fixed the background blur being set to a fixed value when focusing the search bar</li>
      <li>
        Fixed the problem of using a local image as the background when the browser starts and
        freezes, consumes a lot of CPU and leaks memory
      </li>
    </ul>
    <h1>1.5.3</h1>
    <h2>New Features</h2>
    <ul>
      <li>Partial refactor to support Firefox browser</li>
      <li>Support for caching Bing daily image</li>
      <li>New entry animation for local backgrounds or cached Bing wallpapers</li>
      <li>Optimized 12-hour time format display</li>
      <li>[i18n] Internationalization support</li>
    </ul>
    <h2>Fixes</h2>
    <ul>
      <li>Fixed issue where undoing unpin did not take effect</li>
      <li>Fixed issue where frequently visitedsites could not be deleted (#8)</li>
      <li>Fixed issue where "Enable Most Visited" switch did not take effect</li>
      <li>Fixed issue where hiding most visited sites could result in duplicate bookmarks</li>
      <li>Hide Chrome-specific prompts in Firefox browser</li>
      <li>Fixed issue where search suggestion API candidates and icons could not be displayed</li>
      <li>Remove Herobrine</li>
    </ul>
    <h5>Translate by Copilot.</h5>
  </section>
)

const _ = browser.i18n.getUILanguage().startsWith('zh') ? changelogZH : changelog

export default defineComponent({
  setup() {
    return () => _
  }
})
