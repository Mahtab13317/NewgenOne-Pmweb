import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  Checkbox,
  FormControl,
  FormControlLabel,
  ClickAwayListener,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import "./AddToListDropdown.css";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { FieldValidations } from "../../utility/FieldValidations/fieldValidations";
import { RTL_DIRECTION } from "../../Constants/appConstants";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { validateEntity } from "../../utility/abstarctView/addWorkstepAbstractView";
import { useDispatch } from "react-redux";

function AddToListDropdown(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const [showInput, setshowInput] = useState(false);
  const [checked, setChecked] = useState(null);
  const swimLaneRef = useRef();
  const direction = `${t("HTML_DIR")}`;

  const clickNew = () => {
    setshowInput(true);
  };

  const handleClickAway = () => {
    if (props.handleClickAway) {
      props.handleClickAway();
    }
  };

  useEffect(() => {
    //code to set initial value in checked state for each item
    props.completeList &&
      props.completeList.forEach((item) => {
        if (props.associatedList.includes(item.id)) {
          setChecked((prev) => {
            return { ...prev, [item.id]: true };
          });
        } else {
          setChecked((prev) => {
            return { ...prev, [item.id]: false };
          });
        }
      });
  }, [props.associatedList, props.completeList]);

  const toggleCheckbox = (e, data) => {
    //function to handle toggle on the checkbox
    if (props.multiple) {
      props.completeList &&
        props.completeList.forEach((item) => {
          if (data.id === item.id) {
            setChecked((prev) => {
              return { ...prev, [item.id]: !prev[item.id] };
            });
          }
        });
      if (checked[data.id] === false) props.onChange(data.id, 0); //to add to the associated list
      if (checked[data.id] === true) props.onChange(data.id, 1); //to delete from associated list
    } else {
      props.completeList &&
        props.completeList.forEach((item) => {
          if (item.id === data.id) {
            setChecked((prev) => {
              return { ...prev, [item.id]: true };
            });
          } else {
            setChecked((prev) => {
              return { ...prev, [item.id]: false };
            });
          }
        });
      props.onChange(data);
    }
  };

  return (
    <ClickAwayListener onClickAway={() => handleClickAway()}>
      <div
        className={
          props.dropdownClass
            ? `${props.dropdownClass} ${
                direction === RTL_DIRECTION
                  ? "altd_dropdownDivArabic"
                  : "altd_dropdownDiv"
              }`
            : `${
                direction === RTL_DIRECTION
                  ? "altd_dropdownDivArabic"
                  : "altd_dropdownDiv"
              }`
        }
        style={{ ...props.style }}
      >
        <FormControl style={{ width: "100%" }}>
          {!props.hideCreateButton && (
            <div
              className={`altd_addNewDiv`}
              style={{ borderBottom: "1px solid #C4C4C4" }}
            >
              {showInput ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25vw",
                  }}
                >
                  {/*code added on 8 August 2022 for BugId 112903*/}
                  <input
                    className={`altd_inputField`}
                    autoFocus
                    value={props.inputValue}
                    id={`pmweb_${props.inputValue}`}
                    type="text"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        e.target.value.trim().length > 0
                      ) {
                        let [isValid, errMsg] = validateEntity(
                          swimLaneRef.current.value,
                          t,
                          props.entityName
                        );
                        if (isValid) {
                          setshowInput(false);
                          props.onKeydown(e.target.value);
                        } else {
                          dispatch(
                            setToastDataFunc({
                              message: errMsg,
                              severity: "error",
                              open: true,
                            })
                          );
                        }
                      }
                    }}
                    onKeyPress={(e) => {
                      FieldValidations(e, 180, swimLaneRef.current, 30);
                    }}
                    ref={swimLaneRef}
                  />
                  {/*code added on 13 Dec 2022 for BugId 103973 */}
                  <div
                    onClick={() => {
                      let [isValid, errMsg] = validateEntity(
                        swimLaneRef.current.value,
                        t,
                        props.entityName
                      );
                      if (isValid) {
                        setshowInput(false);
                        props.onKeydown(swimLaneRef.current.value);
                      } else {
                        dispatch(
                          setToastDataFunc({
                            message: errMsg,
                            severity: "error",
                            open: true,
                          })
                        );
                      }
                    }}
                    className="altd_okBtn"
                    id="pmweb_exception_AddToList_OK"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.code === "Enter") {
                        let [isValid, errMsg] = validateEntity(
                          swimLaneRef.current.value,
                          t,
                          props.entityName
                        );
                        if (isValid) {
                          setshowInput(false);
                          props.onKeydown(swimLaneRef.current.value);
                        } else {
                          dispatch(
                            setToastDataFunc({
                              message: errMsg,
                              severity: "error",
                              open: true,
                            })
                          );
                        }
                      }
                    }}
                  >
                    {t("ok")}
                  </div>
                  <CloseIcon
                    className="altd_closeBtn"
                    onClick={() => setshowInput(false)}
                    id="pmweb_exception_AddToList_Close"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.code === "Enter") {
                        setshowInput(false);
                      }
                    }}
                  />
                </div>
              ) : (
                <p
                  className={`altd_addNew`}
                  onClick={(e) => {
                    e.stopPropagation();
                    clickNew();
                  }}
                  id="pmweb_exception_AddToList_addNew"
                  style={{
                    textAlign: direction === RTL_DIRECTION ? "right" : "left",
                    cursor: "pointer",
                  }}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.code === "Enter") {
                      e.stopPropagation();
                      clickNew();
                    }
                  }}
                >
                  {props.addNewLabel}
                </p>
              )}
            </div>
          )}
          <List className={`altd_list`}>
            {props.completeList && props.completeList.length > 0 ? (
              props.completeList.map((data, index) => (
                <ListItem
                  key={data.id}
                  id={`pmweb_exception_AddToList_${data.id}_${index}`}
                  className={
                    direction === RTL_DIRECTION
                      ? "altd_listItemArabic"
                      : `altd_listItem`
                  }
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checkedIcon={
                          <span
                            className={
                              props.checkedCheckBoxStyle
                                ? `${props.checkedCheckBoxStyle} altd_checked`
                                : `altd_checked`
                            }
                          >
                            <CheckIcon
                              className={
                                props.checkIcon ? `${props.checkIcon}` : null
                              }
                              id="pmweb_altd_checkIcon"
                            />
                          </span>
                        }
                        icon={
                          <span
                            className={
                              props.checkboxStyle
                                ? `${props.checkboxStyle} altd_checkboxStyle`
                                : `altd_checkboxStyle`
                            }
                          />
                        }
                        value={data[props.labelKey]}
                        checked={
                          checked && checked[data.id] === true ? true : false
                        }
                        onChange={(e) => toggleCheckbox(e, data)}
                        name="check"
                        id={`pmweb_exception_AddTolist_check${index}`}
                      />
                    }
                    label={
                      <div
                        className={
                          direction === RTL_DIRECTION
                            ? "altd_dropdownArabic"
                            : `altd_dropdown`
                        }
                      >
                        {data[props.labelKey]}
                      </div>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <p
                className={
                  direction === RTL_DIRECTION
                    ? "altd_noDataArabic"
                    : `altd_noData`
                }
              >
                {props.noDataLabel}
              </p>
            )}
          </List>
        </FormControl>
      </div>
    </ClickAwayListener>
  );
}

export default AddToListDropdown;
