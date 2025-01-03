const imgContainer = document.getElementById('img-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const configButton = document.getElementById('config-button');
const configMenu = document.getElementById('config-menu');
const changePathInput = document.getElementById('change-path-input');
const changePathButton = document.getElementById('change-path-button');
const sizeSelector = document.getElementById('img-size-select');
const filterButton = document.getElementById('filter-button');
const filterMenu = document.getElementById('filter-menu');
const filterAllButton = document.getElementById('filter-all');
const filterFilteredButton = document.getElementById('filter-filtered');
const filterUnfilteredButton = document.getElementById('filter-unfiltered');
const renameInput = document.getElementById('rename-input');
const renameButton = document.getElementById('rename-button');
const downloadImgButton = document.getElementById('download-img');
const errorBox = document.getElementById('error-box');
const sizeStyle = document.getElementById('image-width');
const emojiButton = document.getElementById('emoji-button');
const emojiBox = document.getElementById('emoji-box');

// 测试代码
// console.log(window.electronAPI.test());

// -------初始化开始-------
let lastDivSelecteds = null;
let lastInputSelected = searchInput;

let filterTypeBuffer = 'all';
let filterTextBuffer = '';

filterMenu.style.display = 'none';
errorBox.style.display = 'none';
configMenu.style.display = 'none';
emojiBox.style.display = 'none';

function initEmojiBox() {
    const emojiList = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '🫠', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏', '😒', '🙄', '😬', '🤥', '🫨', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'];
    emojiList.forEach(emoji => {
        const emojiDiv = emojiBox.appendChild(document.createElement('div'));
        emojiDiv.textContent = emoji;
        emojiDiv.addEventListener('click', () => {
            lastInputSelected.value += emoji;
        });
    });
}

initEmojiBox();

async function initUpdate () {
    sizeSelector.value = await window.electronAPI.getSize();
    console.log("Your image display size is: ", sizeSelector.value);
    changeImageSize(sizeSelector.value);
    await update();
}

initUpdate();
// -------初始化结束-------

async function update(filterType = 'all', filterText = '') {
    window.electronAPI.rendererLog('Updating with filterType [' + filterType + '] ...');
    // 清除选择
    lastDivSelecteds = null;

    // 删除所有图片
    const imgDivs = imgContainer.querySelectorAll('.img-div');
    imgDivs.forEach(imgDiv => {
        imgDiv.remove();
    });

    // 获取图片列表
    const imgList = await window.electronAPI.getImages(filterType, filterText);
    console.log(imgList);

    // 显示图片
    let idCounter = 0;
    imgList.forEach(img => {
        // 获取图片名称
        const imgName = img[1].slice(0, img[1].lastIndexOf('.'));

        // 创建图片元素并添加到容器中
        const imgDivElement = imgContainer.appendChild(document.createElement('div'));
        imgDivElement.classList.add('img-div');
        imgDivElement.id = 'img-div-' + idCounter;
        imgDivElement.addEventListener('click', imgSelect);
        imgDivElement.addEventListener('contextmenu', contextMenu);

        const imgOuterElement = imgDivElement.appendChild(document.createElement('div'));
        imgOuterElement.classList.add('img-outer');

        const imgElement = imgOuterElement.appendChild(document.createElement('img'));
        if (img[0][img[0].length - 1] != '/') { img[0] += '/'; }
        imgElement.src = img[0] + img[1];
        imgElement.alt = img[1];

        const titleElement = imgDivElement.appendChild(document.createElement('p'));
        titleElement.textContent = imgName;

        idCounter++;
    });

    if (filterType == 'unfiltered') {
        // 筛选模式为“未命名”时，自动选择第一张图片，方便命名
        lastDivSelecteds = [document.getElementById('img-div-0')];
        lastDivSelecteds[0].classList.add('selected');
    }
}

