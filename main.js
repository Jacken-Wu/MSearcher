const { app, BrowserWindow, ipcMain, dialog, clipboard, nativeImage, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const OCR = require('paddleocrjson');
const Chinese = require('chinese-s2t');
const log = require('electron-log');
const { exec } = require('child_process');

log.initialize();
log.transports.file.maxSize = 1048576; // 1MB
log.transports.file.resolvePathFn = () => { return path.join(__dirname.replace('\\resources\\app.asar', ''), 'logs/main.log') };
log.info('Meme Searcher started.');
Object.assign(console, log.functions);

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
    ipcMain.handle('add-img-path', addImgPath);
    ipcMain.handle('remove-img-path', removeImgPath);
    ipcMain.handle('rename-img', renameImg);
    ipcMain.handle('copy-img', copyImg);
    ipcMain.handle('get-size', getSize);
    ipcMain.handle('set-size', setSize);
    ipcMain.handle('ocr-img', ocrImg);
    ipcMain.handle('renderer-log', rendererLog);
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
        },
        {
            label: '在现有名称上修改名称',
            click: () => {
                win.webContents.send('menu-modify-click');
            }
        },
        {
            label: '标记为已命名',
            click: () => {
                win.webContents.send('menu-mark-click');
            }
        },
        {
            label: '标记为未命名',
            click: () => {
                win.webContents.send('menu-unmark-click');
            }
        }
    ]);
}

function initConfig() {
    log.info('Initializing config file...');
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
    config.img_path = [path.join(getUserdataPath(), 'img')];
    config.size = '2';
    try {
        fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8')
        log.info('Initialize config file success.');
    } catch (err) {
        log.error('Initialize config file failed: ', err);
    }
}

function checkConfig() {
    log.info('Checking config file...');
    try {
        fs.accessSync(configPath, fs.constants.F_OK)
        // log.info('Config file found.');
    } catch (err) {
        log.error('Config file not found, create a new one.');
        initConfig();
    }
}

function readConfig() {
    log.info('Reading config file...');
    checkConfig();
    try {
        const data = fs.readFileSync(configPath, 'utf-8')
        const config = JSON.parse(data);
        // 检查config.json格式是否正确
        if (!Array.isArray(config.img_path)) {
            config.img_path = [config.img_path];
        }
        log.info('Read config file success: ', config);
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
    log.info('Reading image path...');
    // 获取图片文件夹路径
    const config = readConfig();
    if (config.img_path == undefined) {
        changeConfig('img_path', [path.join(getUserdataPath(), 'img')]);
        return path.join(getUserdataPath(), 'img');
    }
    const imgPath = config.img_path;
    // log.info('Img_path: ', imgPath);
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

// 递归读取文件夹下所有文件
function recursiveGetImg(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            recursiveGetImg(filePath, filesList);
        } else {
            filesList.push([dir, file]);
        }
    });
    return filesList;
}

function getImgList() {
    log.info('Reading images...');
    // 获取图片名列表
    const imgPath = getImgPath();

    try {
        let images = [];
        imgPath.forEach(dir => {
            images.push(...recursiveGetImg(dir));
        });
        log.info('Images length: ', images.length);
        return images;
    } catch (err) {
        log.error('Read images failed: ', err);
        return [];
    }
}

async function setImgPath(event, paths) {
    try {
        changeConfig('img_path', paths);
        log.info('Set image path success.');
    } catch (err) {
        log.error('Set image path failed: ', err);
    }
}

async function addImgPath() {
    log.info('Adding image path...');
    // 选择图片文件夹
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'dontAddToRecent'],
    });
    if (result.filePaths.length == 0) {
        log.info('No directory selected.');
        return false;
    } else {
        log.info('Directory selected.');
        const config = readConfig();
        config.img_path.push(result.filePaths[0]);
        setImgPath(null, config.img_path);
        return true;
    }
}

async function removeImgPath(event, index) {
    log.info('Removing image path...');
    let config = readConfig();
    config.img_path.splice(index, 1);
    changeConfig('img_path', config.img_path);
}

function renameImg(event, imgDir, oldName, newName) {
    /* return: 0: 重命名失败，图片已存在；1: 重命名成功；2: 重命名失败，其他错误 */
    log.info('Renaming image...');
    if (fs.existsSync(path.join(imgDir, newName))) {
        log.info('Image already exists.');
        return 0;
    }
    const oldPath = path.join(imgDir, oldName);
    const newPath = path.join(imgDir, newName);
    // log.info('Rename image (path): ', oldPath, '->', newPath);
    try {
        fs.renameSync(oldPath, newPath);
        log.info('Rename image success.');
        return 1;
    } catch (err) {
        log.error('Rename image failed: ', err);
        return 2;
    }
}

