import React, { useEffect, useRef, useState } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@material-ui/core";
import { Select, MenuItem } from "@material-ui/core";
import { makeStyles, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import PickListModal from "../../../../UI/Modal/Modal";
import AddPickList from "./AddPickList";
import styles from "../DocTypes/index.module.css";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  select: {
    width: "282px",
    height: "28px",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    font: "normal normal normal 12px/17px Open Sans",
    border: "1px solid #C4C4C4",
    borderRadius: "2px",
    opacity: "1",
    marginRight: "10px",
  },
  focusVisible: {
    outline: "none",
    "&:focus-visible": {
      "& svg": {
        outline: `2px solid #00477A`,
        borderRadius: "10px",
      },
    },
  },
  dropdownData: {
    height: "17px",
    textAlign: "left",
    font: "normal normal normal 12px/17px Open Sans",
    letterSpacing: "0px",
    color: "#000000",
    opacity: "1",
    marginTop: "8px",
    paddingLeft: "10px !important",
    marginLeft: "0px",
  },
}));

export default function RadioButtonsGroup(props) {
  // Added on 24-01-24 for Bug 141015
  const { triggerList } = props;
  // Till here for Bug 141015
  const classes = useStyles({});
  let { t } = useTranslation();
  const [toDoType, setToDoType] = useState("M");
  const [selectedTrigger, setSelectedTrigger] = useState("defaultValue");
  const direction = `${t("HTML_DIR")}`;
  const markRef = useRef();
  const pickListRef = useRef();
  const triggerRef = useRef();
  const onSelect = (e) => {
    // added on 08/01/24 for BugId 141670
    props.setDisableAddBtn(null);
    // till here BugId 141670
    setSelectedTrigger(e.target.value);
    props.selectedTrigger(e.target.value);
  };

  const handleChange = (event) => {
    props.setDisableAddBtn(null); //Changes made to solve Bug 141670
    props.toDoType(event.target.value);
    setToDoType(event.target.value);
    props.setTodoTypeValue(event.target.value);
  };

  useEffect(() => {
    if (props.toDoTypeToModify) {
      setToDoType(props.toDoTypeToModify);
      props.setTodoTypeValue(props.toDoTypeToModify);
    }

    if (props.toDoToModifyTrigger) {
      setSelectedTrigger(props.toDoToModifyTrigger);
    }
  }, [props.toDoTypeToModify, props.toDoToModifyTrigger]);

  useEffect(() => {
    if (props.todoName == "") {
      setToDoType();
      setSelectedTrigger("defaultValue");
      props.setTodoName(null);
    }
  }, [props.todoName]);

  // code added on 7 September 2022 for BugId 115489
  useEffect(() => {
    if (props.addAnotherTodo) {
      setToDoType("M");
      setSelectedTrigger("defaultValue");
      props.setAddAnotherTodo(false);
    }
  }, [props.addAnotherTodo]);

  return (
    <FormControl component="fieldset">
      <RadioGroup
        defaultValue="M"
        onChange={handleChange}
        row={true}
        name="row-radio-buttons-group"
        className={styles.properties_radioDiv}
      >
        <FormControlLabel
          value="M"
          control={
            <Radio checked={toDoType === "M" ? true : false} tabIndex={-1} />
          }
          label={t("mark")}
          className={styles.properties_radioButton + " " + classes.focusVisible}
          id="pmweb_toDo_radioBtnGrp_Mark"
          tabIndex={0}
          //tabIndex={props.triggerList && props.triggerList.length > 0 ? 0 : -1}
          ref={markRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              markRef.current.click();
              e.stopPropagation();
            }
          }}
        />
        <FormControlLabel
          value="P"
          control={
            <Radio checked={toDoType === "P" ? true : false} tabIndex={-1} />
          }
          label={t("picklist")}
          className={styles.properties_radioButton + " " + classes.focusVisible}
          id="pmweb_toDo_radioBtnGrp_PickList"
          tabIndex={0}
          //tabIndex={props.triggerList && props.triggerList.length > 0 ? 0 : -1}
          ref={pickListRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              pickListRef.current.click();
              e.stopPropagation();
            }
          }}
        />

        <FormControlLabel
          disabled={
            props.triggerList && props.triggerList.length > 0 ? false : true
          }
          value="T"
          control={
            <Radio checked={toDoType === "T" ? true : false} tabIndex={-1} />
          }
          label={t("trigger")}
          className={`${styles.properties_radioButton} ${
            direction === RTL_DIRECTION
              ? styles.properties_radioButtonOArabic +
                " " +
                classes.focusVisible
              : styles.properties_radioButtonO + " " + classes.focusVisible
          }`}
          id="pmweb_toDo_radioBtnGrp_Trigger"
          tabIndex={props.triggerList && props.triggerList.length > 0 ? 0 : -1}
          ref={triggerRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              triggerRef.current.click();
              e.stopPropagation();
            }
          }}
        />
      </RadioGroup>

      {toDoType == "P" ? (
        <AddPickList
          pickList={props.pickList}
          setPickList={props.setPickList}
          addPickList={props.addPickList}
          toDoPicklistToModify={props.toDoPicklistToModify}
          setDisableAddBtn={props.setDisableAddBtn} //Changes made to solve Bug 141670
        />
      ) : null}

      {toDoType == "T" ? (
        <Select
          className={classes.select}
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
          value={selectedTrigger}
          onChange={onSelect}
          inputProps={{ "aria-labelledby": "pmweb_toDo_radioBtnGrp_Trigger" }}
          id="pmweb_toDo_radioBtnGrp_selectTrigger"
        >
          <MenuItem className={classes.dropdownData} value="defaultValue">
            {t("<None>")}
          </MenuItem>
          {/* Modified on 24-01-24 for Bug 141015  */}
          {triggerList &&
            triggerList
              ?.filter((d) => d.TriggerName !== "EscalationMailTrigger")
              ?.map((x) => {
                return (
                  <MenuItem
                    className={classes.dropdownData}
                    key={x.TriggerName}
                    value={x.TriggerName}
                  >
                    {x.TriggerName}
                  </MenuItem>
                );
              })}
          {/* Till here for Bug 141015  */}
        </Select>
      ) : null}
    </FormControl>
  );
}