function imgSelect(event) {
    console.log('imgSelect前：', lastDivSelecteds);
    if (event.ctrlKey && event.button === 0) {
        // 按住Ctrl左键单击
        if (lastDivSelecteds) {
            if (lastDivSelecteds.includes(this)) {
                lastDivSelecteds.splice(lastDivSelecteds.indexOf(this), 1);
                this.classList.remove('selected');
                if (lastDivSelecteds.length == 0) {
                    lastDivSelecteds = null;
                }
            } else {
                lastDivSelecteds.push(this);
                this.classList.add('selected');
            }
        } else {
            lastDivSelecteds = [this];
            this.classList.add('selected');
        }
    } else if (event.shiftKey && event.button === 0) {
        // 按住Shift左键单击
        if (lastDivSelecteds) {
            if (lastDivSelecteds.length == 0) {
                lastDivSelecteds = [this];
                this.classList.add('selected');
            } else {
                const firstDivSelected = lastDivSelecteds[0];
                const firstIdNum = parseInt(firstDivSelected.id.substring(8));
                const lastIdNum = parseInt(this.id.substring(8));
                console.log(this.id.slice(1, this.id.lastIndexOf('-')));
                lastDivSelecteds.forEach(div => {
                    div.classList.remove('selected');
                });
                lastDivSelecteds = [];
                if (firstIdNum <= lastIdNum) {
                    for (let i = firstIdNum; i <= lastIdNum; i++) {
                        const div = document.getElementById('img-div-' + i);
                        div.classList.add('selected');
                        lastDivSelecteds.push(div);
                    }
                } else {
                    for (let i = firstIdNum; i >= lastIdNum; i--) {
                        const div = document.getElementById('img-div-' + i);
                        div.classList.add('selected');
                        lastDivSelecteds.push(div);
                    }
                }
            }
        } else {
            lastDivSelecteds = [this];
            this.classList.add('selected');
        }
    } else if (event.button === 0) {
        // 左键单击
        if (lastDivSelecteds) {
            lastDivSelecteds.forEach(div => {
                div.classList.remove('selected');
            });
        }
        lastDivSelecteds = [this];
        this.classList.add('selected');
    } else if (event.button === 2) {
        // 右键单击
        // 右键单击非选中项，取消选中
        if (lastDivSelecteds) {
            if (lastDivSelecteds.length == 1) {
                lastDivSelecteds[0].classList.remove('selected');
                this.classList.add('selected');
                lastDivSelecteds = [this];
            } else if (!lastDivSelecteds.includes(this)) {
                lastDivSelecteds.forEach(div => {
                    div.classList.remove('selected');
                });
                this.classList.add('selected');
                lastDivSelecteds = [this];
            }
        } else {
            this.classList.add('selected');
            lastDivSelecteds = [this];
        }
    }
    console.log('imgSelect后：', lastDivSelecteds);
}

// 设置
configButton.addEventListener('click', async () => {
    if (configMenu.style.display == 'block') {
        configMenu.style.display = 'none';
        window.electronAPI.rendererLog('Config menu closed.');
    } else {
        changePathInput.value = await window.electronAPI.getImgPath();
        sizeSelector.value = await window.electronAPI.getSize();
        console.log(sizeSelector.value);
        configMenu.style.display = 'block';
        window.electronAPI.rendererLog('Config menu opened.');
    }
});

changePathButton.addEventListener('click', async () => {
    window.electronAPI.rendererLog('Changing image path...');
    await window.electronAPI.setImgPath();
    changePathInput.value = await window.electronAPI.getImgPath();
    await update(filterTypeBuffer, filterTextBuffer);
});

function changeImageSize(value) {
    switch (value) {
        case '1':
            sizeStyle.href = './style/imageWidth/imageWidth1125.css';
            break;
        case '2':
            sizeStyle.href = './style/imageWidth/imageWidth1500.css';
            break;
        case '3':
            sizeStyle.href = './style/imageWidth/imageWidth1875.css';
            break;
        case '4':
            sizeStyle.href = './style/imageWidth/imageWidth2250.css';
            break;
        case '5':
            sizeStyle.href = './style/imageWidth/imageWidth2625.css';
            break;
        case '6':
            sizeStyle.href = './style/imageWidth/imageWidth3000.css';
            break;
        default:
            sizeStyle.href = './style/imageWidth/imageWidth1500.css';
    }
    window.electronAPI.rendererLog('Changed image size level to: ', value);
}

