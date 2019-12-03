const { BrowserWindow } = require('electron');

class AppWindow extends BrowserWindow {
  constructor(config, urlLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
      // 在 render 完成后才呈现的优化属性
      show: false,
      backgroundColor: '#efefef',
    };
    const finalConfig = { ...basicConfig, ...config };
    super(finalConfig);
    this.loadURL(urlLocation);
    
    // 对应上面的优化
    this.once('ready-to-show', () => {
      this.show();
    });
  }
}

module.exports = AppWindow;
