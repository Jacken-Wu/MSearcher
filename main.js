const { app, BrowserWindow, ipcMain, dialog, clipboard, nativeImage, Menu } = require('electron')
const path = require('path')
const fs = require('fs');
const OCR = require('paddleocrjson');

const configPath = path.join(getUserdataPath(), 'config.json');
const ocr = new OCR('PaddleOCR-json.exe', [/* '-port=9985', '-addr=loopback' */], {
    cwd: path.join(__dirname.replace('\\resources\\app.asar', ''), './tools/ocr'),
}, false);

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

    ipcMain.handle('get-images', getImgList);
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
        console.log('meme_searcher folder found.');
    } catch (err) {
        console.log('meme_searcher folder not found, create a new one.');
        fs.mkdirSync(getUserdataPath());
    }
    // 检查img文件夹是否存在，不存在则创建
    try {
        fs.accessSync(path.join(getUserdataPath(), 'img'), fs.constants.F_OK)
        console.log('Img folder found.');
    } catch (err) {
        console.log('Img folder not found, create a new one.');
        fs.mkdirSync(path.join(getUserdataPath(), 'img'));
    }
    // 为config.json写入初始配置
    const config = {};
    config.img_path = path.join(getUserdataPath(), 'img');
    config.size = '2';
    try {
        fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8')
        console.log('Initialize config file success.');
    } catch (err) {
        console.log('Initialize config file failed: ', err);
    }
}

function checkConfig() {
    try {
        fs.accessSync(configPath, fs.constants.F_OK)
        console.log('Config file found.');
    } catch (err) {
        console.log('Config file not found, create a new one.');
        initConfig();
    }
}

function readConfig() {
    checkConfig();
    try {
        const data = fs.readFileSync(configPath, 'utf-8')
        const config = JSON.parse(data);
        console.log(config);
        return config;
    } catch (err) {
        console.log('Read config file failed: ', err);
    }
}

function changeConfig(key, value) {
    const config = readConfig();
    config[key] = value;
    try {
        fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8')
        console.log('Change config success.');
    } catch (err) {
        console.log('Change config failed: ', err);
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
    console.log('Img_path: ', imgPath);
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
    console.log('size: ', size);
    return size;
}

function setSize(event, size) {
    // 设置图片缩放尺寸等级
    changeConfig('size', size);
}

function getImgList() {
    // 获取图片名列表
    const imgPath = getImgPath();

    try {
        const files = fs.readdirSync(imgPath)
        console.log('Images: ', files);
        return files;
    } catch (err) {
        console.log('Read images failed: ', err);
        return [];
    }
}

async function setImgPath() {
    // 选择图片文件夹
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'dontAddToRecent'],
    });
    console.log('Result: ', result);
    if (result.filePaths.length == 0) {
        console.log('No directory selected.');
        return false;
    } else {
        console.log('Directory selected: ', result.filePaths[0]);
        changeConfig('img_path', result.filePaths[0]);
        return true;
    }
}

function renameImg(event, oldName, newName) {
    const imgPath = getImgPath();
    const files = getImgList();
    if (files.includes(newName)) {
        console.log('Image already exists: ', newName);
        return false;
    }
    const oldPath = path.join(imgPath, oldName);
    const newPath = path.join(imgPath, newName);
    try {
        fs.renameSync(oldPath, newPath);
        console.log('Rename image success: ', oldName, '->', newName);
        return true;
    } catch (err) {
        console.log('Rename image failed: ', err);
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
    console.log('Image: ', img);
    clipboard.writeImage(img);
    console.log('Clipboard: ', clipboard.readImage());
    console.log('Copy image success: ', imgSrc);
}

async function ocrImg(event, imgName) {
    const imgPath = getImgPath();
    const imgSrc = path.join(imgPath, imgName);
    let results = [];
    await ocr.flush({ image_path: imgSrc })
        .then((data) => { results = data.data });
        // .then(() => { ocr.terminate() });
    console.log('OCR result: ', results);

    let resultStr = '';
    if (results != null) {
        results.forEach((item) => {
            resultStr += item.text;
        });
    }
    return resultStr;
}

app.on('ready', () => {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});

app.on('window-all-closed', async () => {
    if (process.platform !== 'darwin') {
        const exit = await ocr.terminate();
        console.log('Exit: ', exit);
        app.quit()
    }
});