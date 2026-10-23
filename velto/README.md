# Velto V3 本地预览

本项目沿用网站的原生 HTML / CSS / JavaScript 与本地 Bricolage Grotesque 字体，无需 npm 或构建步骤。

## VS Code

1. 在 VS Code 打开整个 `Raphaelleflynn` 文件夹。
2. 安装扩展 **Live Server**（Ritwick Dey，扩展 ID：`ritwickdey.LiveServer`）。
3. 右键 `velto/velto.html`，选择 **Open with Live Server**。
4. 也可以从根目录 `index.html` 进入，点击 Velto 项目卡片。
5. 打开浏览器开发者工具的设备工具栏，选择 390px 或 375px 宽度预览手机布局。

不使用扩展时，在 VS Code 终端的项目根目录运行：

```sh
python3 -m http.server 8000
```

浏览器访问 `http://localhost:8000/velto/velto.html`，按 Ctrl+C 停止服务器。也支持直接打开 HTML 文件。

## 文件与后续动效

- `velto.html`：V3 内容和结构。
- `velto.css`：项目专属样式，桌面、平板与手机布局。
- `velto.js`：手机导航、Escape 关闭和键盘焦点管理。
- `img/`：本地 Figma 图片、视频及轻量 WebP 封面，不依赖临时链接。

五个产品界面使用 `data-motion-slot` 标记：`receipt-capture`、`manager-approval`、`finance-review`、`payment-tracking`、`employee-status`。后续可将对应 figure 中的 img 替换为 video，以当前图片作为 poster，并保持 2880 / 2048 的比例。Manager Approval、Finance Review 和 Payment Tracking 已接入对应 MP4 视频，从对应视频首帧提取的轻量 WebP 作为 poster（被替换的三张 PNG 已删除）；收据提交与员工状态仍使用静态截图。视频初始仅显示封面（preload="none"，视频地址保存在 data-src）。进入视口后才加载并静音循环、行内播放；同时只允许一个视频挂载源地址。离开视口或切换标签页时暂停并卸载源，终止继续缓冲，再次进入时恢复进度。也可通过播放器控件手动操作；视频按项目要求自动播放，仍可手动暂停。

设计来源：https://www.figma.com/design/LFrFlCpHGbEOAkpeckWhBK/artwork?node-id=11698-1935

原图对应节点：封面 `11698:1411`；收据 `11711:950`；审批 `11719:960`；财务 `11723:1079`；支付 `11723:1090`；员工状态 `11728:846`。

三段 MP4 的播放索引均位于媒体数据之前（fast-start），以改善开始播放速度。当前编码参数见下文。

当前三段视频均为高清优化版：2880×2048、30fps，H.264 slow / CRF 18，启用 fast-start。Approval 约 1.27 MB，Review 约 1.07 MB，Payment 约 1.00 MB。三段高清原片保存在 `video-backups/hd-originals/`，页面不会加载备份。WebP 封面已从对应高清版本首帧重新生成。