sizeSelector.addEventListener('change', async () => {
    changeImageSize(sizeSelector.value);
    await window.electronAPI.setSize(sizeSelector.value);
    await update(filterTypeBuffer, filterTextBuffer);
});

// 右键菜单
function contextMenu(event) {
    imgSelect.call(this, event);
    const arg = {
        x: event.clientX,
        y: event.clientY
    }
    window.electronAPI.menuClick(arg);
}

// 关闭Box和菜单
function closeBox(event) {
    if (!filterButton.contains(event.target) && filterMenu.style.display == 'block' && !filterMenu.contains(event.target)) {
        filterMenu.style.display = 'none';
    }
    if (!configButton.contains(event.target) && configMenu.style.display == 'block' && !configMenu.contains(event.target)) {
        configMenu.style.display = 'none';
    }
    if (errorBox.style.display == 'block' && !errorBox.contains(event.target)) {
        errorBox.style.display = 'none';
    }
    if (!emojiButton.contains(event.target) && emojiBox.style.display == 'block' && !emojiBox.contains(event.target)) {
        emojiBox.style.display = 'none';
    }
}

document.body.addEventListener('click', (event) => {
    closeBox(event);
});

document.body.addEventListener('contextmenu', (event) => {
    closeBox(event);
});

// 筛选
filterButton.addEventListener('click', () => {
    if (filterMenu.style.display == 'block') {
        filterMenu.style.display = 'none';
    } else {
        filterMenu.style.display = 'block';
        window.electronAPI.rendererLog('Filter menu opened.');
    }
});

filterAllButton.addEventListener('click', () => {
    filterTypeBuffer = 'all';
    update(filterTypeBuffer, filterTextBuffer);
});

filterFilteredButton.addEventListener('click', () => {
    filterTypeBuffer = 'filtered';
    update(filterTypeBuffer, filterTextBuffer);
});

filterUnfilteredButton.addEventListener('click', () => {
    filterTypeBuffer = 'unfiltered';
    update(filterTypeBuffer, filterTextBuffer);
});

// 搜索图片
searchButton.addEventListener('click', (event) => {
    event.stopPropagation();
    window.electronAPI.rendererLog('Searching images...');
    filterTextBuffer = searchInput.value;
    update(filterTypeBuffer, filterTextBuffer);
});

searchInput.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.keyCode === 13) {
        searchButton.click();
    }
});

searchInput.addEventListener('focus', () => {
    lastInputSelected = searchInput;
    window.electronAPI.rendererLog('Search input focused.');
});

