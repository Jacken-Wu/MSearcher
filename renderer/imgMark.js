window.electronAPI.menuMarkClick(async () => {
    await markRename('_nmd');
});

window.electronAPI.menuUnmarkClick(async () => {
    await markRename('');
});

async function markRename(suffix) {
    /* @param {string} suffix: '_nmd' or '' */
    let markFailedNum = 0;
    for (const div of lastDivSelecteds) {
        const selectedImg = div.querySelector('img');
        const oldName = selectedImg.alt;

        let imgDir = selectedImg.src.slice(0, selectedImg.src.lastIndexOf('/'));
        imgDir = decodeURIComponent(imgDir);
        // 去掉file:前缀
        if (imgDir.startsWith('file:///')) {
            imgDir = imgDir.slice(8);
        }

        let newNameNonSuffix = oldName.slice(0, oldName.lastIndexOf('.'));
        if (newNameNonSuffix.endsWith('_nmd')) {
            newNameNonSuffix = newNameNonSuffix.slice(0, -4);
        }

        let newName = newNameNonSuffix + suffix + oldName.substring(oldName.lastIndexOf("."));
        console.log(oldName, newName);
        if (oldName != newName) {
            let isRenamed = await window.electronAPI.renameImg(imgDir, oldName, newName);
            if (isRenamed == 0) {
                // 重命名失败的话，为图片添加数字后缀再次重命名
                let nameCount = 0;
                do {
                    newName = newNameNonSuffix + nameCount + suffix + oldName.substring(oldName.lastIndexOf("."));
                    isRenamed = await window.electronAPI.renameImg(imgDir, oldName, newName);
                    console.log('Rename: ', oldName, newName, isRenamed);
                    nameCount += 1;
                } while (isRenamed == 0);
                if (isRenamed == 2) {
                    markFailedNum += 1;
                }
            }
        }
    }
    await update(filterTypeBuffer, filterTextBuffer);
    if (markFailedNum > 0) {
        errorBox.getElementsByTagName('p')[0].textContent = `${markFailedNum}张图片更改失败`;
        errorBox.style.display = 'block';
    }
}