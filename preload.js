const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getImages: (filterType, filterTexts) => ipcRenderer.invoke('get-images', filterType, filterTexts),
    getImgPath: () => ipcRenderer.invoke('get-img-path'),
    setImgPath: () => ipcRenderer.invoke('set-img-path'),
    renameImg: (imgDir, oldName, newName) => ipcRenderer.invoke('rename-img', imgDir, oldName, newName),
    copyImg: (imgName) => ipcRenderer.invoke('copy-img', imgName),
    getSize: () => ipcRenderer.invoke('get-size'),
    setSize: (size) => ipcRenderer.invoke('set-size', size),
    ocrImg: (imgDir, imgName) => ipcRenderer.invoke('ocr-img', imgDir, imgName),
    rendererLog: (message, level, owner) => ipcRenderer.invoke('renderer-log', message, level, owner),
    // test: () => ipcRenderer.invoke('test'),

    menuClick: (arg) => ipcRenderer.send('menu-click', arg),
    menuCopyClick: (func) => ipcRenderer.on('menu-copy-click', func),
    menuRenameClick: (func) => ipcRenderer.on('menu-rename-click', func),
    menuOCRClick: (func) => ipcRenderer.on('menu-ocr-click', func),
    menuModifyClick: (func) => ipcRenderer.on('menu-modify-click', func),
})