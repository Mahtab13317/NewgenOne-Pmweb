import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  makeStyles,
} from "@material-ui/core";
import styles from "./properties.module.css";
import arabicStyles from "./propertiesArabicStyles.module.css";
import triggerStyles from "../trigger.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import SelectWithInput from "../../../../UI/SelectWithInput";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import {
  RTL_DIRECTION,
  PROCESSTYPE_REGISTERED,
} from "../../../../Constants/appConstants";
import {
  TRIGGER_EXCEPTION_CLEAR,
  TRIGGER_EXCEPTION_CLEAR_VAL,
  TRIGGER_EXCEPTION_RAISE,
  TRIGGER_EXCEPTION_RAISE_VAL,
  TRIGGER_EXCEPTION_RESPOND,
  TRIGGER_EXCEPTION_RESPOND_VAL,
} from "../../../../Constants/triggerConstants";
import { store, useGlobalState } from "state-pool";
import { decode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import { RedefineEventTarget } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

const useStyles = makeStyles(() => ({
  focusVisible: {
    outline: "none",
    "&:focus-visible": {
      "& svg": {
        outline: `2px solid #00477A`,
        borderRadius: "10px",
      },
    },
  },
}));

function ExceptionProperties(props) {
  const classes = useStyles();
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const direction = `${t("HTML_DIR")}`;
  const [exception, setException] = useState("");
  const [comment, setComment] = useState("");
  const [attribute, setAttribute] = useState(TRIGGER_EXCEPTION_RAISE_VAL); // code edited on 21 June 2023 for BugId 130629
  const [existingTrigger, setExistingTrigger] = useState(false);
  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;

  useEffect(() => {
    props.setTriggerProperties({});
  }, []);

  useEffect(() => {
    if (props.reload) {
      props.setTriggerProperties({});
      setException("");
      // code edited on 21 June 2023 for BugId 130629
      setAttribute(TRIGGER_EXCEPTION_RAISE_VAL);
      setComment("");
      // code added on 16 Dec 2022 for BugId 120240
      setExistingTrigger(false);
      props.setReload(false);
    }
  }, [props.reload]);

  useEffect(() => {
    if (props.initialValues) {
      localLoadedProcessData?.ExceptionList?.forEach((exceptionData) => {
        // modified on 12/10/23 for BugId 139401
        // if (exceptionData.ExceptionId === props.exception.exceptionId) {
        if (+exceptionData.ExceptionId === +props.exception.exceptionId) {
          setException(exceptionData);
        }
      });
      setAttribute(props.exception.attribute);
      setComment(decode_utf8(props.exception.comment));
      setExistingTrigger(true);
      props.setInitialValues(false);
    }
  }, [props.initialValues]);

  useEffect(() => {
    let exceptionId =
      exception !== "" && exception ? exception.ExceptionId : null;
    let exceptionName =
      exception !== "" && exception ? exception.ExceptionName : null;
    props.setTriggerProperties({
      exceptionId,
      exceptionName,
      attribute,
      comment,
    });
  }, [exception, comment, attribute]);

  const onChange = (e) => {
    setAttribute(e.target.value);
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
  };

  return (
    <React.Fragment>
      <div className={styles.propertiesMainView}>
        <div
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.triggerNameTypeDiv
              : styles.triggerNameTypeDiv
          }
        >
          <div className="flex">
            <label
              className={styles.triggerFormLabel}
              //modified on 26-9-2023 for bug_id: 136424
              // htmlFor="trigger_exception_name"
            >
              {t("EXCEPTION")}{" "}
              <span className="relative">
                {t("name")}
                <span className={styles.starIcon}>*</span>
              </span>
            </label>
            <div className={styles.exceptionName}>
              <SelectWithInput
                dropdownOptions={localLoadedProcessData.ExceptionList}
                optionKey="ExceptionName"
                value={exception}
                disabled={readOnlyProcess}
                setValue={(val) => {
                  setException(val);
                  if (existingTrigger) {
                    props.setTriggerEdited(true);
                  }
                }}
                showEmptyString={false}
                showConstValue={false}
                id="trigger_exception_name"
                ariaLabel={`${t("EXCEPTION")} ${t("name")}`}
              />
            </div>
          </div>
          <div className="flex">
            <div className={styles.triggerFormLabel}>
              <span className="relative">
                {t("action")}
                <span className={styles.starIcon}>*</span>
              </span>
            </div>
            <span>
              {/* code edited on 30 Nov 2022 for BugId 117976 */}
              <RadioGroup
                aria-label="EXCEPTION"
                name="exception1"
                className={styles.properties_radioDiv}
                value={attribute}
                onChange={onChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const child = e.target.querySelector("input");
                    onChange(RedefineEventTarget(e, child));
                  }
                }}
              >
                <FormControlLabel
                  value={TRIGGER_EXCEPTION_RAISE_VAL}
                  control={<Radio tabIndex={-1} />}
                  tabIndex={0}
                  id="trigger_exception_raiseOpt"
                  label={t(TRIGGER_EXCEPTION_RAISE)}
                  disabled={readOnlyProcess}
                  className={classes.focusVisible}
                />
                <FormControlLabel
                  value={TRIGGER_EXCEPTION_RESPOND_VAL}
                  control={<Radio tabIndex={-1} />}
                  tabIndex={0}
                  id="trigger_exception_respondOpt"
                  disabled={readOnlyProcess}
                  label={t(TRIGGER_EXCEPTION_RESPOND)}
                  className={classes.focusVisible}
                />
                <FormControlLabel
                  value={TRIGGER_EXCEPTION_CLEAR_VAL}
                  control={<Radio tabIndex={-1} />}
                  tabIndex={0}
                  id="trigger_exception_clearOpt"
                  disabled={readOnlyProcess}
                  label={t(TRIGGER_EXCEPTION_CLEAR)}
                  className={classes.focusVisible}
                />
              </RadioGroup>
            </span>
          </div>
        </div>
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            id="triggerFormComment"
            // style={{ marginInlineEnd: "1.5vw" }}
            htmlFor="trigger_exception_description"
          >
            <span className="relative">
              {t("comment")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <textarea
            disabled={readOnlyProcess}
            id="trigger_exception_description"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (existingTrigger) {
                props.setTriggerEdited(true);
              }
            }}
            className={triggerStyles.descriptionInput}
          />
        </div>
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    initialValues: state.triggerReducer.setDefaultValues,
    reload: state.triggerReducer.trigger_reload,
    exception: state.triggerReducer.Exception,
    openProcessType: state.openProcessClick.selectedType,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setTriggerProperties: ({
      exceptionId,
      exceptionName,
      attribute,
      comment,
    }) =>
      dispatch(
        actionCreators.exception_properties({
          exceptionId,
          exceptionName,
          attribute,
          comment,
        })
      ),
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExceptionProperties);
