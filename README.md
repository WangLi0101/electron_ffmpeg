# Media Converter

基于Electron和FFmpeg的跨平台媒体转换工具，支持音频、视频和图片的压缩与格式转换。

## 功能特点

- 🎥 视频转换与压缩
  - 支持多种视频格式互转（MP4, AVI, MOV等）
  - 自定义视频质量和压缩率
  - 批量视频处理

- 🎵 音频处理
  - 音频格式转换（MP3, WAV, AAC等）
  - 音频压缩
  - 音频提取（从视频中提取音频）

- 🖼️ 图片工具
  - 图片格式转换（JPG, PNG, WEBP等）
  - 图片压缩
  - 批量图片处理

## 技术栈

- Electron: 跨平台桌面应用框架
- Vue 3 + TypeScript: 前端开发框架
- FFmpeg: 媒体处理核心引擎

## 开发环境配置

### 推荐的IDE设置

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

### 注意

需要将ffmpeg的安装包放入resources目录下，ffmpeg下载路径 <https://www.ffmpeg.org/download.html>

### 安装依赖

```bash
yarn
```

### 开发模式

```bash
yarn dev
```

### 构建应用

```bash
# Windows版本
$ yarn build:win

# macOS版本
$ yarn build:mac

# Linux版本
$ yarn build:linux
```

## 使用说明

1. 选择要处理的媒体文件（支持拖拽）
2. 选择目标格式和压缩参数
3. 点击转换按钮开始处理
4. 等待处理完成后在输出目录查看结果

## 系统要求

- Windows 7及以上
- macOS 10.13及以上
- Linux (支持主流发行版)

## 开源协议

MIT License