// 重命名图片
renameButton.addEventListener('click', async (event) => {
    window.electronAPI.rendererLog('Renaming images...');
    event.stopPropagation();
    errorBox.getElementsByTagName('p')[0].textContent = '正在重命名，请稍候...';
    errorBox.style.display = 'block';
    if (!lastDivSelecteds) {
        window.electronAPI.rendererLog('Renaming failed, no image selected.', 'error');
        errorBox.getElementsByTagName('p')[0].textContent = '重命名失败，未选中表情包';
        errorBox.style.display = 'block';
        return;
    }
    if (renameInput.value === '' || removeSpecialChar(renameInput.value) === '') {
        window.electronAPI.rendererLog('Renaming failed, new name is empty.', 'error');
        errorBox.getElementsByTagName('p')[0].textContent = '重命名失败，新名称不能为空';
        errorBox.style.display = 'block';
        return;
    }
    if (lastDivSelecteds.length == 1) {
        window.electronAPI.rendererLog('Renaming single image...')
        const selectedImg = lastDivSelecteds[0].querySelector('img');
        const oldName = selectedImg.alt;
        let imgDir = selectedImg.src.slice(0, selectedImg.src.lastIndexOf('/'));
        imgDir = decodeURIComponent(imgDir);
        // 去掉file:前缀
        if (imgDir.startsWith('file:///')) {
            imgDir = imgDir.slice(8);
        }
        const newNameNonSuffix = removeSpecialChar(renameInput.value);
        let newName = newNameNonSuffix + oldName.substring(oldName.lastIndexOf("."));
        console.log(imgDir, oldName, newName);
        let isRenamed = await window.electronAPI.renameImg(imgDir, oldName, newName);
        if (isRenamed == 0) {
            // 重命名失败的话，为图片添加数字后缀再次重命名
            let nameCount = 0;
            do {
                newName = newNameNonSuffix + nameCount + oldName.substring(oldName.lastIndexOf("."));
                isRenamed = await window.electronAPI.renameImg(imgDir, oldName, newName);
                console.log('Rename: ', oldName, newName, isRenamed);
                nameCount += 1;
            } while (isRenamed == 0);
        }
        if (isRenamed == 1) {
            update(filterTypeBuffer, filterTextBuffer);
        } else if (isRenamed == 2) {
            errorBox.getElementsByTagName('p')[0].textContent = '重命名失败，其他错误';
            errorBox.style.display = 'block';
        }
    } else if (lastDivSelecteds.length > 1) {
        window.electronAPI.rendererLog('Renaming multiple images...')
        let nameCount = 0;
        const newNameNonSuffix = removeSpecialChar(renameInput.value);
        console.log(lastDivSelecteds);
        for (const div of lastDivSelecteds) {
            console.log('进入for循环');
            const selectedImg = div.querySelector('img');
            const oldName = selectedImg.alt;
            let imgDir = selectedImg.src.slice(0, selectedImg.src.lastIndexOf('/'));
            imgDir = decodeURIComponent(imgDir);
            // 去掉file:前缀
            if (imgDir.startsWith('file:///')) {
                imgDir = imgDir.slice(8);
            }
            console.log(oldName);
            let isRenamed = 0;
            do {
                const newName = newNameNonSuffix + nameCount + oldName.substring(oldName.lastIndexOf("."));
                isRenamed = await window.electronAPI.renameImg(imgDir, oldName, newName);
                console.log('Rename: ', oldName, newName, isRenamed);
                nameCount += 1;
            } while (isRenamed == 0);
            if (isRenamed == 2) {
                errorBox.getElementsByTagName('p')[0].textContent = '重命名中断，请检查名字是否过长或存在其他问题';
                errorBox.style.display = 'block';
                break;
            }
        }
        update(filterTypeBuffer, filterTextBuffer);
    }
    errorBox.style.display = 'none';
});

renameInput.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.keyCode === 13) {
        renameButton.click();
    }
});

renameInput.addEventListener('focus', () => {
    lastInputSelected = renameInput;
    window.electronAPI.rendererLog('Renaming input focused.');
});

window.electronAPI.menuRenameClick(() => {
    renameButton.click();
});

