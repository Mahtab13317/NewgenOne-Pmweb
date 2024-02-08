import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { InputBase, Select, MenuItem } from "@material-ui/core";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";
import EventAvailableRoundedIcon from "@material-ui/icons/EventAvailableRounded";
import MoreHorizRoundedIcon from "@material-ui/icons/MoreHorizRounded";
import { DatePickers } from "../../../../../UI/DatePicker/DatePickers";
import SetInterval from "../SetInterval";
import Modal from "../../../../../UI/Modal/Modal";

function TypeAndFieldMapping(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const {
    bForDisabled,
    autofocusInput,
    componentStyles,
    handleAliasName,
    aliasName,
    variableType,
    variableTypeOnOpen,
    handleVariableType,
    variableLength,
    handleVariableLenth,
    disableLength,
    defaultValue,
    handledefaultValue,
    showCalender,
    showIntervelIcon,
    precision,
    handleprecision,
    showPrecision,
  } = props;

  const [showCal, setShowCal] = useState(false);
  const [modalClicked, setModalClicked] = useState(false);

  const menuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
  };

  const TypedropDown = [
    { label: "Text", value: "10" },
    { label: "Float", value: "6" },
    { label: "Integer", value: "3" },
    { label: "Long", value: "4" },
    { label: "Date", value: "8" },
    { label: "Boolean", value: "12" },
    { label: "ShortDate", value: "15" },
    { label: "Time", value: "16" },
    { label: "Duration", value: "17" },
    { label: "NText", value: "18" },
  ];

  const clickIntervalIcon = () => {
    setModalClicked(true);
  };
  const showCalenderPopUp = () => {
    setShowCal((prev) => !prev);
  };

  const dateSelected = (e) => {
    props.selectedDefaultDate(e.target.value);
  };

  return (
    <div className={componentStyles.mainDiv}>
      <InputBase
        disabled={bForDisabled}
        id="type_field_mapping_alias_name_input"
        className={
          direction === RTL_DIRECTION
            ? componentStyles.inputbaseRtl
            : componentStyles.inputbaseLtr
        }
        autoFocus={autofocusInput}
        variant="outlined"
        onChange={handleAliasName}
        value={aliasName}
      />
      <Select
        disabled={bForDisabled}
        id="type_field_mapping_variable_type_dropdown"
        MenuProps={menuProps}
        className={
          direction === RTL_DIRECTION
            ? componentStyles.variableTypeInputRtl
            : componentStyles.variableTypeInputLtr
        }
        value={variableType}
        onOpen={variableTypeOnOpen}
        onChange={handleVariableType}
      >
        {TypedropDown &&
          TypedropDown.map((el) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.menuItemStyles
                    : styles.menuItemStyles
                }
                value={el.value}
              >
                {t(el.label)}
              </MenuItem>
            );
          })}
      </Select>

      <InputBase
        disabled={bForDisabled || disableLength}
        id="type_field_mapping_alias_length_input"
        className={
          direction === RTL_DIRECTION
            ? componentStyles.lengthRtl
            : componentStyles.lengthLtr
        }
        type="number"
        variant="outlined"
        onChange={handleVariableLenth}
        value={variableLength}
      />
      {showPrecision ? (
        <InputBase
          disabled={bForDisabled}
          id="type_field_mapping_alias_precision_input"
          className={
            direction === RTL_DIRECTION
              ? componentStyles.lengthRtl
              : componentStyles.lengthLtr
          }
          type="number"
          variant="outlined"
          onChange={handleprecision}
          value={precision}
        />
      ) : null}

      <InputBase
        disabled={bForDisabled}
        id="type_field_mapping_alias_default_input"
        className={
          direction === RTL_DIRECTION
            ? componentStyles.defaultValueRtl
            : componentStyles.defaultValueLtr
        }
        variant="outlined"
        onChange={handledefaultValue}
        value={defaultValue}
      />
      {showCalender ? (
        <EventAvailableRoundedIcon
          id="userDefine_variables_calender"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.calenderIcon
              : styles.calenderIcon
          }
          onClick={showCalenderPopUp}
        />
      ) : null}

      {showIntervelIcon ? (
        <MoreHorizRoundedIcon
          id="userDefine_variables_interval"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.intervalIcon
              : styles.intervalIcon
          }
          onClick={clickIntervalIcon}
        />
      ) : null}

      {showCal ? (
        <div style={{ zIndex: "20" }}>
          <DatePickers
            value={new Date()}
            timeFormat={false}
            onChange={dateSelected}
            width="100%"
          />
        </div>
      ) : null}

      {modalClicked ? (
        <Modal
          show={modalClicked}
          style={{
            width: "38vw",
            height: "10rem",
            left: "31%",
            top: "35%",
            padding: "2%",
            paddingTop: "1%",
          }}
          modalClosed={() => setModalClicked(false)}
          children={
            <SetInterval
              setModalClicked={setModalClicked}
              selectedDuration={props.selectedDuration}
            />
          }
        />
      ) : null}
    </div>
  );
}

export default TypeAndFieldMapping;
