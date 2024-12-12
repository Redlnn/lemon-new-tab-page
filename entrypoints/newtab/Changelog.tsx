import { browser } from 'wxt/browser'

const changelogZH = (
  <section>
    <h1>1.6.1</h1>
    <h2>新特性</h2>
    <ul>
      <li>现在打开新标签页时可以直接聚焦搜索框了（默认关闭）</li>
    </ul>
    <h2>修复</h2>
    <ul>
      <li>修复了启动时看到快速访问区域跳动的问题</li>
      <li>优化了“添加快速访问”按钮的样式，鼠标不悬浮时降低不透明度</li>
    </ul>
    <details>
      <summary>过往版本更新日志</summary>
      <h1>1.6.0</h1>
      <h2>新特性</h2>
      <ul>
        <li>现在添加置顶访问时支持自定义图标了</li>
        <li>现在可以通过右键设置按钮再次打开更新日志了</li>
        <li>现在当颜色模式选择为跟随系统时更直观了</li>
        <li>更新了默认主题色，优化了部分组件外观</li>
      </ul>
      <h2>修复</h2>
      <ul>
        <li>
          再次修复会使得浏览器 Bing 跳转到国区的问题
          <div class="blockquote">
            <span>如需恢复非国区访问，需在浏览器中清理 *.bing.com 的 cookie</span>
          </div>
        </li>
        <li>降低 CPU 占用</li>
        <li>将设置初始化的阶段提前以避免刚打开新标签页时看到默认设置状态的问题</li>
      </ul>
      <h1>1.5.4</h1>
      <h2>新特性</h2>
      <ul>
        <li>支持显示日期和农历了</li>
        <li>全新的设置窗口和更新日志窗口</li>
        <li>使用 www.bing.com 而不是 cn.bing.com 避免后续使用 Bing 被重定向</li>
        <li>现在可以改变背景遮罩的颜色了</li>
        <li>现在可以关闭快捷访问区域的背景了</li>
        <li>优化了关闭快速访问区域后搜索栏的位置</li>
        <li>[Firefox] 现在支持将设置为主页了 (#12)</li>
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
    </details>
  </section>
)

const changelog = (
  <section>
    <h1>1.6.1</h1>
    <h2>Features</h2>
    <ul>
      <li>
        Now the search box can automatically focus when opening the new tab (disabled by default).
      </li>
    </ul>
    <h2>Fixes</h2>
    <ul>
      <li>
        Fixed the issue where the Quick Start area would flicker when loading the new tab page.
      </li>
      <li>
        Optimized the style of the "Add New Shortcut" button by reducing its opacity when the mouse
        is not hovering over it.
      </li>
    </ul>
    <details>
      <summary>Previous version updates</summary>
      <h1>1.6.0</h1>
      <h2>Features</h2>
      <ul>
        <li>Now you can set a custom icon when adding a shortcut.</li>
        <li>Now you can open the changelog dialog again by right-click the setting button.</li>
        <li>The color mode is now more intuitive when "Follow System" is selected.</li>
        <li>Changed the default theme color and improved the appearance of some components.</li>
      </ul>
      <h2>Fixes</h2>
      <ul>
        <li>
          Fixes again to make sure that the browser will not be redirected to the country specific
          version.
          <div class="blockquote">
            <span>
              If you have been redirected to the country specific version of Bing, you need to clear
              the cookies of *.bing.com in your browser
            </span>
          </div>
        </li>
        <li>Reduce CPU usage.</li>
        <li>
          Move the initialization phase of the setting to avoid seeing the default setting status
          when open new tab.
        </li>
      </ul>
      <h1>1.5.4</h1>
      <h2>Features</h2>
      <ul>
        <li>Now supports displaying dates.</li>
        <li>New settings window and changelog window.</li>
        <li>Use www.bing.com instead of cn.bing.com to avoid being redirected when using Bing.</li>
        <li>You can now change the color of the background mask.</li>
        <li>You can now turn off the background of the shortcut area.</li>
        <li>Optimized the position of the search bar afterdisabling the shortcut area.</li>
        <li>[Firefox] You can now set as the homepage. (#12)</li>
      </ul>
      <h2>Fixes</h2>
      <ul>
        <li>The search engine drop-down on the settings page now shows the full Google word.</li>
        <li>Fixed the background blur being set to a fixed value when focusing the search bar.</li>
        <li>
          Fixed the problem of using a local image as the background when the browser starts and
          freezes, consumes a lot of CPU and leaks memory.
        </li>
      </ul>
      <h1>1.5.3</h1>
      <h2>Features</h2>
      <ul>
        <li>Partial refactor to support Firefox browser.</li>
        <li>Support for caching Bing daily image.</li>
        <li>New entry animation for local backgrounds or cached Bing wallpapers.</li>
        <li>Optimized 12-hour time format display.</li>
        <li>[i18n] Internationalization support.</li>
      </ul>
      <h2>Fixes</h2>
      <ul>
        <li>Fixed issue where undoing unpin did not take effect.</li>
        <li>Fixed issue where frequently visitedsites could not be deleted (#8).</li>
        <li>Fixed issue where "Enable Most Visited" switch did not take effect.</li>
        <li>Fixed issue where hiding most visited sites could result in duplicate bookmarks.</li>
        <li>Hide Chrome-specific prompts in Firefox browser.</li>
        <li>
          Fixed issue where search suggestion API candidates and icons could not be displayed.
        </li>
        <li>Remove Herobrine.</li>
      </ul>
    </details>
    <h5>Translate by Copilot and Google Translate.</h5>
  </section>
)

const _ = browser.i18n.getUILanguage().startsWith('zh') ? changelogZH : changelog

export default _
