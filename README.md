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

* [写在前面](#写在前面)
* [功能](#功能)
* [安装](#安装)
* [使用](#使用)
* [卸载](#卸载)
* [寄语](#寄语)
* [新版本更新内容](#新版本更新内容)

## 写在前面

这是一个非常简陋的项目，只是让你可以快速地根据图片名称搜索到对应的图片而已（还可以重命名图片）。

本来是想写一个安卓APP，结果用electron写完后才发现不能打包成apk，尝试了cordova和Android Studio，都无法在短时间内完成程序的移植，也无法达到预期的效果，暂时放弃了。

## 功能

* 可以通过图片名称（无需全名）搜索到对应的图片；
* 可以重命名图片；
* 可以快速复制图片到系统剪贴板（无法复制GIF）。

## 安装

从 [releases](https://github.com/Jacken-Wu/MSearcher/releases) 下载最新版本的安装包，解压并运行 exe 安装即可。

更新同理，解压并运行 exe 覆盖安装即可。

## 使用

![Introduction](./img/introduction.png)

* 选择图片文件夹：点击设置按钮，然后选择你存放meme图/表情包的文件夹；
* 搜索：在搜索框中输入你要搜索的图片名称（输入关键字即可，关键字可不考虑顺序），按下回车键或点击搜索按钮；
* 重命名：鼠标左键选中要重命名的图片，在最下方（下方第二个）输入框中输入新的名称，`按下回车键`或`点击重命名按钮`或点击右键菜单栏中的`重命名按钮`，即可重命名图片；
* 批量重命名：ctrl+鼠标左键可以选中多个图片，然后重命名即可，文件名后会自动添加从0开始的数字序号；
* 复制图片：左键选中要复制的图片，点击右键菜单栏中的`复制按钮`，或点击左下角的`复制按钮`，即可复制图片到系统剪贴板（无法复制GIF）；
* 筛选：点击右上角的筛选按钮，可以选择显示已命名或未命名的图片（通过判断图片名称首字符是否为数字、字母或下划线等来实现）。

## 卸载

* 在安装目录找到 `Uninstall MSearcher.exe` 文件，双击运行即可卸载；
* 卸载完成后，记得删除安装目录和 `C:\Users\<YourUserName>\AppData\Roaming\meme_searcher` 目录。

## 寄语

希望各位都能成为群里最擅长发meme图的崽儿。

~~如果有人能自愿移植安卓就好了~~

![meme](./img/meme.jpg)

## 新版本更新内容

### 1.1.0

1. 为复制和重命名功能添加空检测；
2. 新增鼠标右键菜单；
3. 新增批量重命名功能；
4. 删除鼠标左键复制功能。
