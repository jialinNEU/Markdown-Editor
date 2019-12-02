import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faMarkdown } from '@fortawesome/free-brands-svg-icons';
import useKeyPress from '../hooks/useKeyPress';
import useContextMenu from '../hooks/useContextMenu';
import { getParentNode } from '../utils/helper';

// 使用 electron 主进程的 Menu 方法
// const { remote } = window.require('electron');
// const { Menu, MenuItem } = remote;

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

  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item');
        if (parentElement) {
          onFileClick(parentElement.dataset.id);
        }
      },
    }, {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item');
        if (parentElement) {
          const { id, title } = parentElement.dataset;
          setEditStatus(id);
          setValue(title);
        }
      },
    }, {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item');
        if (parentElement) {
          onFileDelete(parentElement.dataset.id);
        }
      },
    }
  ], '.file-list', [files]);


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
            data-id={file.id}
            data-title={file.title}
            className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
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
