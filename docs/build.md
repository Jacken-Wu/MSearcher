# 构建项目

1. 安装 node.js 和 npm；
2. 克隆项目到本地；
3. 进入项目目录，执行 `npm install` 安装依赖；
4. 将项目 [PaddleOCR-json](https://github.com/hiroi-sora/PaddleOCR-json/releases/download/v1.4.1/PaddleOCR-json_v1.4.1_windows_x64.7z) 下载并解压至 `./tools/ocr/` 目录下，OCR 文字识别将会使用到 `tools/ocr/PaddleOCR-json.exe`。
5. 通过 `npm start` 运行项目，`npm run build-win64` 编译项目。
