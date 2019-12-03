import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import useKeyPress from '../hooks/useKeyPress';
import useIpcRenderer from '../hooks/useIpcRenderer';

const FileSearch = ({
  title,
  onFileSearch,
}) => {
  const [inputActive, setInputActive] = useState(false);
  const [value, setValue] = useState('');
  const enterPressed = useKeyPress(13);
  const escPressed = useKeyPress(27);
  let node = useRef(null);

  const startSearch = () => {
    setInputActive(true);
  };

  const closeSearch = () => {
    setInputActive(false);
    setValue('');
    onFileSearch('');
  };

  useEffect(() => {
    if (enterPressed && inputActive) {
      onFileSearch(value);
    }
    if (escPressed && inputActive) {
      closeSearch();
    }
  });

  useEffect(() => {
    if (inputActive) {
      node.current.focus();
    }
  }, [inputActive]);

  useIpcRenderer({
    'search-file': startSearch,
  });

  return (
    <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
      {
        !inputActive && (
          <>
            <span>{title}</span>
            <button
              type="button"
              className="icon-button"
              onClick={() => { setInputActive(true) }}
            >
              <FontAwesomeIcon title="搜索" icon={faSearch} size="lg" />
            </button>
          </>
        )
      }
      {
        inputActive && (
          <>
            <input
              className="form-control"
              value={value}
              ref={node}
              onChange={(e) => { setValue(e.target.value) }}
            />
            <button
              type="button"
              className="icon-button"
              onClick={closeSearch}
            >
              <FontAwesomeIcon title="关闭" icon={faTimes} size="lg" />
            </button>
          </>
        )
      }
    </div>
  );
};

FileSearch.propTypes = {
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired,
}

FileSearch.defaultProps = {
  title: '我的云文档'
}

export default FileSearch;
