const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getImages: () => ipcRenderer.invoke('get-images'),
    getImgPath: () => ipcRenderer.invoke('get-img-path'),
    setImgPath: () => ipcRenderer.invoke('set-img-path'),
    renameImg: (oldName, newName) => ipcRenderer.invoke('rename-img', oldName, newName),
    copyImg: (imgName) => ipcRenderer.invoke('copy-img', imgName),
    getSize: () => ipcRenderer.invoke('get-size'),
    setSize: (size) => ipcRenderer.invoke('set-size', size),
    menuClick: (arg) => ipcRenderer.send('menu-click', arg),
    menuCopyClick: (func) => ipcRenderer.on('menu-copy-click', func),
    menuRenameClick: (func) => ipcRenderer.on('menu-rename-click', func),
})