function removeSpecialChar(inputStr) {
    // 去除特殊字符
    let resultStr = inputStr;
    resultStr = resultStr.replace(/[\\\/\:\*\?\"\<\>\|]/g, '');
    return resultStr;
}

// OCR重命名图片
window.electronAPI.menuOCRClick(async () => {
    window.electronAPI.rendererLog('OCR renaming images...');
    errorBox.getElementsByTagName('p')[0].textContent = '正在重命名，请稍候...';
    errorBox.style.display = 'block';
    if (!lastDivSelecteds) {
        errorBox.getElementsByTagName('p')[0].textContent = '重命名失败，未选中表情包';
        errorBox.style.display = 'block';
        return;
    }
    const selectNum = lastDivSelecteds.length;
    let ocrFailedNum = 0;
    let oldNames = [];
    let imgDirs = [];
    for (const div of lastDivSelecteds) {
        const selectedImg = div.querySelector('img');
        const oldName = selectedImg.alt;
        oldNames.push(oldName);
        let imgDir = selectedImg.src.slice(0, selectedImg.src.lastIndexOf('/'));
        imgDir = decodeURIComponent(imgDir);
        // 去掉file:前缀
        if (imgDir.startsWith('file:///')) {
            imgDir = imgDir.slice(8);
        }
        imgDirs.push(imgDir);
    }
    let newNameNonSuffixs = await window.electronAPI.ocrImg(imgDirs, oldNames);
    for (let [index, newNameNonSuffix] of newNameNonSuffixs.entries()) {
        newNameNonSuffix = removeSpecialChar(newNameNonSuffix);
        const oldName = oldNames[index];
        const imgDir = imgDirs[index];
        if (newNameNonSuffix === '') {
            ocrFailedNum += 1;
            continue;
        }
        let newName = newNameNonSuffix + oldName.substring(oldName.lastIndexOf("."));
        console.log(oldName, newName);
        let isRenamed = await window.electronAPI.renameImg(imgDir, oldName, newName);
        if (isRenamed == 0) {
            // 重命名失败的话，为图片添加数字后缀再次重命名
            let nameCount = 0;
            do {
                newName = newNameNonSuffix + nameCount + oldName.substring(oldName.lastIndexOf("."));
                isRenamed = await window.electronAPI.renameImg(imgDir, oldName, newName);
                console.log('Rename: ', oldName, newName, isRenamed);
                nameCount += 1;
            } while (isRenamed == 0);
            if (isRenamed == 2) {
                ocrFailedNum += 1;
            }
        }
    }
    update(filterTypeBuffer, filterTextBuffer);
    window.electronAPI.rendererLog(`OCR rename: ${selectNum - ocrFailedNum} images success, ${ocrFailedNum} images failed`);
    errorBox.getElementsByTagName('p')[0].textContent = `重命名成功${selectNum - ocrFailedNum}张，失败${ocrFailedNum}张`;
    errorBox.style.display = 'block';
});

// 在现有名称的基础上修改图片名称
window.electronAPI.menuModifyClick(async () => {
    window.electronAPI.rendererLog('Modifying image name...');
    if (!lastDivSelecteds) {
        window.electronAPI.rendererLog('Modifying image name failed, no image selected.', 'error');
        errorBox.getElementsByTagName('p')[0].textContent = '未选中表情包';
        errorBox.style.display = 'block';
        return;
    }
    if (lastDivSelecteds.length == 1) {
        const selectedImg = lastDivSelecteds[0].querySelector('img');
        const imgName = selectedImg.alt.slice(0, selectedImg.alt.lastIndexOf('.'));
        renameInput.value = imgName;
        renameButton.focus();
        lastInputSelected = renameInput;
    } else if (lastDivSelecteds.length > 1) {
        window.electronAPI.rendererLog('Modifying image name failed, only one image can be modified at a time.', 'error');
        errorBox.getElementsByTagName('p')[0].textContent = '选择了多张表情包，只能同时修改一张表情包的名称';
        errorBox.style.display = 'block';
    }
});

// 复制图片
downloadImgButton.addEventListener('click', async (event) => {
    window.electronAPI.rendererLog('Copying image...');
    event.stopPropagation();
    if (!lastDivSelecteds) {
        window.electronAPI.rendererLog('Copying image failed, no image selected.', 'warn');
        errorBox.getElementsByTagName('p')[0].textContent = '复制失败，未选中表情包';
        errorBox.style.display = 'block';
        return;
    }
    if (lastDivSelecteds.length == 1) {
        const selectedImg = lastDivSelecteds[0].querySelector('img');
        const imgName = selectedImg.alt;
        window.electronAPI.copyImg(imgName);
    } else {
        window.electronAPI.rendererLog('Copying multiple images failed, only one image can be copied at a time.', 'warn');
        errorBox.getElementsByTagName('p')[0].textContent = '复制失败，无法同时复制多个表情包';
        errorBox.style.display = 'block';
    }
});

window.electronAPI.menuCopyClick(() => {
    downloadImgButton.click();
});

document.body.addEventListener('keydown', (event) => {
    closeBox(event);
    if (event.ctrlKey && event.key === 'c') {
        downloadImgButton.click();
    }
});

// emoji 输入
emojiButton.addEventListener('click', () => {
    if (emojiBox.style.display == 'block') {
        emojiBox.style.display = 'none';
    } else {
        emojiBox.style.display = 'block';
        window.electronAPI.rendererLog('Emoji box opened.');
    }
});