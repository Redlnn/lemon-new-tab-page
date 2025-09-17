import { browser } from 'wxt/browser'

const changelogZH = (
  <section>
    <h2>
      <u>重要提示❗</u>
    </h2>
    <p>
      当你从&lt;2.3.0的版本升级到≥2.3.0时，搜索框排版及其功能可能会出现异常，但暂时未能完全复现，您可以在设置页面重新选择一次搜索引擎即可，谢谢您的理解
    </p>
    <h1>2.3.4 (2025-09-17)</h1>
    <h2>新特性✨</h2>
    <ul>
      <li>新增性能设置，可关闭高性能占用效果以在中低性能设备上获得更好的体验</li>
    </ul>
    <h2>修复🐛</h2>
    <ul>
      <li>修复时间小字体时间不居中的问题</li>
    </ul>
    <h1>2.3.3 (2025-09-13)</h1>
    <h2>修复🐛</h2>
    <ul>
      <li>修复时间小字体时间不居中的问题</li>
      <li>修复部分对话框未国际化</li>
    </ul>
    <h1>2.3.2 (2025-09-07)</h1>
    <h2>新特性✨</h2>
    <ul>
      <li>
        新增支持分别设置浅色与深色模式壁纸
        <blockquote>当没有独立设置深色模式壁纸的时候会回退使用浅色模式的壁纸</blockquote>
      </li>
      <li>新增支持删掉已选择的背景图片</li>
    </ul>
    <h2>修复🐛</h2>
    <ul>
      <li>修复重置插件数据时未清空所有缓存的问题</li>
      <li>修复“添加快速访问”按钮背景模糊不生效的问题</li>
    </ul>
    <h1>2.3.1 (2025/09/02)</h1>
    <p>
      🎉
      柠檬起始页诞生满一年啦！这一年里，它从一个小小的个人项目，慢慢成长为能陪伴大家的工具。感谢一路以来的支持和反馈，有你们它才会变得更好，期待未来ta也能继续陪伴着你！
    </p>
    <h2>修复🐛</h2>
    <ul>
      <li>修复图标阴影开关状态异常及不生效的问题</li>
      <li>修复快速访问设置页的间隔问题</li>
    </ul>
    <h2>调整⚡️</h2>
    <ul>
      <li>清理了一些冗余代码</li>
    </ul>
    <h1>2.3.0 (2025/09/01)</h1>
    <h2>新特性✨</h2>
    <ul>
      <li>可以将时钟字体改为小号字体（和 AM/PM 一样大）</li>
      <li>可自定义搜索框占位符</li>
      <li>新增搜索引擎设置页</li>
      <li>支持导入与导出配置文件，方便备份和迁移设置</li>
      <li>“一言”增强：增加缓存、可切换 API</li>
      <li>“一言”新增可常驻显示</li>
      <li>“一言”可开关阴影，调整反色</li>
      <li>快速访问图标及文字阴影可开关</li>
      <li>
        省电模式（可以禁止时间分隔符闪烁）
        <blockquote>应该不会有人一直挂着新标签页不关吧？</blockquote>
      </li>
    </ul>
    <h2>调整⚡️</h2>
    <ul>
      <li>由于各浏览器策略影响，自动聚焦搜索框一直无法正常工作，故更改描述为“默认展开搜索框”</li>
      <li>调整各处文字、搜索框的阴影，新增快捷方式阴影，以提升观感</li>
      <li>UI、UX、动画细节调整，提升使用体验</li>
      <li>移动设置中的关于内容到新的关于页面</li>
      <li>新的关于页、搜索引擎设置页与设置页共用右下角入口</li>
    </ul>
    <h2>修复🐛</h2>
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
    <h2>Important Notice❗</h2>
    <p>
      When upgrading from a version &lt;2.3.0 to ≥2.3.0, the search box appearance and functionality
      may appear abnormal. However, this issue has not been fully reproduced yet. You can reselect
      the search engine in the settings page to resolve it. Thank you for your understanding.
    </p>
    <h1>2.3.4 (Sep 17, 2025)</h1>
    <h2>New Features ✨</h2>
    <ul>
      <li>
        Added performance settings to disable high-performance effects for a better experience on
        low- and mid-range devices
      </li>
    </ul>
    <h2>Fixes 🐛</h2>
    <ul>
      <li>Fix the issue where the clock is not centered when "Small Time Font" is turned on</li>
    </ul>
    <h1>2.3.3 (Sep 13, 2025)</h1>
    <h2>Fixes 🐛</h2>
    <ul>
      <li>Fix the issue where the clock is not centered when "Small Time Font" is turned on</li>
      <li>Fix some dialogs that are not internationalized</li>
    </ul>
    <h1>2.3.2 (Sep 07, 2025)</h1>
    <h2>New Features ✨</h2>
    <ul>
      <li>
        Added support for setting separate wallpapers for light and dark modes
        <blockquote>
          If no dark mode wallpaper is set, the light mode wallpaper will be used as a fallback
        </blockquote>
      </li>
      <li>Added the ability to delete selected background images</li>
    </ul>
    <h2>Fixes 🐛</h2>
    <ul>
      <li>Fixed an issue where resetting the extension data did not clear all caches</li>
      <li>Fixed an issue where the "Add Quick Access" button's background blur was not applied</li>
    </ul>
    <h1>2.3.1 (Sep 02, 2025)</h1>
    <p>
      🎉 Today marks the first anniversary of Lemon New Tab — and thankfully, it didn’t crash and
      burn along the way! Huge thanks to everyone who supported, and tested it (in the best way).
      Here’s to another year of making your browsing better!
    </p>
    <h2>Fixes 🐛</h2>
    <ul>
      <li>Fixed abnormal state and ineffective issues with icon shadow toggle</li>
      <li>Fixed spacing issues on the quick access settings page</li>
    </ul>
    <h2>Adjustments⚡️</h2>
    <ul>
      <li>Cleaned up some redundant code</li>
    </ul>
    <h1>2.3.0 (Sep 01, 2025)</h1>
    <h2>Features✨</h2>
    <ul>
      <li>Option to change the clock font to a smaller size (same as AM/PM)</li>
      <li>Customizable search box placeholder</li>
      <li>Added search engine settings page</li>
      <li>Support for importing and exporting configuration files for easy backup and migration</li>
      <li>Enhanced quote feature: added caching and switchable APIs</li>
      <li>New option to keep quote always visible</li>
      <li>New option to keep quote always visible</li>
      <li>Quote supports toggling shadows and adjusting inverse colors</li>
      <li>
        Power-saving mode (can disable blinking time separator)
        <blockquote>Probably no one keeps the new tab page open forever, right?</blockquote>
      </li>
    </ul>
    <h2>Adjustments⚡️</h2>
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
    <h2>Fixes🐛</h2>
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
