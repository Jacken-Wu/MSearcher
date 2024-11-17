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


// -------初始化开始-------
let lastDivSelecteds = null;

let filterTypeBuffer = 'all';
let filterTextsBuffer = [];

filterMenu.style.display = 'none';
errorBox.style.display = 'none';
configMenu.style.display = 'none';

async function initUpdate () {
    sizeSelector.value = await window.electronAPI.getSize();
    console.log("Your image display size is: ", sizeSelector.value);
    changeImageSize(sizeSelector.value);
    await update();
}

initUpdate();
// -------初始化结束-------

async function update(filterType = 'all', filterTexts = []) {
    // 清除选择
    lastDivSelecteds = null;

    // 删除所有图片
    const imgDivs = imgContainer.querySelectorAll('.img-div');
    imgDivs.forEach(imgDiv => {
        imgDiv.remove();
    });

    // 获取图片列表
    const imgList = await window.electronAPI.getImages();
    console.log(imgList);

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

    const imgListFiltered = [];
    // 过滤图片列表
    imgListFilteredTemp.forEach(img => {
        const isFiltered = filterTexts.every(characterm => img.includes(characterm));
        if (isFiltered) {
            imgListFiltered.push(img);
        }
    });
    console.log(imgListFiltered);

    // 获取图片目录
    let imgPath = await window.electronAPI.getImgPath();
    console.log(imgPath);
    if (imgPath[imgPath.length - 1] != '/') { imgPath += '/'; }

    // 显示图片
    let idCounter = 0;
    imgListFiltered.forEach(img => {
        // 获取图片名称
        const imgName = img.slice(0, img.lastIndexOf('.'));

        // 创建图片元素并添加到容器中
        const imgDivElement = document.createElement('div');
        imgDivElement.classList.add('img-div');
        imgDivElement.id = 'img-div-' + idCounter;
        imgDivElement.addEventListener('click', imgSelect);
        imgDivElement.addEventListener('contextmenu', contextMenu);

        const imgOuterElement = imgDivElement.appendChild(document.createElement('div'));
        imgOuterElement.classList.add('img-outer');

        const imgElement = imgOuterElement.appendChild(document.createElement('img'));
        imgElement.src = imgPath + img;
        imgElement.alt = img;

        const titleElement = imgDivElement.appendChild(document.createElement('p'));
        titleElement.textContent = imgName;

        imgContainer.appendChild(imgDivElement);

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
    } else {
        changePathInput.value = await window.electronAPI.getImgPath();
        sizeSelector.value = await window.electronAPI.getSize();
        console.log(sizeSelector.value);
        configMenu.style.display = 'block';
    }
});

changePathButton.addEventListener('click', async () => {
    await window.electronAPI.setImgPath();
    changePathInput.value = await window.electronAPI.getImgPath();
    await update(filterTypeBuffer, filterTextsBuffer);
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

}

sizeSelector.addEventListener('change', async () => {
    changeImageSize(sizeSelector.value);
    await window.electronAPI.setSize(sizeSelector.value);
    await update(filterTypeBuffer, filterTextsBuffer);
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

// 关闭ErrorBox和菜单
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
    }
});

filterAllButton.addEventListener('click', () => {
    filterTypeBuffer = 'all';
    update(filterTypeBuffer, filterTextsBuffer);
});

filterFilteredButton.addEventListener('click', () => {
    filterTypeBuffer = 'filtered';
    update(filterTypeBuffer, filterTextsBuffer);
});

filterUnfilteredButton.addEventListener('click', () => {
    filterTypeBuffer = 'unfiltered';
    update(filterTypeBuffer, filterTextsBuffer);
});

// 搜索图片
searchButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const searchText = searchInput.value;
    filterTextsBuffer = searchText.split('');
    update(filterTypeBuffer, filterTextsBuffer);
});

searchInput.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.keyCode === 13) {
        searchButton.click();
    }
});

// 重命名图片
renameButton.addEventListener('click', async (event) => {
    event.stopPropagation();
    if (!lastDivSelecteds) {
        errorBox.getElementsByTagName('p')[0].textContent = '重命名失败，未选中表情包';
        errorBox.style.display = 'block';
        return;
    }
    if (renameInput.value === '') {
        errorBox.getElementsByTagName('p')[0].textContent = '重命名失败，新名称不能为空';
        errorBox.style.display = 'block';
        return;
    }
    if (lastDivSelecteds.length == 1) {
        const selectedImg = lastDivSelecteds[0].querySelector('img');
        const oldName = selectedImg.alt;
        let newName = renameInput.value + oldName.substring(oldName.lastIndexOf("."));
        console.log(oldName, newName);
        let isRenamed = await window.electronAPI.renameImg(oldName, newName);
        if (!isRenamed) {
            // 重命名失败的话，为图片添加数字后缀再次重命名
            let nameCount = 0;
            do {
                newName = renameInput.value + nameCount + oldName.substring(oldName.lastIndexOf("."));
                isRenamed = await window.electronAPI.renameImg(oldName, newName);
                console.log('Rename: ', oldName, newName, isRenamed);
                nameCount += 1;
            } while (!isRenamed);
        }
        update(filterTypeBuffer, filterTextsBuffer);
    } else if (lastDivSelecteds.length > 1) {
        console.log('批量重命名');
        let nameCount = 0;
        console.log(lastDivSelecteds);
        for (const div of lastDivSelecteds) {
            console.log('进入for循环');
            const selectedImg = div.querySelector('img');
            const oldName = selectedImg.alt;
            console.log(oldName);
            let isRenamed = false;
            do {
                const newName = renameInput.value + nameCount + oldName.substring(oldName.lastIndexOf("."));
                isRenamed = await window.electronAPI.renameImg(oldName, newName);
                console.log('Rename: ', oldName, newName, isRenamed);
                nameCount += 1;
            } while (!isRenamed);
        }
        update(filterTypeBuffer, filterTextsBuffer);
    }
});

renameInput.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.keyCode === 13) {
        renameButton.click();
    }
});

window.electronAPI.menuRenameClick(() => {
    renameButton.click();
});

// 复制图片
downloadImgButton.addEventListener('click', async (event) => {
    event.stopPropagation();
    if (!lastDivSelecteds) {
        errorBox.getElementsByTagName('p')[0].textContent = '复制失败，未选中表情包';
        errorBox.style.display = 'block';
        return;
    }
    if (lastDivSelecteds.length == 1) {
        const selectedImg = lastDivSelecteds[0].querySelector('img');
        const imgName = selectedImg.alt;
        window.electronAPI.copyImg(imgName);
    } else {
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