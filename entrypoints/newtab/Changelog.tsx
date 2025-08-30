import { browser } from 'wxt/browser'

const changelogZH = (
  <section>
    <h1>2.3.0 (WIP)</h1>
    <h2>新特性</h2>
    <ul>
      <li>可以将时钟字体改为小号字体（和 AM/PM 一样大）</li>
      <li>可自定义搜索框占位符</li>
      <li>新增搜索引擎设置页</li>
      <li>支持导入与导出配置文件，方便备份和迁移设置</li>
      <li>“一言”增强：增加缓存、可切换 API</li>
      <li>“一言”新增可常驻显示</li>
      <li>
        省电模式（可以禁止时间分隔符闪烁）
        <blockquote>应该不会有人一直挂着新标签页不关吧？</blockquote>
      </li>
    </ul>
    <h2>调整</h2>
    <ul>
      <li>由于各浏览器策略影响，自动聚焦搜索框一直无法正常工作，故更改描述为“默认展开搜索框”</li>
      <li>调整各处文字、搜索框的阴影，新增快捷方式阴影，以提升观感</li>
      <li>UI、UX、动画细节调整，提升使用体验</li>
      <li>移动设置中的关于内容到新的关于页面</li>
      <li>新的关于页、搜索引擎设置页与设置页共用右下角入口</li>
    </ul>
    <h2>修复</h2>
    <ul>
      <li>多处健壮性修复</li>
      <li>修复缺失翻译与其他若干小 bug。</li>
    </ul>
    <p>
      Tip: 过往版本的更新内容请前往 GitHub 查看。👉
      <a
        target="_blank"
        href="https://github.com/Redlnn/lemon-new-tab-page/blob/master/CHANGELOG_zh.md"
      >
        点击跳转
      </a>
    </p>
  </section>
)

const changelog = (
  <section>
    <h1>2.3.0 (WIP)</h1>
    <h2>Features</h2>
    <ul>
      <li>Option to change the clock font to a smaller size (same as AM/PM)</li>
      <li>Customizable search box placeholder</li>
      <li>Added search engine settings page</li>
      <li>Support for importing and exporting configuration files for easy backup and migration</li>
      <li>Enhanced "Hitokoto" feature: added caching and switchable APIs</li>
      <li>New option to keep "Hitokoto" always visible</li>
      <li>
        Power-saving mode (can disable blinking time separator)
        <blockquote>Probably no one keeps the new tab page open forever, right?</blockquote>
      </li>
    </ul>
    <h2>Adjustments</h2>
    <ul>
      <li>
        Due to browser policy restrictions, auto-focus on the search box has never worked properly,
        so the description has been changed to “Expand search box by default”
      </li>
      <li>
        Adjusted text and shadow effects for various elements, added shortcut shadows to enhance
        visual appeal
      </li>
      <li>UI, UX, and animation details adjustments to improve the user experience</li>
      <li>Moved the About section from Settings to a new dedicated About page</li>
      <li>
        The new About page and Search Engine Settings page share the bottom-right entry point with
        the main Settings page
      </li>
    </ul>
    <h2>Fixes</h2>
    <ul>
      <li>Multiple stability improvements</li>
      <li>Fixed missing translations and several minor bugs.</li>
    </ul>
    <p>Translated by ChatGPT from Chinese.</p>
    <p>
      Tip: To view the update details of previous versions, please visit GitHub. 👉
      <a
        target="_blank"
        href="https://github.com/Redlnn/lemon-new-tab-page/blob/master/CHANGELOG_zh.md"
      >
        Click to redirect
      </a>
    </p>
  </section>
)

const _ = browser.i18n.getUILanguage().startsWith('zh') ? changelogZH : changelog

export default _
