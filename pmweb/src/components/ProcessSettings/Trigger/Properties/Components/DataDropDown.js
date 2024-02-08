// #BugID - 116665
// #BugDescription - Added text when no search result is found.
import React, { useState, useEffect, useRef } from "react";
import { Select, MenuItem, ListSubheader, TextField } from "@material-ui/core";
import styles from "../properties.module.css";
import arabicStyles from "../propertiesArabicStyles.module.css";
import { useTranslation } from "react-i18next";
import { getVariableType } from "../../../../../utility/ProcessSettings/Triggers/getVariableType";
import {
  CONSTANT,
  DEFAULT,
  RTL_DIRECTION,
  PROCESSTYPE_REGISTERED,
} from "../../../../../Constants/appConstants";
import { TRIGGER_CONSTANT } from "../../../../../Constants/triggerConstants";
import { connect } from "react-redux";
import Lens from "../../../../../assets/lens.png";
import "../../commonTrigger.css";
import { containsText } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../../utility/abstarctView/checkLatestVersion";
import { store, useGlobalState } from "state-pool";
import { DatePickers } from "../../../../../UI/DatePicker/DatePickers";
import { FieldValidations } from "../../../../../utility/FieldValidations/fieldValidations";
import { REGEX, validateRegex } from "../../../../../validators/validator";

