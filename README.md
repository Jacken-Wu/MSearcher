<p align="center">
    <img src="./assets/icon.ico" alt="icon" width="200" height="200">
</p>

<div align="center">

# MSearcher

</div>
<p align="center">
    <a href="https://raw.githubusercontent.com/Jacken-Wu/MSearcher/master/LICENSE">
        <img src="https://img.shields.io/github/license/Jacken-Wu/MSearcher" alt="license">
    </a>
    <a href="https://github.com/Jacken-Wu/MSearcher/releases">
        <img src="https://img.shields.io/github/v/release/Jacken-Wu/MSearcher?color=blueviolet&include_prereleases" alt="release">
    </a>
    <a href="https://nodejs.org/">
        <img src="https://img.shields.io/badge/language-nodejs-blue.svg" alt="python3">
    </a>
    <a href="https://www.electronjs.org/">
        <img src="https://img.shields.io/badge/frame-electron-green.svg" alt="Electron">
    </a>
</p>

## 目录

* [这个项目是干啥的](#这个项目是干啥的)
* [安装/更新与卸载](#安装更新与卸载)
* [操作说明](#操作说明)
* [构建项目](#构建项目)
* [待实现功能 & 已知BUG](#待实现功能--已知bug)
* [寄语](#寄语)
* [新版本更新内容](#新版本更新内容)

## 这个项目是干啥的

这是一个非常简陋的项目，只是让你可以快速地整理和搜索你的 meme 图或表情包。

主要功能：

* 可以通过图片的文件名称搜索到对应的图片；
* 可以手动或通过 OCR 自动重命名图片；
* 可以快速复制图片到系统剪贴板（部分格式图片无法复制）。

## 安装/更新与卸载

### 安装

方式一：从 [releases](https://github.com/Jacken-Wu/MSearcher/releases) 下载最新版本的安装包，运行 exe 安装即可。

方式二：从 [releases](https://github.com/Jacken-Wu/MSearcher/releases) 下载最新版本的免安装版本压缩包，解压即可用。

### 更新

覆盖安装即可。

### 卸载

卸载完成后，记得删除 `C:\Users\<YourUserName>\AppData\Roaming\meme_searcher` 目录和 `C:\Users\<YourUserName>\AppData\Local\meme_searcher-updater` 目录。

## 操作说明

[如何使用 MSearcher](./docs/how_to_use.md)

## 构建项目

[Build](./docs/build.md)

## 待实现功能 & 已知BUG

* [x] 递归显示子文件夹内图片
* [x] 多文件夹管理
* [x] Shift 多选图片
* [x] 更新区分 `已命名` 和 `未命名` 图片的方式，现在是以判断文件名首字符是否为英文字母来判断图片是否经过命名，但这种判断方式会“误伤友军”
* [x] 快速 `禁用/启用` 文件夹
* [ ] 重命名共享文件夹中的内容时，可能会重命名失败

## 寄语

希望各位都能成为群里最擅长发meme图的崽儿。

~~如果有人能自愿移植安卓就好了~~

![meme](./img/meme.jpg)

## 新版本更新内容

### 1.6.2

1. 修复了 OCR 重命名时计数错误的 BUG；
2. 优化了搜索触发逻辑。

### 1.6.1

新增快速 `禁用/启用` 文件夹功能。

### 1.6.0

1. 新增 `Ctrl+A` 全选图片功能；
2. 更改区分 `已命名` 和 `未命名` 图片的方式，在图片文件名结尾加上 `_nmd` （named）来区分图片是否经过命名；
3. 右键菜单新增切换图片 `已命名` 和 `未命名` 状态的功能。

### 1.5.0

1. 新增递归显示子文件夹内图片功能；
2. 新增 `Shift+鼠标左键` 多选图片功能；
3. 新增多文件夹管理功能。

### 1.4.2

修复了每次使用OCR功能后进程无法退出，导致内存被OCR进程大量占用的bug。

因为通过PaddleOCR-json的nodejs-API无法正常结束PaddleOCR-json.exe进程，所以用了taskkill强制结束了该进程（ ~~大力出奇迹~~

### 1.4.1

1. 优化图片文字背景渐变；
2. 修复简繁体混合搜索bug。

### 1.4.0

1. 新增 emoji 表情输入；
2. 新增在现有图片名字的基础上修改名字的功能；
3. 限制显示图片名称行数，避免界面过于拥挤，鼠标悬停显示完整名称；
4. 优化 css 结构。

### 1.3.5

1. 优化log记录；
2. 修复重命名时文件名过长会导致死循环的问题；
3. 修复搜索时英文字母大小写忽略功能的逻辑bug。

### 1.3.4

log记录程序崩溃信息。

### 1.3.3

新增log功能。

（说来惭愧，之前的版本一直没有log记录。。。）

### 1.3.2

1. 新增繁体简体混合搜索，不用担心简体中文搜索不到繁体中文命名的图片了，反之亦然；
2. 新增英文字母大小写不敏感，搜索时忽略大小写。

### 1.3.1

修复了不能完全退出的bug。

### 1.3.0

1. 新增 OCR 命名功能；
2. 新增命名时的特殊字符检测。

注意：该版本有退出不完全的bug，退出后需在任务管理器中手动结束进程。

### 1.2.0

1. 可以设置图片显示比例了；
2. 优化了底部输入框和按钮的布局；
3. 新增筛选模式为“未命名”时，自动选择第一张未命名图片的功能，方便大量命名时无需鼠标反复点击。

### 1.1.0

1. 为复制和重命名功能添加空检测；
2. 新增鼠标右键菜单；
3. 新增批量重命名功能；
4. 删除鼠标左键复制功能。
