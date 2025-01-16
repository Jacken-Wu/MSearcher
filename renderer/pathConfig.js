const pathListDiv = document.getElementById('path-list');
const addPathBtn = document.getElementById('add-path');
const removePathBtn = document.getElementById('remove-path');
const moveUpBtn = document.getElementById('move-up');
const moveDownBtn = document.getElementById('move-down');
const enDisPathBtn = document.getElementById('en-dis-path');

let lastPathItemSelected = null;

configPathBoxUpdate();

async function configPathBoxUpdate() {
    // 清除原有路径
    while (pathListDiv.firstChild) {
        pathListDiv.removeChild(pathListDiv.firstChild);
    }
    // 更新路径列表
    const imgPath = await window.electronAPI.getImgPath();
    imgPath.forEach((path, index) => {
        const pathDiv = pathListDiv.appendChild(document.createElement('div'));
        pathDiv.classList.add('path-item');
        if (path.endsWith(':d')) {
            pathDiv.innerText = path.slice(0, -2);
            pathDiv.classList.add('disabled');
        } else {
            pathDiv.innerText = path;
        }
        pathDiv.id = 'path-' + index;
        pathDiv.addEventListener('click', () => {
            if (lastPathItemSelected) {
                lastPathItemSelected.classList.remove('selected');
            }
            lastPathItemSelected = pathDiv;
            pathDiv.classList.add('selected');
        });
    });
    // 记忆上次选择
    if (lastPathItemSelected) {
        lastPathItemSelected = document.querySelector('#' + lastPathItemSelected.id);
        if (lastPathItemSelected) {
            lastPathItemSelected.classList.add('selected');
        }
    }
}

addPathBtn.addEventListener('click', async () => {
    await window.electronAPI.addImgPath();
    await configPathBoxUpdate();
    await update();
});

removePathBtn.addEventListener('click', async () => {
    if (!lastPathItemSelected) {
        return;
    }
    const index = parseInt(lastPathItemSelected.id.split('-')[1]);
    console.log('remove: ', index);
    await window.electronAPI.removeImgPath(index);
    await configPathBoxUpdate();
    await update();
});

async function savePathOrder() {
    const pathDivs = pathListDiv.querySelectorAll('.path-item');
    const pathList = [];
    pathDivs.forEach((pathDiv, index) => {
        if (pathDiv.classList.contains('disabled')) {
            pathList.push(pathDiv.innerText + ':d');
        } else {
            pathList.push(pathDiv.innerText);
        }
        pathDiv.id = 'path-' + index;
    });
    await window.electronAPI.setImgPath(pathList);
}

moveUpBtn.addEventListener('click', async () => {
    if (!lastPathItemSelected) {
        return;
    }
    const index = parseInt(lastPathItemSelected.id.split('-')[1]);
    if (index == 0) {
        return;
    }
    const prevDiv = pathListDiv.querySelector('#path-' + (index - 1));
    const currentDiv = pathListDiv.querySelector('#path-' + index);
    pathListDiv.insertBefore(currentDiv, prevDiv);
    await savePathOrder();
    lastPathItemSelected = document.querySelector('#path-' + (index - 1));
    await update();
});

moveDownBtn.addEventListener('click', async () => {
    if (!lastPathItemSelected) {
        return;
    }
    const index = parseInt(lastPathItemSelected.id.split('-')[1]);
    if (index == pathListDiv.childElementCount - 1) {
        return;
    }
    const currentDiv = pathListDiv.querySelector('#path-' + index);
    const nextDiv = pathListDiv.querySelector('#path-' + (index + 1));
    pathListDiv.insertBefore(nextDiv, currentDiv);
    await savePathOrder();
    lastPathItemSelected = document.querySelector('#path-' + (index + 1));
    await update();
});

enDisPathBtn.addEventListener('click', async () => {
    if (!lastPathItemSelected) {
        return;
    }
    const index = parseInt(lastPathItemSelected.id.split('-')[1]);
    console.log('en-disable: ', index);
    await window.electronAPI.enDisImgPath(index);
    await configPathBoxUpdate();
    await update();
});