import React, { useState, useEffect, useRef } from "react";
import {
  Checkbox,
  FormControlLabel,
  Chip,
  ClickAwayListener,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import styled from "styled-components";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import "./index.css";

const InputWrapper = styled("div")`
  width: 100%;
  height: var(--line_height);
  border: 1px solid #c4c4c4;
  border-radius: 2px;
  background-color: #fff;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;
  position: relative;

  & input {
    font: normal normal normal 12px/17px Open Sans;
    height: 2.125rem;
    box-sizing: border-box;
    padding: 0.125rem 0.5vw;
    color: #606060;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
    cursor: pointer;
  }

  & input:disabled {
    background-color: #f8f8f8;
  }
`;

const Listbox = styled("ul")`
  width: 100%;
  margin: 2px 0 0;
  padding: 0 !important;
  position: absolute;
  list-style: none;
  background-color: #fff;
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 0.25rem 0vw;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected="true"] {
    background-color: #fafafa;
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li[data-focus="true"] {
    background-color: #e6f7ff;
    cursor: pointer;

    & svg {
      color: #000;
    }
  }
`;

export default function MultiSelectWithSearch(props) {
  let { t } = useTranslation();
  const [groupedOptions, setGroupedOptions] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [inputVal, setInputVal] = useState(null);
  const [checked, setChecked] = useState(null);
  const [showList, setShowList] = useState(false);
  const VarNameRef = useRef([]);

  useEffect(() => {
    if (!props.isDisabled) {
      setGroupedOptions(props.optionList);
      let tempTagList = [];
      props.optionList &&
        props.optionList.forEach((item) => {
          if (props.selectedOptionList.includes(item[props.optionRenderKey])) {
            setChecked((prev) => {
              return { ...prev, [item[props.optionRenderKey]]: true };
            });
            tempTagList.push(item);
          } else {
            setChecked((prev) => {
              return { ...prev, [item[props.optionRenderKey]]: false };
            });
          }
        });
      setTagList(tempTagList);
    }
  }, [props.optionList, props.selectedOptionList]);

  useEffect(() => {
    if (inputVal && inputVal.trim()) {
      let tempList = [];
      props.optionList &&
        props.optionList.forEach((elem) => {
          if (
            elem[props.optionRenderKey].toLowerCase().includes(inputVal.trim())
          ) {
            tempList.push(elem);
          }
        });
      setGroupedOptions(tempList);
    } else {
      setGroupedOptions(props.optionList);
    }
  }, [inputVal]);

  const handleChange = (data, type) => {
    if (type === 0) {
      //type 0 is to add new fields to selected field list
      setTagList((prev) => {
        let newArr = [...prev];
        newArr.push(data);
        props.getSelectedItems(newArr, 0, data);
        return newArr;
      });
    } else if (type === 1) {
      //type 1 is to delete some fields from selected field list
      setTagList((prev) => {
        let newArr = [...prev];
        let indexVal = newArr.indexOf(data);
        newArr.splice(indexVal, 1);
        props.getSelectedItems(newArr, 1, data);
        return newArr;
      });
    }
  };

  const toggleCheckbox = (data, dataValue) => {
    setInputVal("");
    setShowList(false);
    //function to handle toggle on the checkbox
    props.optionList &&
      props.optionList.forEach((item) => {
        if (item[props.optionRenderKey] === data) {
          setChecked((prev) => {
            return {
              ...prev,
              [item[props.optionRenderKey]]: !prev[item[props.optionRenderKey]],
            };
          });
        }
      });
    if (checked[data] === false) handleChange(dataValue, 0); //to add to list
    if (checked[data] === true) handleChange(dataValue, 1); //to delete from list
  };

  const deleteEntityFromList = (data, dataValue) => {
    //function called when delete icon on chip of selected field is clicked
    props.optionList &&
      props.optionList.forEach((item) => {
        if (item[props.optionRenderKey] === data) {
          setChecked((prev) => {
            return {
              ...prev,
              [item[props.optionRenderKey]]: !prev[item[props.optionRenderKey]],
            };
          });
        }
      });
    handleChange(dataValue, 1);
  };

  return (
    <div className="relative">
      <InputWrapper
        style={{ backgroundColor: props.isDisabled ? "#f8f8f8" : "#fff" }}
        id="multiSelectSearch"
      >
        {props.showTags &&
          tagList &&
          tagList.map((option, index) => (
            <Chip
              key={option[props.optionRenderKey]}
              label={option[props.optionRenderKey]}
              clickable
              deleteIcon={
                <ClearIcon
                  onMouseDown={(event) => event.stopPropagation()}
                  className={styles.multiSelectDeleteIcon}
                />
              }
              className={styles.multiSelectChip}
              onDelete={() => {
                deleteEntityFromList(option[props.optionRenderKey], option);
              }}
            />
          ))}
        <input
        aria-label={`Template_${inputVal}`}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onClick={() => setShowList(true)}
          disabled={props.isDisabled}
          tabIndex={0}
          onKeyUp={(e)=>{
            if(e.key === "Enter"){
              setShowList(true);
              e.stopPropagation();
            }
          }}
        />
        <ArrowDropDownIcon className={styles.arrowIcon} />
      </InputWrapper>
      {showList ? (
        <ClickAwayListener onClickAway={() => setShowList(false)}>
          <Listbox className={styles.listDropdown}>
            {groupedOptions && groupedOptions.length > 0 ? (
              <React.Fragment>
                {groupedOptions
                  ?.filter(
                    (opt) =>
                      opt[props.optionRenderKey] &&
                      opt[props.optionRenderKey] !== ""
                  )
                  .map((option, index) => (
                    <li className={styles.multiSelect_listItem}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checkedIcon={
                              <span
                                className={
                                  props.checkedCheckBoxStyle
                                    ? `${props.checkedCheckBoxStyle} ${styles.multiSelect_checked}`
                                    : styles.multiSelect_checked
                                }
                              >
                                <CheckIcon
                                  className={
                                    props.checkIcon
                                      ? `${props.checkIcon} ${styles.multiSelect_checkIcon}`
                                      : styles.multiSelect_checkIcon
                                  }
                                />
                              </span>
                            }
                            icon={
                              <span
                                className={
                                  props.checkboxStyle
                                    ? `${props.checkboxStyle} ${styles.multiSelect_checkboxStyle}`
                                    : styles.multiSelect_checkboxStyle
                                }
                              />
                            }
                            value={option[props.optionRenderKey]}
                            checked={
                              checked &&
                              checked[option[props.optionRenderKey]] === true
                                ? true
                                : false
                            }
                            onChange={() =>
                              toggleCheckbox(
                                option[props.optionRenderKey],
                                option
                              )
                            }
                            name="check"
                            id={`${props.id}_${option[props.optionRenderKey]}`}
                            inputRef={(item) =>
                              (VarNameRef.current[index] = item)
                            }
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                VarNameRef.current[index].click();
                                e.stopPropagation();
                              }
                            }}
                          />
                        }
                        label={
                          <div className={styles.multiSelect_dropdown}>
                            {option[props.optionRenderKey]}
                          </div>
                        }
                      />
                    </li>
                  ))}
              </React.Fragment>
            ) : (
              <li className={styles.noDataFound}>{t("noRecords")}</li>
            )}
          </Listbox>
        </ClickAwayListener>
      ) : null}
    </div>
  );
}
