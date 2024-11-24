const { app, BrowserWindow, ipcMain, dialog, clipboard, nativeImage, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const OCR = require('paddleocrjson');
const Chinese = require('chinese-s2t');
const log = require('electron-log');

log.initialize();
log.transports.file.resolvePathFn = () => { return path.join(__dirname.replace('\\resources\\app.asar', ''), 'logs/main.log') };
log.info('Meme Searcher started.');

const configPath = path.join(getUserdataPath(), 'config.json');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,//窗口宽度
        minWidth: 400,//最小窗口宽度
        height: 600,//窗口高度
        minHeight: 400,//最小窗口高度
        autoHideMenuBar: true,//自动隐藏菜单档
        // alwaysOnTop: true,//置顶
        x: 0,//窗口位置x坐标
        y: 0,//窗口位置y坐标
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),//预加载脚本
        },
        enableRemoteModule: true
    });

    ipcMain.handle('get-images', filterImageList);
    ipcMain.handle('get-img-path', getImgPath);
    ipcMain.handle('set-img-path', setImgPath);
    ipcMain.handle('rename-img', renameImg);
    ipcMain.handle('copy-img', copyImg);
    ipcMain.handle('get-size', getSize);
    ipcMain.handle('set-size', setSize);
    ipcMain.handle('ocr-img', ocrImg);
    // ipcMain.handle('test', () => {return __dirname});
    ipcMain.on('menu-click', (event, arg) => { menu.popup({ x: arg.x, y: arg.y }) });

    win.loadFile('./index.html');
    // win.openDevTools();

    const menu = Menu.buildFromTemplate([
        {
            label: '复制',
            click: () => {
                win.webContents.send('menu-copy-click');
            },
        },
        {
            label: '重命名',
            click: () => {
                win.webContents.send('menu-rename-click');
            },
        },
        {
            label: 'OCR重命名',
            click: () => {
                win.webContents.send('menu-ocr-click');
            }
        }
    ]);
}

function initConfig() {
    // 检查meme_searcher文件夹是否存在，不存在则创建
    try {
        fs.accessSync(getUserdataPath(), fs.constants.F_OK)
        log.info('meme_searcher folder found.');
    } catch (err) {
        log.error('meme_searcher folder not found, create a new one.');
        fs.mkdirSync(getUserdataPath());
    }
    // 检查img文件夹是否存在，不存在则创建
    try {
        fs.accessSync(path.join(getUserdataPath(), 'img'), fs.constants.F_OK)
        log.info('Img folder found.');
    } catch (err) {
        log.error('Img folder not found, create a new one.');
        fs.mkdirSync(path.join(getUserdataPath(), 'img'));
    }
    // 为config.json写入初始配置
    const config = {};
    config.img_path = path.join(getUserdataPath(), 'img');
    config.size = '2';
    try {
        fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8')
        log.info('Initialize config file success.');
    } catch (err) {
        log.error('Initialize config file failed: ', err);
    }
}

function checkConfig() {
    try {
        fs.accessSync(configPath, fs.constants.F_OK)
        log.info('Config file found.');
    } catch (err) {
        log.error('Config file not found, create a new one.');
        initConfig();
    }
}

function readConfig() {
    checkConfig();
    try {
        const data = fs.readFileSync(configPath, 'utf-8')
        const config = JSON.parse(data);
        log.info(config);
        return config;
    } catch (err) {
        log.info('Read config file failed: ', err);
    }
}

function changeConfig(key, value) {
    const config = readConfig();
    config[key] = value;
    try {
        fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8')
        log.info('Change config success.');
    } catch (err) {
        log.error('Change config failed: ', err);
    }
}

function getImgPath() {
    // 获取图片文件夹路径
    const config = readConfig();
    if (config.img_path == undefined) {
        changeConfig('img_path', path.join(getUserdataPath(), 'img'));
        return path.join(getUserdataPath(), 'img');
    }
    const imgPath = config.img_path;
    log.info('Img_path: ', imgPath);
    return imgPath;
}

function getSize() {
    // 获取图片缩放尺寸等级
    const config = readConfig();
    if (config.size == undefined) {
        changeConfig('size', '2');
        return '2';
    }
    const size = config.size;
    log.info('Now size level: ', size);
    return size;
}

function setSize(event, size) {
    // 设置图片缩放尺寸等级
    changeConfig('size', size);
    log.info('Change size level: ', size);
}

function getImgList() {
    // 获取图片名列表
    const imgPath = getImgPath();

    try {
        const files = fs.readdirSync(imgPath)
        log.info('Images length: ', files.length);
        return files;
    } catch (err) {
        log.error('Read images failed: ', err);
        return [];
    }
}

