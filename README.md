![lemon-new-tab-page](https://socialify.git.ci/redlnn/lemon-new-tab-page/image?custom_description=%E4%B8%80%E4%B8%AA%E7%AE%80%E7%BA%A6%E7%9A%84%E7%BA%AF%E6%9C%AC%E5%9C%B0%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5%E6%89%A9%E5%B1%95&description=1&font=Jost&language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2FRedlnn%2Flemon-new-tab-page%2Frefs%2Fheads%2Fmaster%2Fassets%2Ficon.svg&owner=1&pattern=Circuit+Board&stargazers=1&theme=Auto)

<div align="center">

中文 | [Enlgish](README_en.md)

</div>

## 安装

目前插件已在 [Chrome Web Store](https://chromewebstore.google.com/detail/bhbpmpflnpnkjanfgbjjhldccbckjohb)
、[Microsoft Edge Add-Ons](https://microsoftedge.microsoft.com/addons/detail/keikkgfgidagjlicckkangkfgnbdjdnh)
和 [Firefox Browser Add-Ons](https://addons.mozilla.org/firefox/addon/lemon-new-tab/)
上架

> 你也可以 Clone 下来手动 Build 一份来使用

## 特性

- :zap: 加载迅速
- :gear: 丰富的自定义选项，可组合出不同的样式
- :top: 展示最常访问的网站与自定义快捷方式
- :framed_picture: 使用自定义壁纸或 Bing 每日壁纸
- :joystick: 切换搜索引擎和多种搜索建议来源
- :art: 复刻青柠起始页的部分 UI 及动画
- :atom_symbol: 开放源代码
- :globe_with_meridians: 多语言支持（目前支持`zh-CN`、`zh-HK`、`zh-TW`、`en`）
  > `zh-HK` 不一定会生效，理论上支持，是否调用取决于浏览器

> [!NOTE]  
> 本插件模仿了青柠起始页的部分样式，不喜勿喷  
> 更多功能欢迎 PR，提 Issue 不一定会实现噢

## 更新日志（Changelog）

[中文](./CHANGELOG.md) | [English](./CHANGELOG_en.md)

## 浏览器兼容性

| 浏览器  | 支持 |         说明          |
| :-----: | :--: | :-------------------: |
| Chrome  |  ✅  | Chrome 96 及更高版本  |
|  Edge   |  ✅  |  Edge 96 及更高版本   |
| Firefox |  ✅  | Firefox 63 及更高版本 |

## 预览图

<details>
<summary>点击展开图片</summary>

![普通主页](./preview/1.webp)
![纯色背景主页](./preview/2.webp)
![带快速访问区域背景主页](./preview/3.webp)
![搜索页面](./preview/4.webp)
![设置页面](./preview/5.webp)

</details>

### 与青柠起始页对比

> 根据个人需求开发所以很多功能都没有，但欢迎 PR（提 issue 不一定会实现）

|    主要功能    | 柠檬起始页 | 青柠起始页 |
| :------------: | :--------: | :--------: |
|  最常访问网站  |     ✅     |     ❌     |
|   自定义壁纸   |     ✅     |     ✅     |
|    深色模式    |     ✅     |     ✅     |
|    视频壁纸    |     ✅     |     ✅     |
|      一言      |     ✅     |     ✅     |
| 自定义快速访问 |     ✅     |     ✅     |
|    设置同步    |     ✅     |     ✅     |
|      便笺      |     ❌     |     ✅     |
|      天气      |     ❌     |     ✅     |
|  个人项目推广  |     ❌     |     ✅     |
|    账号系统    | 浏览器自带 |    独立    |

## 为什么会有这个插件？

<details>
<summary>主要有以下几个原因（碎碎念警告）：</summary>
<br />

1. Chrome 设置默认搜索引擎为非 Google 后新标签页就没有搜索栏，并且没有壁纸
2. Chrome 搜索引擎改成 Bing 后和 Edge 一样新标签页变成了 Bing 首页，多余的按钮、新闻很丑，且搜索栏和快捷方式都很靠上，不太好用
3. 个人喜欢青柠起始页的外观，然而青柠起始页是一个每次打开都会进行一次 http 请求的网页，准确来讲其实是导航页而不是起始页（非常不能理解为什么要放在服务器上）
4. 青柠并不是原生浏览器插件，不支持展示经常访问网站（同上，非常不能理解），而我个人更习惯直接打开经常访问的网站
5. 青柠起始页把快速访问放在了二级页面，而我更喜欢在新标签页中直接打开常用网站，虽然可以默认进入二级页面但是就看不到搜索栏了
6. 青柠起始页不是个开源项目不好魔改，所以我决定根据自己需求模仿一个

> ~~听闻青柠起始页准备重构并且添加新功能了，也许新版会满足我的需求，然后就停更了呢？~~  
> 更新了，结果基本是 UI 调整，新功能不多（笑

</details>

## 开发

本项目使用 Vue 3 (TypeScript) + Element Plus 开发。

> [!NOTE]  
> 本人没系统学习过 HTML / CSS / JS / TS / Vue，代码质量可能不高，欢迎提 Issue 和 PR

### 构建

#### 如果你使用 Chrome 浏览器

```sh
git clone https://github.com/Redlnn/lemon-new-tab-page.git
cd lemon-new-tab-page
pnpm install
# pnpm dev  # 运行开发环境，会启动一个独立的浏览器
# 构建
pnpm build  # 构建为（未压缩的）Chrome 扩展
pnpm zip  # 打包 Chrome 扩展
```

#### 如果你使用 Firefox 浏览器（For Firefox）

```sh
git clone https://github.com/Redlnn/lemon-new-tab-page.git
cd lemon-new-tab-page
pnpm install
# pnpm dev  # 运行开发环境，会启动一个独立的浏览器
# 构建
pnpm build:firefox  # 构建为（未打包和签名的）Firefox 扩展
pnpm zip:firefox  # 打包 Firefox 扩展
```

## 已知问题

1. 部分 Windows 设备上的 Chromium 内核浏览器会在启动时卡死，**禁用 GPU
   硬件加速**或者在 [Experiments](chrome://flags/#use-angle) 页面将
   **Choose ANGLE graphics backend** 更改为 `OpenGL` 后可缓解
   > - 考虑是因为显卡驱动 / 系统问题等原因造成
   > - Chromium 不推荐使用 OpenGL API 渲染，改成其他也可能会有效（可能会不卡但掉帧）

## 鸣谢

- [青柠起始页](https://limestart.cn/)：柠檬起始页的模仿对象，模仿了布局和动画，参考了部分 CSS
- [Light Tab Page 轻标签页](https://github.com/Devifish/light-tab-page)：自定义壁纸储存的实现来源

## License

本项目以 MIT 协议开源，`entrypoints/newtab/assets` 中的涉及到商标的图片除外
