import React, { useState, useEffect, useRef } from "react";
import {
  ListItem,
  Checkbox,
  FormControlLabel,
  Chip,
  MenuItem,
  Select,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { DEFAULT, RTL_DIRECTION } from "../../Constants/appConstants";
import "./index.css";
import clsx from "clsx";

function MultiSelect(props) {
  const {
    selectAllOption,
    completeList,
    associatedList,
    handleAssociatedList,
    labelKey,
    indexKey,
    id,
    disabled,
    style,
    checkboxStyle,
    checkIcon,
    checkedCheckBoxStyle,
    selectAllStr,
    placeholder,
    showSelectedCount,
    noDataLabel,
    inputId,
    labelId,
    ariaLabel,
  } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [checked, setChecked] = useState(null);
  const [selectedFields, setSelectedFields] = useState([DEFAULT]);
  const [allChecked, setAllChecked] = useState(false);

  /*
  Here, 
  state=>{
    1.checked state is used to maintain the record of checked and unchecked fields in select options list.
    2.SelectedFields state is used to show the checked options, which have to be shown as chips.
  }
  props=>{
    1.completeList is the array of options in select optionList.
    2.associatedList is the array of default selectedFields.
    3.placeholder for select field like Select Variable, Choose Variable, etc.
    4.labelKey -> key which is used to display option from completeList array
    5.indexKey -> key which is used as id
    6.handleAssociatedList is the func to pass new selectedField array to the parent component
    7.noDataLabel -> string to show when no options available -- (optional)
    8.selectAllOption -> boolean to add a checkbox to select all options at once. -- (optional)
    9.selectAllStr -> placeholder for showing in front of select all checkbox. -- (optional: Only works when selectAllOption is true)
  }
  */

  useEffect(() => {
    //code to set initial value in checked state for each item
    let tempCheck = {},
      isAllChecked = true;
    completeList?.forEach((item) => {
      let isElementPresent = false;
      associatedList?.forEach((element) => {
        if (element[labelKey] === item[labelKey]) {
          isElementPresent = true;
        }
      });
      if (isElementPresent) {
        tempCheck = { ...tempCheck, [item[indexKey]]: true };
      } else {
        tempCheck = { ...tempCheck, [item[indexKey]]: false };
        isAllChecked = false;
      }
    });
    setChecked(tempCheck);
    if (associatedList?.length > 0) {
      setSelectedFields(associatedList);
      setAllChecked(isAllChecked);
    } else {
      setAllChecked(false);
    }
  }, [completeList, associatedList]);

  const handleChange = (data, type) => {
    if (type === 0) {
      //type 0 is to add new fields to selected field list
      setSelectedFields((prev) => {
        let newArr = [...prev];
        if (newArr.includes(DEFAULT)) {
          newArr.pop();
        }
        if (!newArr.includes(data)) {
          newArr.push(data);
        }
        handleAssociatedList(newArr);
        return newArr;
      });
    } else if (type === 1) {
      //type 1 is to delete some fields from selected field list
      setSelectedFields((prev) => {
        let newArr = [...prev];
        let indexVal = newArr.indexOf(data);
        newArr.splice(indexVal, 1);
        handleAssociatedList(newArr);
        if (newArr.length <= 0) {
          newArr.push(DEFAULT);
        }
        return newArr;
      });
    }
  };

  const handleAllChange = (checkedVal) => {
    if (checkedVal) {
      setSelectedFields(() => {
        let newArr = [];
        completeList?.forEach((item) => {
          newArr.push(item);
        });
        handleAssociatedList(newArr);
        return newArr;
      });
    } else {
      setSelectedFields(() => {
        let newArr = [];
        newArr.push(DEFAULT);
        handleAssociatedList(newArr);
        return newArr;
      });
    }
  };

  // Function to handle toggle on the checkbox.
  const toggleCheckbox = (data, dataValue) => {
    completeList?.forEach((item) => {
      if (item[indexKey] === data) {
        setChecked((prev) => {
          return {
            ...prev,
            [item[indexKey]]: !prev[item[indexKey]],
          };
        });
      }
    });
    if (checked[data] === false) handleChange(dataValue, 0); //to add to list
    if (checked[data] === true) handleChange(dataValue, 1); //to delete from list
  };

  const toggleSelectAllCheckbox = (checkedVal) => {
    let tempChecked = {};
    completeList?.forEach((item) => {
      tempChecked = { ...tempChecked, [item[indexKey]]: checkedVal };
    });
    setChecked(tempChecked);
    handleAllChange(checkedVal);
    setAllChecked(checkedVal);
  };

  const deleteEntityFromList = (data, dataValue) => {
    //function called when delete icon on chip of selected field is clicked
    completeList &&
      completeList?.forEach((item1) => {
        if (item1[indexKey] === data) {
          setChecked((prev) => {
            return {
              ...prev,
              [item1[indexKey]]: !prev[item1[indexKey]],
            };
          });
        }
      });
    handleChange(dataValue, 1);
  };
  //code for WCAG points
  const listRef = useRef(null); // Reference to the list container
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const focusedItemRef = useRef(null);
  useEffect(() => {
    // Focus the list container on mount and whenever selectedFields changes
    listRef.current?.focus();
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    // Focus the list container on mount and whenever selectedFields changes
    listRef.current?.focus();
    setFocusedIndex(-1);
  }, [selectedFields]);
  useEffect(() => {
    // Scroll the focused item into view whenever the selectedItemIndex changes
    if (focusedItemRef.current) {
      focusedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [focusedIndex]);

  const handleKeyDown = (e) => {
    if (!disabled && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();

      let newIndex = focusedIndex;
      if (e.key === "ArrowDown") {
        newIndex = (focusedIndex + 1) % completeList.length;
      } else if (e.key === "ArrowUp") {
        newIndex =
          (focusedIndex - 1 + completeList.length) % completeList.length;
      }

      setFocusedIndex(newIndex);
    } else if (e.key === "Enter" && focusedIndex !== -1) {
      e.preventDefault();
      const focusedData = completeList[focusedIndex];
      toggleCheckbox(focusedData[indexKey], focusedData);
    }
  };

  return (
    <>
      <label htmlFor={inputId} style={{ display: "none" }}>
        Label
      </label>
      <Select
        className={
          direction === RTL_DIRECTION
            ? `multiSelectInput_arabicView ${styles.multiSelectInput}`
            : clsx(styles.multiSelectInput)
        }
        style={style}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          getContentAnchorEl: null,
        }}
        inputProps={{
          readOnly: disabled,
          id: inputId,
          "aria-labelledby": labelId,
        }}
        multiple
        value={selectedFields}
        //renderValue is to display chips with delete icon for multiple selected fields in select
        renderValue={() => (
          <React.Fragment>
            {showSelectedCount &&
            selectedFields &&
            !selectedFields.includes(DEFAULT) ? (
              /* added className on 05-09-2023 to resolve the bug Id 135464 */
              <span className={styles.selectedCount}>
                {selectedFields.length} {t("selected")}
              </span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {selectedFields?.map((value) =>
                  value === DEFAULT ? (
                    <span>{placeholder}</span>
                  ) : (
                    <Chip
                      key={value[labelKey]}
                      label={value[labelKey]}
                      clickable
                      disabled={disabled} //added on 25/1/2024 for bug_id: 142953
                      deleteIcon={
                        <ClearIcon
                          onMouseDown={(event) => event.stopPropagation()}
                          className={styles.multiSelectDeleteIcon}
                          tabIndex={0}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              deleteEntityFromList(value[indexKey], value);
                              e.stopPropagation();
                            }
                          }}
                        />
                      }
                      className={styles.multiSelectChip}
                      onDelete={() => {
                        deleteEntityFromList(value[indexKey], value);
                      }}
                      tabIndex={-1}
                    />
                  )
                )}
              </div>
            )}
          </React.Fragment>
        )}
        /**code added for WCAG */
        tabIndex={-1}
      >
        {/*code added on 26 April 2022 for BugId 108472*/}
        <div
          className={styles.listDiv}
          tabIndex={0}
          ref={listRef} // Assign the listRef to the list container
          onKeyDown={handleKeyDown}
          role="listbox"
        >
          <MenuItem className={styles.defaultSelectValue} value={DEFAULT}>
            <span>{placeholder}</span>
          </MenuItem>
          {selectAllOption && completeList?.length > 1 ? (
            <ListItem
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.multiSelect_listItem
                  : styles.multiSelect_listItem
              )}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checkedIcon={
                      <span
                        className={
                          checkedCheckBoxStyle
                            ? `${styles.multiSelect_checked} ${checkedCheckBoxStyle}`
                            : styles.multiSelect_checked
                        }
                      >
                        <CheckIcon
                          className={
                            checkIcon
                              ? `${checkIcon} ${styles.multiSelect_checkIcon}`
                              : styles.multiSelect_checkIcon
                          }
                        />
                      </span>
                    }
                    icon={
                      <span
                        className={
                          checkboxStyle
                            ? `${checkboxStyle} ${styles.multiSelect_checkboxStyle}`
                            : styles.multiSelect_checkboxStyle
                        }
                      />
                    }
                    checked={allChecked}
                    onChange={(e) => toggleSelectAllCheckbox(e.target.checked)}
                    id={`${id}_selectAll`}
                  />
                }
                label={
                  <div className={styles.multiSelect_dropdown}>
                    {selectAllStr ? selectAllStr : t("select") + " " + t("all")}
                  </div>
                }
              />
            </ListItem>
          ) : null}

          {completeList?.length > 0 ? (
            completeList?.map((data, index) => (
              <ListItem
                className={clsx(
                  direction === RTL_DIRECTION
                    ? arabicStyles.multiSelect_listItem
                    : styles.multiSelect_listItem,
                  // Apply focused style to the focused list item
                  focusedIndex === index && styles.multiSelect_listItem_focused
                )}
                key={data[indexKey]} // Don't forget to add a unique key
                ref={focusedIndex === index ? focusedItemRef : null}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checkedIcon={
                        <span
                          className={
                            checkedCheckBoxStyle
                              ? `${checkedCheckBoxStyle} ${styles.multiSelect_checked}`
                              : styles.multiSelect_checked
                          }
                        >
                          <CheckIcon
                            className={
                              checkIcon
                                ? `${checkIcon} ${styles.multiSelect_checkIcon}`
                                : styles.multiSelect_checkIcon
                            }
                          />
                        </span>
                      }
                      icon={
                        <span
                          className={
                            checkboxStyle
                              ? `${checkboxStyle} ${styles.multiSelect_checkboxStyle}`
                              : styles.multiSelect_checkboxStyle
                          }
                        />
                      }
                      value={data[labelKey]}
                      checked={
                        checked && checked[data[indexKey]] === true
                          ? true
                          : false
                      }
                      onChange={() => toggleCheckbox(data[indexKey], data)}
                      name="check"
                      id={`${id}_${data[indexKey]}`}
                    />
                  }
                  label={
                    <div className={styles.multiSelect_dropdown}>
                      {data[labelKey]}
                    </div>
                  }
                />
              </ListItem>
            ))
          ) : (
            <p className={styles.multiSelect_noData}>{noDataLabel}</p>
          )}
        </div>
      </Select>
    </>
  );
}

export default MultiSelect;
