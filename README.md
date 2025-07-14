![lemon-new-tab-page](https://socialify.git.ci/redlnn/lemon-new-tab-page/image?custom_description=%E4%B8%80%E4%B8%AA%E9%9D%9E%E5%B8%B8%E7%AE%80%E7%BA%A6%E7%9A%84%E4%BB%BF%E9%9D%92%E6%9F%A0%E8%B5%B7%E5%A7%8B%E9%A1%B5%E7%9A%84%E7%BA%AF%E6%9C%AC%E5%9C%B0%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5%E5%AE%9E%E7%8E%B0&description=1&font=Jost&language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2FRedlnn%2Flemon-new-tab-page%2Frefs%2Fheads%2Fmaster%2Fassets%2Ficon.svg&owner=1&pattern=Circuit+Board&stargazers=1&theme=Auto)

## 安装

目前插件已在 [Chrome Web Store](https://chromewebstore.google.com/detail/bhbpmpflnpnkjanfgbjjhldccbckjohb)
、[Microsoft Edge 加载项](https://microsoftedge.microsoft.com/addons/detail/keikkgfgidagjlicckkangkfgnbdjdnh)
和 [Firefox Browser Add-Ons](https://addons.mozilla.org/zh-CN/firefox/addon/lemon-new-tab/)
上架

> 你也可以 Clone 下来手动 Build 一份来使用

## 特性

- :zap: 加载迅速（[已知问题](#已知问题)）
- :gear: 丰富的自定义选项，可组合出不同的样式
- :top: 展示最常访问的网站与自定义快捷方式
- :art: 复刻青柠起始页的部分 UI 及动画
- :framed_picture: 使用自定义壁纸或 Bing 每日壁纸
- :joystick: 切换搜索引擎和多种搜索建议来源
- :atom_symbol: 开放源代码
- :globe_with_meridians: 多语言支持（目前只有`zh_CN`、`zh_TW`、`en`）

> [!NOTE]  
> 更多功能欢迎 PR，提 Issue 不一定会实现噢

## 为什么会有这个插件？

主要有以下几个原因：

1. Chrome 把默认搜索引擎改成非 Google 后新标签页就没有搜索栏了，并且没有壁纸比较寡淡
2. Chrome 改成 Bing 搜索引擎后和 Edge 一样新标签页变成了 Bing 首页，多余的按钮、新闻等文字让我很不爽，而且搜索栏和快捷方式都很靠上，一点都不好用
3. 我个人很喜欢青柠起始页的外观，然而青柠起始页是一个网页并不是浏览器插件，不支持展示经常访问网站，而我个人更习惯直接打开经常访问的网站
4. 青柠起始页把快速访问放在了二级页面，而我更喜欢在新标签页中直接打开常用网站，虽然可以默认进入二级页面但是就看不到搜索栏了
5. 青柠起始页不是个开源项目不好魔改，所以我决定根据自己需求模仿一个

> ~~听闻青柠起始页准备重构并且添加新功能了，也许新版会满足我的需求，然后就停更了呢？（笑~~
> 更新了，结果新功能不多，害

### 对比

> 根据个人需求开发所以很多功能都没有，但欢迎 PR（提 issue 不一定会实现）

|    主要功能    | 柠檬起始页 | 青柠起始页 |
| :------------: | :--------: | :--------: |
|  最常访问网站  |     ✅     |     ❌     |
|   自定义壁纸   |     ✅     |     ✅     |
|    深色模式    |     ✅     |     ✅     |
|    视频壁纸    |     ❌     |     ✅     |
|      一言      |     ✅     |     ✅     |
| 自定义快速访问 |     ✅     |     ✅     |
|      便笺      | 不计划支持 |     ✅     |
|    设置同步    |     ✅     |     ✅     |
|      天气      | 不计划支持 |     ✅     |
|  个人项目推广  |     ❌     |     ✅     |

## 浏览器兼容性

| 浏览器  | 支持 |         说明          |
| :-----: | :--: | :-------------------: |
| Chrome  |  ✅  | Chrome 96 及更高版本  |
|  Edge   |  ✅  |  Edge 96 及更高版本   |
| Firefox |  ✅  | Firefox 63 及更高版本 |

## 预览

<details>
<summary>点击展开图片</summary>

![普通主页](./preview/1.webp)
![纯色背景主页](./preview/2.webp)
![带快速访问区域背景主页](./preview/3.webp)
![搜索页面](./preview/4.webp)
![设置页面](./preview/5.webp)

</details>

## 开发（Development）

本项目使用 Vue 3 (TypeScript) + Element Plus 开发。

> [!NOTE]  
> 本人没系统学习过 HTML / CSS / JS / TS / Vue，代码质量可能不高，欢迎提 Issue 和 PR

### 构建（Build）

#### 如果你使用 Chrome 浏览器（For Chrome）

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
   > - 考虑是因为显卡驱动 / 系统问题 / 浏览器被注入等原因造成
   > - Chromium 不推荐使用 OpenGL API 渲染，改成其他可能会有效（可能会不卡但掉帧）

## 鸣谢

- [青柠起始页](https://limestart.cn/)

  > 柠檬起始页的模仿对象，模仿了布局和动画，参考了部分 CSS

- [Light Tab Page 轻标签页](https://github.com/Devifish/light-tab-page)

  > 自定义壁纸储存的实现来源
