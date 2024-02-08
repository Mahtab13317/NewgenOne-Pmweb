import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { RTL_DIRECTION } from "../../Constants/appConstants";
import SearchBox from "../Search Component";

function ButtonDropdown(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const focusedItemRef = useRef(null);
  /*
  props-->{
    1. dropdownOptions is the array which holds options to be shown in the div
    2. onSelect = callback func
    3. optionRenderFunc is the func which is used to fetch option values from some other func -- (optional)
    4. optionKey is the key to print specific value from an option, which is of object type -- (optional)
  }
  */

  //Added on 02/08/2023, bug_id:131808

  const [dataList, setDataList] = useState(null);

  useEffect(() => {
    setDataList(props?.dropdownOptions); //setting dropdown data in local state
    dropdownRef?.current?.focus();
    setSelectedItemIndex(-1);
  }, [props]);

  useEffect(() => {
    // Scroll the focused item into view whenever the selectedItemIndex changes
    if (focusedItemRef.current) {
      focusedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedItemIndex]);

  //search function while user input value in search bar
  const onSearchSubmit = (searchVal) => {
    let arr = [];
    props?.dropdownOptions?.forEach((elem) => {
      if (
        elem[props.optionKey]
          .toLowerCase()
          .includes(searchVal?.trim().toLowerCase())
      ) {
        arr.push(elem);
      }
    });
    setDataList(arr);
    setSelectedItemIndex(-1);
  };
  // handled arrow key navigation
  const handleKeyDown = (event) => {
    //on Tab Click the Menu should get close.
    if (event.key == "Tab") {
      props.handleClose();
    }
    if (!dataList || dataList.length === 0) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedItemIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedItemIndex((prevIndex) =>
        Math.min(prevIndex + 1, dataList.length - 1)
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      props.onSelect(dataList[selectedItemIndex]);
      setSelectedItemIndex(-1);
    }
  };
  return (
    <React.Fragment>
      {props.open ? (
        <ul
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.buttonDropdown
              : styles.buttonDropdown
          }
          style={{ ...props.style, border: 0 }}
          tabIndex={-1}
          role="menu"
          ref={dropdownRef}
          onKeyDown={handleKeyDown}
        >
          {
            //Added on 02/08/2023, bug_id:131808
          }
          {props?.enableSearch ? (
            <div>
              <SearchBox width="100%" onSearchChange={onSearchSubmit} />
            </div>
          ) : null}

          {dataList &&
            dataList.map((option, index) => {
              return (
                <li
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.buttonDropdownData
                      : styles.buttonDropdownData
                  }
                  onClick={() => props.onSelect(option)}
                  id={`${props.id}_${index}`}
                  //Commented tabIndex as KeyDownEvent are already handled and
                  //On Tab Click, the Menu must get close.
                  //tabIndex={0}
                  role="menuitem"
                  aria-disabled="false"
                  style={{
                    border:
                      selectedItemIndex === index
                        ? "1px solid var(--button_color)"
                        : "",
                  }}
                  ref={selectedItemIndex === index ? focusedItemRef : null}
                >
                  {props.optionRenderFunc
                    ? t(props.optionRenderFunc(option))
                    : props.optionKey
                    ? option[props.optionKey]
                    : option}
                </li>
              );
            })}
        </ul>
      ) : null}
    </React.Fragment>
  );
}

export default ButtonDropdown;
