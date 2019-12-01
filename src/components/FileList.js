import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faMarkdown } from '@fortawesome/free-brands-svg-icons';
import useKeyPress from '../hooks/useKeyPress';
import useContextMenu from '../hooks/useContextMenu';

// 使用 electron 主进程的 Menu 方法
const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

const FileList = ({
  files,
  onFileClick,
  onFileDelete,
  onSaveEdit,
}) => {
  const [editStatus, setEditStatus] = useState(false);
  const [value, setValue] = useState('');
  const enterPressed = useKeyPress(13);
  const escPressed = useKeyPress(27);

  const closeSearch = (editItem) => {
    setEditStatus(false);
    setValue('');
    if (editItem.isNew) {
      onFileDelete(editItem.id);
    }
  };

  useContextMenu([
    {
      label: '打开',
      click: () => {
        console.log('打开');
      },
    }, {
      label: '重命名',
      click: () => {
        console.log('重命名');
      },
    }, {
      label: '删除',
      click: () => {
        console.log('删除');
      },
    }
  ]);


  useEffect(() => {  // eslint-disable-line react-hooks/exhaustive-deps
    const editItem = files.find(file => file.id === editStatus);
    if (enterPressed && editStatus && value.trim() !== '') {
      onSaveEdit(editItem.id, value, editItem.isNew);
      setEditStatus(false);
      setValue('');
    }
    if (escPressed && editStatus) {
      closeSearch(editItem);
    }
  });

  useEffect(() => {
    const newFile = files.find(file => file.isNew);
    if (newFile) {
      setEditStatus(newFile.id);
      setValue(newFile.title);
    }
  }, [files]);

  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li
            key={file.id}
            className="list-group-item bg-light row d-flex align-items-center mx-0"
          >
            {
              (file.id !== editStatus && !file.isNew) && (
                <React.Fragment>
                  <span className="col-2">
                    <FontAwesomeIcon size="lg" icon={faMarkdown} />
                  </span>
                  <span className="col-6 c-link" onClick={() => {onFileClick(file.id)}}>
                    {file.title}
                  </span>
                  <button
                    type="button"
                    className="icon-button col-2"
                    onClick={
                      () => {
                        setEditStatus(file.id);
                        setValue(file.title);
                      }
                    }
                  >
                    <FontAwesomeIcon title="编辑" icon={faEdit} size="lg" />
                  </button>
                  <button
                    type="button"
                    className="icon-button col-2"
                    onClick={(() => {onFileDelete(file.id)})}
                  >
                    <FontAwesomeIcon title="删除" icon={faTrash} size="lg" />
                  </button>
                </React.Fragment>
              )
            }
            {
              ((file.id === editStatus) || file.isNew) && (
                <React.Fragment>
                  <input
                    className="form-control col-10"
                    value={value}
                    placeholder="请输入文件名称"
                    onChange={(e) => { setValue(e.target.value) }}
                  />
                  <button
                    type="button"
                    className="icon-button col-2"
                    onClick={() => {closeSearch(file)}}
                  >
                    <FontAwesomeIcon title="关闭" icon={faTimes} size="lg" />
                  </button>
                </React.Fragment>
              )
            }
          </li>
        ))
      }
    </ul>
  );
}

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func,
};

export default FileList;
