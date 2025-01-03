const pathListDiv = document.getElementById('path-list');
const addPathBtn = document.getElementById('add-path');
const removePathBtn = document.getElementById('remove-path');
const moveUpBtn = document.getElementById('move-up');
const moveDownBtn = document.getElementById('move-down');

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
        pathDiv.innerText = path;
        pathDiv.id = 'path-' + index;
        pathDiv.addEventListener('click', () => {
            if (lastPathItemSelected) {
                lastPathItemSelected.classList.remove('selected');
            }
            lastPathItemSelected = pathDiv;
            pathDiv.classList.add('selected');
        });
    });
}

addPathBtn.addEventListener('click', async () => {
    await window.electronAPI.addImgPath();
    await configPathBoxUpdate();
});

removePathBtn.addEventListener('click', async () => {
    if (!lastPathItemSelected) {
        return;
    }
    const index = parseInt(lastPathItemSelected.id.split('-')[1]);
    console.log('remove: ', index);
    await window.electronAPI.removeImgPath(index);
    await configPathBoxUpdate();
});

async function savePathOrder() {
    const pathDivs = pathListDiv.querySelectorAll('.path-item');    
    const pathList = [];
    pathDivs.forEach((pathDiv, index) => {
        pathList.push(pathDiv.innerText);
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
    console.log(lastPathItemSelected)
    await savePathOrder();
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
});
