import { browser } from 'wxt/browser'

const changelogZH = (
  <section>
    <h1>1.8.1</h1>
    <h2>修复</h2>
    <ul>
      <li>修复JS未加载时背景色不跟随系统（或浏览器）的问题 (#19)</li>
      <li>修复“深色模式”与“跟随系统”开关的逻辑、动画问题</li>
    </ul>
    <details>
      <summary>过往版本更新日志</summary>
      <h1>1.8.0</h1>
      <h2>新特性</h2>
      <ul>
        <li>支持使用在线图片 API 作为壁纸</li>
        <li>添加了深色时钟字体的开关</li>
      </ul>
      <p>
        更多内容请前往 GitHub 查看。👉
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/Redlnn/lemon-new-tab-page/blob/master/CHANGELOG_zh.md"
        >
          点击跳转
        </a>
      </p>
    </details>
  </section>
)

const changelog = (
  <section>
    <h1>1.8.1</h1>
    <h2>Fixes</h2>
    <ul>
      <li>
        Fixed the issue that background color does not follow system (or browser) when JS is not
        loaded (#19)
      </li>
      <li>Fixed the logic and animation issues of "Dark mode" and "Follow system" switch</li>
    </ul>
    <details>
      <summary>Previous version updates</summary>
      <h1>1.8.0</h1>
      <h2>Features</h2>
      <ul>
        <li>You can now using online image APIs as wallpaper.</li>
        <li>Added a toggle for dark clock font.</li>
      </ul>
      <p>
        For more information, please visit GitHub.👉
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/Redlnn/lemon-new-tab-page/blob/master/CHANGELOG.md"
        >
          Click to view
        </a>
      </p>
    </details>
  </section>
)

const _ = browser.i18n.getUILanguage().startsWith('zh') ? changelogZH : changelog

export default _
