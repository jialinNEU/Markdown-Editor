import React, { useState } from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import uuidv4 from 'uuid/v4';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import defaultFiles from './utils/defaultFiles';
import { flattenArr, objToArr } from './utils/helper';
import 'bootstrap/dist/css/bootstrap.min.css';
import "easymde/dist/easymde.min.css"
import './App.css';

const App = () => {
  const [ files, setFiles ] = useState(flattenArr(defaultFiles));
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
    // if openedFiles don't have the current ID, then add new fileID to openedFiles
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([ ...openedFileIDs, fileID ]);
    }
  };

  const fileChange = (id, value) => {
    const newFile = { ...files[id], body: value };
    setFiles({ ...files, [id]: newFile });
    // 更新 unsavedFileIDs
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([ ...unsavedFileIDs, id ]);
    }
  };

  const deleteFile = (id) => {
    delete files[id];
    setFiles(files);
    // 关闭要删除的文件的tab
    tabClose(id);
  };

  const updateFileName = (id, title) => {
    const modifiedFile = { ...files[id], title, isNew: false };
    setFiles({ ...files, [id]: modifiedFile });
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

  const importFiles = () => {

  };

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
