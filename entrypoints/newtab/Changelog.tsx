import { browser } from 'wxt/browser'

const changelogZH = (
  <section>
    <h1>1.7.0</h1>
    <h2>新特性</h2>
    <ul>
      <li>
        <b>更新了默认主题色和扩展图标</b>
      </li>
      <li>重点优化了繁中的翻译</li>
      <li>切换背景类型时增加渐变效果，网速或设备性能较差时仍然有可能看到新背景图突然跳出</li>
      <li>
        优化了纯色背景（背景类型设置为「无」）时的显示效果
        <div class="blockquote">
          <div>- 纯色背景时，时钟字体颜色反色</div>
          <div>- 纯色背景时，搜索框背景调整为静态纯白色并增加描边</div>
          <div>- 现在允许关闭时钟、搜索框、快速访问区域的阴影了</div>
        </div>
      </li>
    </ul>
    <h2>优化</h2>
    <ul>
      <li>调整加载背景的时机以避免在获取背景时卡住页面</li>
      <li>统一动画持续时间以获得更好的体验</li>
      <li>未获取到一言的时候不展示其容器</li>
      <li>获取 Bing 壁纸失败时报错</li>
    </ul>
    <h2>修复</h2>
    <ul>
      <li>修复了在设置页面多次切换壁纸类型后不展示壁纸预览图的问题</li>
    </ul>
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
    <h1>1.7.0</h1>
    <h2>Features</h2>
    <ul>
      <li>
        <b>Updated default theme colors and icons</b>
      </li>
      <li>Improved translation for zh_tw</li>
      <li>
        Added transition effects when switching background types. However, users with slow internet
        or low-performance devices may still notice the new background image appearing abruptly.
      </li>
      <li>
        Enhanced the display effect for solid color backgrounds (when the background type is set to
        "None")
        <div class="blockquote">
          <div>- Clock font color now inverts on solid color backgrounds</div>
          <div>- The search box background is now static pure white with an added outline</div>
          <div>
            - Added the option to disable shadows for the clock, search box, and quick access area
          </div>
        </div>
      </li>
    </ul>
    <h2>Improvements</h2>
    <ul>
      <li>
        Adjusted the timing of background loading to avoid freezing the page when fetching the
        background
      </li>
      <li>Standardized animation durations for a smoother experience</li>
      <li>Did not display the container for the quote when it was unavailable</li>
      <li>Show error message when failing to get Bing wallpaper</li>
    </ul>
    <h2>Fixes</h2>
    <ul>
      <li>
        Fixed the issue where wallpaper preview did not display after switching wallpaper types
        multiple times in the settings page
      </li>
    </ul>
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
        <li>Added support for customizing icons when adding pinned access</li>
        <li>You can now open the changelog again via the right-click settings button</li>
        <li>Improved visual experience when the color mode is set to follow the system</li>
        <li>Updated the default theme color and optimized the appearance of some components</li>
      </ul>
      <h2>Fixes</h2>
      <ul>
        <li>
          Fixed the issue where the browser would redirect Bing to the national region
          <div class="blockquote">
            <span>
              To restore non-national region access, you need to clear the *.bing.com cookies in
              your browser
            </span>
          </div>
        </li>
        <li>Reduced CPU usage</li>
        <li>
          Moved the settings initialization phase earlier to avoid seeing the default settings state
          when opening a new tab
        </li>
      </ul>
      <h1>1.5.4</h1>
      <h2>Features</h2>
      <ul>
        <li>Added support for displaying the date and Chinese lunar calendar</li>
        <li>Brand new settings window and changelog window</li>
        <li>Using www.bing.com instead of cn.bing.com to avoid redirection when using Bing</li>
        <li>Now you can change the background mask color</li>
        <li>Now you can disable the background of the quick access area</li>
        <li>Optimized the position of the search bar after closing the quick access area</li>
        <li>[Firefox] Now supports setting it as the homepage (#12)</li>
      </ul>
      <h2>Fixes</h2>
      <ul>
        <li>
          Now the search engine dropdown in the settings page can display the full name of Google
        </li>
        <li>
          Fixed the issue where the background blur was set to a fixed value when focusing the
          search bar
        </li>
        <li>
          Fixed the issue of browser freezing, high CPU usage, and memory leaks when using local
          images as backgrounds
        </li>
      </ul>
      <h1>1.5.3</h1>
      <h2>Features</h2>
      <ul>
        <li>Partial refactor to support Firefox browser</li>
        <li>Supports caching of Bing's daily image</li>
        <li>Added transition animation for local backgrounds or cached Bing wallpapers</li>
        <li>Optimized the display of the 12-hour clock format</li>
        <li>[i18n] Internationalization support</li>
      </ul>
      <h2>Fixes</h2>
      <ul>
        <li>Fixed the issue where unpinning did not take effect</li>
        <li>Fixed the issue where frequently visited sites could not be deleted (#8)</li>
        <li>Fixed the issue where the "Enable Most Visited" switch did not work</li>
        <li>Fixed the issue where duplicate bookmarks appeared after hiding most visited</li>
        <li>Hid Chrome-specific hints in Firefox browser</li>
        <li>
          Fixed the issue where search suggestion API candidates and icons could not be displayed
        </li>
        <li>Remove Herobrine</li>
      </ul>
    </details>
  </section>
)

const _ = browser.i18n.getUILanguage().startsWith('zh') ? changelogZH : changelog

export default _