async function setImgPath() {
    // 选择图片文件夹
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'dontAddToRecent'],
    });
    if (result.filePaths.length == 0) {
        log.info('No directory selected.');
        return false;
    } else {
        log.info('Directory selected: ', result.filePaths[0]);
        changeConfig('img_path', result.filePaths[0]);
        return true;
    }
}

function renameImg(event, oldName, newName) {
    const imgPath = getImgPath();
    const files = getImgList();
    if (files.includes(newName)) {
        log.info('Image already exists: ', newName);
        return false;
    }
    const oldPath = path.join(imgPath, oldName);
    const newPath = path.join(imgPath, newName);
    try {
        fs.renameSync(oldPath, newPath);
        log.info('Rename image success: ', oldName, '->', newName);
        return true;
    } catch (err) {
        log.error('Rename image failed: ', err);
        return false;
    }
}

function getUserdataPath() {
    const Roaming = path.dirname(app.getPath('userData'));
    return path.join(Roaming, 'meme_searcher');
}

function copyImg(event, imgName) {
    const imgPath = getImgPath();
    const imgSrc = path.join(imgPath, imgName);
    const img = nativeImage.createFromPath(imgSrc);
    clipboard.writeImage(img);
    log.info('Copy image success: ', imgSrc);
}

async function ocrImg(event, imgNames) {
    const imgPath = getImgPath();

    const ocr = new OCR('PaddleOCR-json.exe', [/* '-port=9985', '-addr=loopback' */], {
        cwd: path.join(__dirname.replace('\\resources\\app.asar', ''), 'tools/ocr'),
    }, false);

    let resultStrs = [];
    for (const imgName of imgNames) {
        const imgSrc = path.join(imgPath, imgName);
        log.info('OCR image: ', imgSrc);
        const results = (await ocr.flush({ image_path: imgSrc })).data;
        log.info('OCR result: ', results);

        let resultStr = '';
        if (results != null) {
            results.forEach((item) => {
                resultStr += item.text;
            });
        }
        resultStrs.push(resultStr);
    };

    ocr.terminate();

    return resultStrs;
}

function filterImageList(event, filterType = 'all', filterText = '') {
    /* filterType: all, filtered, unfiltered */

    // 获取图片列表
    const imgList = getImgList();

    const imgListFilteredTemp = [];
    switch (filterType) {
        case 'all':
            imgListFilteredTemp.push(...imgList);
            break;
        case 'filtered':
            imgList.forEach(img => {
                const firstChar = img.charAt(0);
                const isUnfiltered = /^[a-zA-Z0-9-_]$/.test(firstChar);
                if (!isUnfiltered) {
                    imgListFilteredTemp.push(img);
                }
            });
            break;
        case 'unfiltered':
            imgList.forEach(img => {
                const firstChar = img.charAt(0);
                const isUnfiltered = /^[a-zA-Z0-9-_]$/.test(firstChar);
                if (isUnfiltered) {
                    imgListFilteredTemp.push(img);
                }
            });
            break;
        default:
            imgListFilteredTemp.push(...imgList);
            break;
    }

    // 处理过滤文本, 简繁体转换，大小写转换，实现简繁体大小写混合搜索
    const filterTextLowerTemp = filterText.toLowerCase();

    const filterTextLower = filterTextLowerTemp.split('').filter(character => /^[a-z]$/.test(character)).join('');
    const filterTextUpper = filterTextLower.toUpperCase();
    let filterTextsSimplified = Chinese.t2s(filterTextLowerTemp).split('').filter(character => !/^[a-z\s]$/.test(character));
    let filterTextsTraditional = Chinese.s2t(filterTextLowerTemp).split('').filter(character => !/^[a-z\s]$/.test(character));

    log.info('Filter text lower, upper, simplified, traditional: ', filterTextLower, filterTextUpper, filterTextsSimplified, filterTextsTraditional);

    // 搜索图片列表
    let imgListFiltered = [];
    imgListFilteredTemp.forEach(img => {
        const isFilteredEnglish = filterTextLower.split('').every(character => img.includes(character)) || filterTextUpper.split('').every(character => img.includes(character));
        const isFilteredChinese = filterTextsSimplified.every(character => img.includes(character)) || filterTextsTraditional.every(character => img.includes(character));
        if (isFilteredEnglish && isFilteredChinese) {
            imgListFiltered.push(img);
        }
    });
    console.log(imgListFiltered);
    log.info('Filtered image list length: ', imgListFiltered.length);

    return imgListFiltered;
}

app.on('ready', () => {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        log.info('Meme Searcher exited.');
        app.quit();
    }
});