function getUserdataPath() {
    const Roaming = path.dirname(app.getPath('userData'));
    return path.join(Roaming, 'meme_searcher');
}

function copyImg(event, imgSrc) {
    const img = nativeImage.createFromPath(imgSrc);
    clipboard.writeImage(img);
    log.info('Copy image success.');
}

async function ocrImg(event, imgDirs, imgNames) {
    const ocr = new OCR('PaddleOCR-json.exe', [/* '-port=9985', '-addr=loopback' */], {
        cwd: path.join(__dirname.replace('\\resources\\app.asar', ''), 'tools/ocr'),
    }, false);

    let resultStrs = [];
    for (const [index, imgName] of imgNames.entries()) {
        const imgSrc = path.join(imgDirs[index], imgName);
        log.info('OCR start');
        const results = (await ocr.flush({ image_path: imgSrc })).data;
        log.info('OCR over');

        let resultStr = '';
        if (results != null) {
            results.forEach((item) => {
                resultStr += item.text;
            });
        }
        resultStrs.push(resultStr);
    };

    await ocr.terminate();
    const processName = 'PaddleOCR-json.exe'; // 替换为外部程序的名称
    exec(`taskkill /IM ${processName} /F`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error killing process: ${err}`);
        } else {
            console.log(`Process ${processName} terminated.`);
        }
    });

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
                // const firstChar = img[1].charAt(0);
                // const isUnfiltered = /^[a-zA-Z0-9-_]$/.test(firstChar);
                // if (!isUnfiltered) {
                if (img[1].slice(0, img[1].lastIndexOf('.')).endsWith('_nmd')) {
                    imgListFilteredTemp.push(img);
                }
            });
            break;
        case 'unfiltered':
            imgList.forEach(img => {
                // const firstChar = img[1].charAt(0);
                // const isUnfiltered = /^[a-zA-Z0-9-_]$/.test(firstChar);
                // if (isUnfiltered) {
                if (!img[1].slice(0, img[1].lastIndexOf('.')).endsWith('_nmd')) {
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

    const filterTextsLower = filterTextLowerTemp.split('').filter(character => /^[a-z]$/.test(character));
    let filterTextsSimplified = Chinese.t2s(filterTextLowerTemp).split('').filter(character => !/^[a-z\s]$/.test(character));
    let filterTextsTraditional = Chinese.s2t(filterTextLowerTemp).split('').filter(character => !/^[a-z\s]$/.test(character));

    log.info('Filter text english, simplified, traditional: ', filterTextsLower, filterTextsSimplified, filterTextsTraditional);

    // 搜索图片列表
    let imgListFiltered = [];
    imgListFilteredTemp.forEach(img => {
        const imgLower = img[1].toLowerCase();
        const isFilteredEnglish = filterTextsLower.every(character => imgLower.includes(character));
        let isFilteredChinese = true;
        for (let i = 0; i < filterTextsSimplified.length; i++) {
            if (!img[1].includes(filterTextsSimplified[i]) && !img[1].includes(filterTextsTraditional[i])) {
                isFilteredChinese = false;
                break;
            }
        }
        if (isFilteredEnglish && isFilteredChinese) {
            imgListFiltered.push(img);
        }
    });
    // console.log(imgListFiltered);
    log.info('Filtered image list length: ', imgListFiltered.length);

    return imgListFiltered;
}

function rendererLog(event, message, level = 'info', owner = 'renderer') {
    switch (level) {
        case 'info':
            log.info('[' + owner + ']', message);
            break;
        case 'warn':
            log.warn('[' + owner + ']', message);
            break;
        case 'error':
            log.error('[' + owner + ']', message);
            break;
        default:
            log.info('[' + owner + ']', message);
            break;
    }
}

app.on('ready', () => {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });

    // 监听渲染进程崩溃
    app.on('renderer-process-crashed', (event, webContents, killed) => {
        log.error(`Renderer process crashed: ${JSON.stringify(event)}`);
    });

    // 监听 GPU 进程崩溃
    app.on('gpu-process-crashed', (event, killed) => {
        log.error(`GPU process crashed: ${JSON.stringify(event)}`);
    });

    // 监听渲染进程结束
    app.on('render-process-gone', (event, webContents, details) => {
        log.error(`Render process gone: ${JSON.stringify(details)}`);
    });

    // 监听子进程结束
    app.on('child-process-gone', (event, details) => {
        log.error(`Child process gone: ${JSON.stringify(details)}`);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        log.info('Meme Searcher exited.');
        app.quit();
    }
});