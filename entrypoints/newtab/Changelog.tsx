import { browser } from 'wxt/browser'

const changelogZH = (
  <section>
    <h1>2.0.0</h1>
    <p style="font-size:1.5em">重要：大版本升级，请仔细阅读以下更新日志。</p>
    <h2>已知问题</h2>
    <ul>
      <li>
        <span>
          部分 Windows 设备的 Chromium 内核浏览器设置启动页后会在启动时卡死，解决办法见&nbsp;
        </span>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/Redlnn/lemon-new-tab-page#%E5%B7%B2%E7%9F%A5%E9%97%AE%E9%A2%98"
        >
          README
        </a>
      </li>
    </ul>
    <h2>新特性</h2>
    <ul>
      <li>优化性能，提升打开速度，避免在部分情况下卡顿</li>
      <li>已置顶的快速访问链接现在可以通过拖动排序了</li>
      <li>
        重构了快速访问区域的排版样式，兼容性更强。
        <strong>由于该项重构，部分原有设置项已被重置，不便之处敬请原谅~</strong>
      </li>
      <li>
        重构了配置储存及内部版本迭代。
        <strong>由于该项重构，在配置升级时部分原有设置项可能会出现错乱，不便之处敬请原谅~</strong>
      </li>
      <li>
        新增“快捷访问在浅色模式下使用白色字体”、“图标间隔”的设置项，原有的“图标宽度”更改为“图标大小”
      </li>
      <li>
        调整页面响应式样式，防止缩小浏览器时错位，因此也支持在窄屏设备上使用（可惜 Firefox
        移动版不能替换新标签页）
      </li>
      <li>默认使用 Bing 作为搜索引擎</li>
    </ul>
    <h2>修复</h2>
    <ul>
      <li>修复搜索框展开后无法通过点击原快速访问区域使搜索框失焦的问题</li>
      <li>使时钟的字体设置应用于一言以提升神色模式下的页面观感</li>
      <li>修复快速启动子菜单部分区域点击不生效的问题</li>
    </ul>
    <p>
      Tip: 过往版本的更新内容请前往 GitHub 查看。👉
      <a
        target="_blank"
        rel="noreferrer"
        href="https://github.com/Redlnn/lemon-new-tab-page/blob/master/CHANGELOG_zh.md"
      >
        点击跳转
      </a>
    </p>
  </section>
)

const changelog = (
  <section>
    <h1>2.0.0</h1>
    <p style="font-size:1.5em">
      Important: Major version upgrade, please carefully read the following changelog.
    </p>
    <h2>Known Issues</h2>
    <ul>
      <li>
        <span>
          Some Windows devices may experience a freeze on startup when setting the Chromium-based
          browser’s homepage. The solution can be found in the&nbsp;
        </span>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/Redlnn/lemon-new-tab-page#%E5%B7%B2%E7%9F%A5%E9%97%AE%E9%A2%98"
        >
          README
        </a>
        .
      </li>
    </ul>
    <h2>Features</h2>
    <ul>
      <li>Optimized performance to improve opening speed and avoid lag in certain situations.</li>
      <li>Pinned quick access links can now be reordered by dragging.</li>
      <li>
        Refactored the layout style of the quick access area for better compatibility.&nbsp;
        <strong>
          Due to this refactoring, some existing settings may have been reset. We apologize for any
          inconvenience.
        </strong>
      </li>
      <li>
        Refactored configuration storage and internal version iterations.&nbsp;
        <strong>
          Due to this, some existing settings may be misaligned during configuration upgrades. We
          apologize for any inconvenience.
        </strong>
      </li>
      <li>
        Added options for “using white font in light mode for quick access” and “icon spacing”. The
        original “icon width” setting has been changed to “icon size”.
      </li>
      <li>
        "Adjust the page's responsive styles to prevent misalignment when shrinking the browser,
        thus supporting use on narrow-screen devices (unfortunately, Firefox mobile add-ons cannot
        replace the new tab page).
      </li>
      <li>Default search engine is now Bing.</li>
    </ul>
    <h2>Fixes</h2>
    <ul>
      <li>
        Fixed an issue where the search box could not lose focus by clicking the original quick
        access area after expanding.
      </li>
      <li>
        Applied clock font settings to the YiYan (a line of Chinese poetry) to improve page
        appearance in dark mode.
      </li>
      <li>Fixed an issue where clicks on some areas of the quick launch submenu did not work.</li>
    </ul>
    <p>Translated by ChatGPT from Chinese.</p>
    <p>
      Tip: To view the update details of previous versions, please visit GitHub. 👉
      <a
        target="_blank"
        rel="noreferrer"
        href="https://github.com/Redlnn/lemon-new-tab-page/blob/master/CHANGELOG_zh.md"
      >
        Click to redirect
      </a>
    </p>
  </section>
)

const _ = browser.i18n.getUILanguage().startsWith('zh') ? changelogZH : changelog

export default _
