const imgContainer = document.getElementById('img-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const configButton = document.getElementById('change-img-path');
const filterButton = document.getElementById('filter-button');
const filterMenu = document.getElementById('filter-menu');
const filterAllButton = document.getElementById('filter-all');
const filterFilteredButton = document.getElementById('filter-filtered');
const filterUnfilteredButton = document.getElementById('filter-unfiltered');
const renameInput = document.getElementById('rename-input');
const renameButton = document.getElementById('rename-button');
const downloadImgButton = document.getElementById('download-img');
const errorBox = document.getElementById('error-box');

let lastDivSelected = null;

filterMenu.style.display = 'none';
errorBox.style.display = 'none';
let filterTypeBuffer = 'all';

let filterTextsBuffer = [];

update();

async function update(filterType = 'all', filterTexts = []) {
    // 清除选择
    lastDivSelected = null;

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
    })
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
}

configButton.addEventListener('click', async () => {
    await window.electronAPI.updateImgPath();
    await update(filterTypeBuffer, filterTextsBuffer);
});

function imgSelect() {
    // 获取当前div
    console.log(this.classList);
    if (this.classList.contains('selected')) {
        console.log('d');
        downloadImgButton.click();
        this.classList.remove('selected');
    } else if (lastDivSelected) {
        lastDivSelected.classList.remove('selected');
    }
    lastDivSelected = this;
    this.classList.add('selected');
}

filterButton.addEventListener('click', () => {
    if (filterMenu.style.display == 'block') {
        filterMenu.style.display = 'none';
    } else {
        filterMenu.style.display = 'block';
    }
});

document.body.addEventListener('click', (event) => {
    if (!filterButton.contains(event.target) && filterMenu.style.display == 'block' && !filterMenu.contains(event.target)) {
        filterMenu.style.display = 'none';
    }
    if (errorBox.style.display == 'block' && !errorBox.contains(event.target)) {
        errorBox.style.display = 'none';
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

searchButton.addEventListener('click', () => {
    const searchText = searchInput.value;
    filterTextsBuffer = searchText.split('');
    update(filterTypeBuffer, filterTextsBuffer);
});

searchInput.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
        searchButton.click();
    }
});

renameButton.addEventListener('click', async () => {
    const selectedImg = lastDivSelected.querySelector('img');
    const oldName = selectedImg.alt;
    const newName = renameInput.value + oldName.substring(oldName.lastIndexOf("."));
    console.log(typeof oldName, oldName, typeof newName, newName);
    const isRenamed = await window.electronAPI.renameImg(oldName, newName);
    if (isRenamed) {
        update(filterTypeBuffer, filterTextsBuffer);
    } else {
        errorBox.style.display = 'block';
    }
});

renameInput.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
        renameButton.click();
    }
});

downloadImgButton.addEventListener('click', async () => {
    const selectedImg = lastDivSelected.querySelector('img');
    const imgName = selectedImg.alt;
    window.electronAPI.copyImg(imgName);
});