const { remote, ipcRenderer } = require('electron');
const Store = require('electron-store');

const settingsStore = new Store({name: 'Settings'})
// const qiniuConfigArr = ['#savedFileLocation','#accessKey', '#secretKey', '#bucketName']

const $ = (selector) => {
  const result = document.querySelectorAll(selector);
  return result.length > 1 ? result : result[0];
};

// window.onload 和 DOMContentLoaded 的区别？
document.addEventListener('DOMContentLoaded', () => {
  let savedLocation = settingsStore.get('savedFileLocation');

  if (savedLocation) {
    $('#savedFileLocation').value = savedLocation;
  }

  $('#select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的存储路径',
    }).then(({ filePaths }) => {
      if (Array.isArray(filePaths)) {
        $('#savedFileLocation').value = filePaths[0];
        savedLocation = filePaths[0];
      }
    });
  });

  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    settingsStore.set('savedFileLocation', savedLocation);
    remote.getCurrentWindow().close();
  });
});