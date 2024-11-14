const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getImages: () => ipcRenderer.invoke('get-images'),
    getImgPath: () => ipcRenderer.invoke('get-img-path'),
    updateImgPath: () => ipcRenderer.invoke('update-img-path'),
    renameImg: (oldName, newName) => ipcRenderer.invoke('rename-img', oldName, newName),
    copyImg: (imgName) => ipcRenderer.invoke('copy-img', imgName),
})