function DataDropDown(props) {
  // code edited on 19 Sep 2022 for BugId 115557
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [typeInput, setTypeInput] = useState(props.value);
  const [constantSelected, setConstantSelected] = useState(false);
  const [constantValue, setConstantValue] = useState("");
  const [constantType, setConstantType] = useState(null); // State that stores the variable type of the constant selected.
  const [searchText, setSearchText] = useState("");
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const costRef = useRef(null);

  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;

  const displayedOptions = props.triggerTypeOptions?.filter((option) =>
    containsText(option?.VariableName, searchText)
  );

  useEffect(() => {
    if (props.constantAdded && constantSelected) {
      if (!props.value) {
        let element = document.getElementById(
          `trigger_set_constantVal_${props.id}`
        );
        if (element) {
          element.focus();
        }
      }
    }
  }, [constantSelected]);

  // code added on 23 Nov 2022 for BugId 119550
  // Function that runs when the constType prop changes.
  useEffect(() => {
    if (props.constantType !== "") {
      let type = "";
      switch (props.constantType) {
        case "10":
          type = "text";
          break;
        case "3":
        case "4":
        case "6":
          type = "number";
          break;
        case "8":
          type = "date";
          break;
        default:
          type = "text";
          break;
      }
      setConstantType(type);
    }
  }, [props.constantType]);

  useEffect(() => {
    if (props.constantAdded && constantValue) {
      if (
        (props.value && constantValue !== props.value.VariableName) ||
        !props.value
      ) {
        props.setFieldValue({
          value: constantValue,
          row_id: props.id,
          type: props.type,
          constant: true,
        });
      }
    }
  }, [constantValue]);

  useEffect(() => {
    if (props.value && props.value.constant && props.constantAdded) {
      setConstantValue(props.value.VariableName);
      setConstantSelected(true);
      setTypeInput("");
    } else {
      setTypeInput(props.value ? props.value : DEFAULT);
      setConstantSelected(false);
      setConstantValue("");
      if (props.setValueDropdownFunc) {
        props.setValueDropdownFunc(props.value?.VariableType);
      }
    }
  }, [props.value]);

  return (
    <div className={`relative`}>
      {constantSelected && (
        <div>
          <span className={styles.dataDropdownConstantIcon}>
            {t(TRIGGER_CONSTANT)}
          </span>
          {constantType === "date" ? (
            <DatePickers
              onChange={(e) => setConstantValue(e.target.value)}
              timeFormat={false}
              value={constantValue}
              disabled={readOnlyProcess}
              id={`trigger_set_constantVal_${props.id}`}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.dataDropdownConstInput
                  : styles.dataDropdownConstInput
              }
              width="100%"
              height="var(--line_height)"
            />
          ) : (
            <input
              id={`trigger_set_constantVal_${props.id}`}
              autofocus
              value={constantValue}
              disabled={readOnlyProcess}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.dataDropdownConstInput
                  : styles.dataDropdownConstInput
              }
              ref={costRef}
              // code added on 23 Nov 2022 for BugId 119550
              // commented on 10/10/23 for BugId 139242
              // type={constantType}
              onChange={(e) => {
                // Modified on 26-09-23 for Bug 135538
                // modified on 10/10/23 for BugId 139242
                // if (constantType === "number") {
                if (+props.constantType === 3 || +props.constantType === 4) {
                  //int and long
                  if (
                    validateRegex(
                      +e.target.value,
                      REGEX.IntegerPositiveAndNegative
                    ) &&
                    !e.target.value.includes("e")
                  ) {
                    setConstantValue(e.target.value);
                  }
                }
                // added on 10/10/23 for BugId 139242
                else if (+props.constantType === 6) {
                  // float
                  if (validateRegex(+e.target.value, REGEX.FloatPositive)) {
                    setConstantValue(e.target.value);
                  }
                } else {
                  setConstantValue(e.target.value);
                }
              }}
              // onPaste={(e) => {
              //   // Modified on 26-09-23 for Bug 135538
              //   if (constantType === "number") {
              //     if (
              //       validateRegex(
              //         +e.target.value,
              //         REGEX.IntegerPositiveAndNegative
              //       ) &&
              //       !e.target.value.includes("e")
              //     ) {
              //       setConstantValue(e.target.value);
              //     }
              //   } else {
              //     setConstantValue(e.target.value);
              //   }
              // }}
              onKeyPress={(e) => {
                // modified on 10/10/23 for BugId 139242
                // if (constantType === "number")
                if (+props.constantType === 3 || +props.constantType === 4) {
                  //int and long
                  FieldValidations(e, 131, costRef.current, 30);
                }
                // added on 10/10/23 for BugId 139242
                else if (+props.constantType === 6) {
                  // float
                  FieldValidations(e, 130, costRef.current, 30);
                }
              }}
              // Till here for Bug 135538
            />
          )}
        </div>
      )}
      {/* Label is provided for the Wave Issue  */}
      <label
        style={{ display: "none" }}
        htmlFor={`${props.uniqueId}_${props.id}_select`}
      >
        Label
      </label>
      <Select
        className={
          direction === RTL_DIRECTION
            ? `${styles.triggerSelectDropdown} triggerSelectDropdown_arabicView`
            : styles.triggerSelectDropdown
        }
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
          autoFocus: false,
          PaperProps: {
            style: {
              maxHeight: props.maxHeight ? props.maxHeight : "15rem",
            },
          },
        }}
        inputProps={{
          readOnly: readOnlyProcess,
          id: `${props.uniqueId}_${props.id}_select`,
        }}
        value={typeInput}
        onChange={(e) => {
          props.setRowSelected(null);
          if (e.target.value !== t(CONSTANT) && e.target.value) {
            setConstantSelected(false);
            setConstantValue("");
            setTypeInput(e.target.value);
            props.setFieldValue({
              value: e.target.value,
              row_id: props.id,
              type: props.type,
              constant: false,
            });
            if (props.setValueDropdownFunc) {
              props.setValueDropdownFunc(e.target.value?.VariableType);
            }
          } else if (e.target.value === t(CONSTANT)) {
            setTypeInput("");
            setConstantSelected(true);
          }
        }}
        onClose={() => setSearchText("")}
        // This prevents rendering empty string in Select's value
        // if search text would exclude currently selected option.
        renderValue={() => {
          return typeInput === DEFAULT ? (
            t("selectVariable")
          ) : (
            <div
              className={styles.dropdownVariableDiv}
              style={{ direction: direction }}
            >
              <div className={styles.dropdownVariable}>
                <span>{typeInput.VariableName}</span>
                <span>{typeInput.SystemDefinedName}</span>
              </div>
              <span className={styles.dropdownVariableType}>
                {t(getVariableType(typeInput.VariableType))}
              </span>
            </div>
          );
        }}
      >
        {/* TextField is put into ListSubheader so that it doesn't
            act as a selectable item in the menu
            i.e. we can click the TextField without triggering any selection.*/}
        <ListSubheader
          className={styles.dataDropdownListHeader}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div
            className={styles.searchBox}
            style={{ direction: direction }}
            id="searchBoxDrop"
          >
            <TextField
              size="small"
              // Autofocus on textfield
              autoFocus
              placeholder={t("typeToSearch")} // modified on 14/09/23 for BugId 136856
              fullWidth
              className={styles.searchTextField}
              onChange={(e) => setSearchText(e.target.value)}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                if (e.key !== "Escape") {
                  // Prevents autoselecting item while typing (default Select behaviour)
                  e.stopPropagation();
                }
              }}
            />
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.searchIcon
                  : styles.searchIcon
              }
            >
              <img src={Lens} alt="lens" width="16px" height="16px" />
            </div>
          </div>
          {displayedOptions?.length === 0 && searchText !== "" && (
            <span className={styles.noResultFoundText}>
              {t("noResultsFound")}
            </span>
          )}
        </ListSubheader>
        {(displayedOptions?.length !== 0 || searchText === "") && (
          <MenuItem className={styles.defaultSelectValue} value={DEFAULT}>
            <span>{t("selectVariable")}</span>
          </MenuItem>
        )}
        {props.constantAdded && (
          <MenuItem
            className={styles.triggerSelectDropdownList}
            id={`${props.uniqueId}_${props.id}_constant`}
            value={t(CONSTANT)}
          >
            <div
              className={styles.dropdownVariableDiv}
              style={{ direction: direction }}
            >
              <div className={styles.dropdownVariable}>
                <span>{t(CONSTANT)}</span>
              </div>
            </div>
          </MenuItem>
        )}
        {displayedOptions?.map((option, index) => {
          return (
            <MenuItem
              className={styles.triggerSelectDropdownList}
              value={option}
            >
              <div
                className={styles.dropdownVariableDiv}
                style={{ direction: direction }}
              >
                <div className={styles.dropdownVariable}>
                  <span>{option.VariableName}</span>
                  <span>{option.SystemDefinedName}</span>
                </div>
                <span className={styles.dropdownVariableType}>
                  {t(getVariableType(option.VariableType))}
                </span>
              </div>
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, null)(DataDropDown);
