import React, { useState } from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import uuidv4 from 'uuid/v4';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import fileHelper from './utils/fileHelper';
import { flattenArr, objToArr } from './utils/helper';
import useIpcRenderer from './hooks/useIpcRenderer';
import 'bootstrap/dist/css/bootstrap.min.css';
import "easymde/dist/easymde.min.css"
import './App.css';

// require node.js modules
const { join, basename, extname, dirname } = window.require('path');
const { remote } = window.require('electron');
const Store = window.require('electron-store');

// 只持久化'索引信息'
const fileStore = new Store({name: 'Files Data'});
const settingStore = new Store({name: 'Settings'});

const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title , createdAt } = file;
    result[id] = { id, path, title, createdAt };
    return result;
  }, {});
  fileStore.set('files', filesStoreObj);
};


const App = () => {
  const [ files, setFiles ] = useState(fileStore.get('files') || {});
  const [ activeFileID, setActiveFileID ] = useState('');
  const [ openedFileIDs, setOpenedFileIDs ] = useState([]);
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([]);
  const [ searchedFiles, setSearchedFiles ] = useState([]);

  const filesArr = objToArr(files);
  const activeFile = files[activeFileID];
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr;
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID];
  });

  // 通过 remote 获取 electron 主线程的方法
  const savedLocation = settingStore.get('savedFileLocation') || remote.app.getPath('documents');

  /* callback methods */

  const tabClick = (fileID) => {
    setActiveFileID(fileID);
  };

  const tabClose = (id) => {
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id);
    setOpenedFileIDs(tabsWithout);
    // 将剩余tab中第一个打开的高亮
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0]);
    } else {
      setActiveFileID('');
    }
  };

  const fileClick = (fileID) => {
    setActiveFileID(fileID);
    // 点击 file 的同时，加载 file 内容
    const currentFile = files[fileID];
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true };
        setFiles({ ...files, [fileID]: newFile });
        /* 此处不需要持久化，非索引信息 */
      });
    }

    // if openedFiles don't have the current ID, then add new fileID to openedFiles
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([ ...openedFileIDs, fileID ]);
    }
  };

  const fileChange = (id, value) => {
    if (value !== files[id].body) {
      const newFile = { ...files[id], body: value };
      setFiles({ ...files, [id]: newFile });
      // 更新 unsavedFileIDs
      if (!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([ ...unsavedFileIDs, id ]);
      }
    }
  };

  const deleteFile = (id) => {
    if (files[id].isNew) {
      const { [id]: value, ...afterDelete } = files;
      setFiles(afterDelete);
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        const { [id]: value, ...afterDelete } = files;
        setFiles(afterDelete);
        // 持久化
        saveFilesToStore(afterDelete);
        // 关闭要删除的文件的tab
        tabClose(id);
      });
    }
  };

  const updateFileName = (id, title, isNew) => {
    // newPath 应该根据 isNew 的值而定
    const newPath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[id].path), `${title}.md`);
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath };
    const newFiles = { ...files, [id]: modifiedFile };

    if (isNew) {
      // 新建，存入本地
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles);
        // 持久化
        saveFilesToStore(newFiles);
      });
    } else {
      // 更新，存入本地
      const oldPath = files[id].path;
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles);
        // 持久化
        saveFilesToStore(newFiles);
      });
    }
  };

  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword));
    setSearchedFiles(newFiles);
  };

  const createNewFile = () => {
    const newID = uuidv4();
    const newFile = {
      id: newID,
      title: '',
      body: '## 请输入 Markdown',
      createdAt: new Date().getTime(),
      isNew: true,
    };
    setFiles({ ...files, [newID]: newFile });
  };

  const saveCurrentFile = () => {
    fileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id));
    });
  };

  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown files', extensions: ['md'] },
      ],
    }).then((res) => {
      const { filePaths } = res;
      if (Array.isArray(filePaths)) {
        // 过滤 electron-store 中已有的 path
        const filteredFilePaths = filePaths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path;
          });
          return !alreadyAdded;
        });
        
        // 增强 filePaths 数组，使其包含文件信息
        const importFilesArr = filteredFilePaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path,
          };
        });

        // flatten array
        const newFiles = { ...files, ...flattenArr(importFilesArr) };

        // 更新 state 和 store
        setFiles(newFiles);
        saveFilesToStore(newFiles);
        if (importFilesArr.length > 0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: `成功导入了${importFilesArr.length}个文件`,
            message: `成功导入了${importFilesArr.length}个文件`,
          });
        }
      }
    });
  };


  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile,
  });


  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch
            title="我的云文档"
            onFileSearch={fileSearch}
          />
          <FileList
            files={fileListArr}
            onFileClick={fileClick} 
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn text="新建" colorClass="btn-primary" icon={faPlus} onBtnClick={createNewFile} />
            </div>
            <div className="col">
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileImport} onBtnClick={importFiles} />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          {
            !activeFile && (
              <div className="start-page">
                选择或者创建新的 Markdown 文档
              </div>
            )
          }
          {
            activeFile && (
              <React.Fragment>
                <TabList
                  files={openedFiles}
                  activeId={activeFileID}
                  unsavedIds={unsavedFileIDs}
                  onTabClick={tabClick}
                  onCloseTab={tabClose}
                />
                <SimpleMDE
                  key={activeFile.id}
                  value={activeFile.body}
                  onChange={(value) => {fileChange(activeFile.id, value)}}
                  options={{ minHeight: '515px' }}
                />
              </React.Fragment>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default App;
