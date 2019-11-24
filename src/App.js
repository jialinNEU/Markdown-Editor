import React from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import defaultFiles from './utils/defaultFiles';
import 'bootstrap/dist/css/bootstrap.min.css';
import "easymde/dist/easymde.min.css"
import './App.css';

const App = () => {

  const createNewFile = () => {

  };

  const importFiles = () => {

  };

  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch
            title="我的云文档"
            onFileSearch={(value) => {console.log(value)}}
          />
          <FileList
            files={defaultFiles}
            onFileClick={(id) => {console.log(id)}}
            onFileDelete={(id) => {console.log(id)}}
            onSaveEdit={(id, newValue) => {console.log(id, newValue)}}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn text="新建" colorClass="btn-primary" icon={faPlus} onBtnClick={createNewFile} />
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileImport} onBtnClick={importFiles} />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          <TabList
            files={defaultFiles}
            activeId="1"
            unsavedIds={['1', '2']}
            onTabClick={(id) => {console.log(id)}}
            onCloseTab={(id) => {console.log(id)}}
          />
          <SimpleMDE
            value={defaultFiles[1].body}
            onChange={(value) => {console.log(value)}}
            options={{ minHeight: '515px' }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
