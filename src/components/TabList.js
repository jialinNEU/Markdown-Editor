import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { faTimes} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './TabList.scss'

const TabList = ({
  files,
  activeId,
  unsavedIds,
  onTabClick,
  onCloseTab,
}) => {

  return (
    <ul className="nav nav-pills tablist-component">
      {
        files.map(file => {
          const withUnsavedMark = unsavedIds.includes(file.id);
          const finalClassname = cx({
            'nav-link': true,
            'active': file.id === activeId,
            'withUnsaved': withUnsavedMark,
          });

          return (
            <li
              key={file.id}
              className="nav-item"
            >
              <a // eslint-disable-line jsx-a11y/anchor-is-valid
                href="#"
                className={finalClassname}
                onClick={(e) => {
                  e.preventDefault();
                  onTabClick(file.id);
                }}
              >
                { file.title }
                <span
                  className="ml-2 close-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </span>
                {
                  // 未保存时，显示红点
                  withUnsavedMark && (
                    <span className="rounded-circle ml-2 unsaved-icon" />
                  )
                }
              </a>
            </li>
          );
        })
      }
    </ul>
  );
};

TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unsaveIds: PropTypes.array,
  onTabClick: PropTypes.func,
  onCloseTab: PropTypes.func,
};

TabList.defaultProps = {
  unsavedIds: [],
};

export default TabList;
