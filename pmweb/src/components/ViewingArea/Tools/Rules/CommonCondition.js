import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useTranslation } from "react-i18next";
import styles from "./rule.module.css";
import { useRef } from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
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

function CommonCondition(props) {
  const classes = useStyles();
  let { t } = useTranslation();
  const {
    rulesSelected,
    deleteRule,
    selected,
    updateRule,
    addClickRule,
    optionSelector,
    selectCon,
    cancelRule,
    isReadOnly,
    calledFrom,
  } = props;
  const alwaysRef = useRef();
  const ifRef = useRef();

  return (
    <div style={{ marginInlineStart: "15px" }}>
      <div className="row">
        <p className={styles.mainHeading}>{t("rulesCondition")}</p>
        {/* Code updated on 11 November 2022 for BugId 116647*/}
        <div style={{ marginInlineStart: "auto", display: "flex" }}>
          {rulesSelected && rulesSelected.Desc === t("newRule") ? (
            <button
              // className={styles.cancelHeaderBtn}
              className="tertiary"
              onClick={() => cancelRule(selected)}
              style={{
                display: isReadOnly || calledFrom === "variable" ? "none" : "",
              }}
              id={`pmweb_${t("rulesCondition")}_cancelRule`}
            >
              {t("cancel")}
            </button>
          ) : (
            <button
              className={styles.cancelHeaderBtn}
              onClick={() => deleteRule(selected)}
              style={{
                display: isReadOnly || calledFrom === "variable" ? "none" : "",
              }}
              id={`pmweb_${t("rulesCondition")}_deleteRule`}
            >
              {t("delete")}
            </button>
          )}

          {rulesSelected && rulesSelected.Desc === t("newRule") ? (
            <button
              className={styles.addHeaderBtn}
              onClick={addClickRule}
              style={{
                display: isReadOnly ? "none" : "",
              }}
              id={`pmweb_${t("rulesCondition")}_addRule`}
            >
              {t("addRule")}
            </button>
          ) : (
            <button
              className={styles.addHeaderBtn}
              onClick={updateRule}
              style={{
                display: isReadOnly ? "none" : "",
              }}
              id={`pmweb_${t("rulesCondition")}_updateRule`}
            >
              {t("modify")}
            </button>
          )}
        </div>
      </div>

      <RadioGroup
        onChange={optionSelector}
        value={selectCon}
        className={styles.radiobtn}
        id={`pmweb_${t("rulesCondition")}_ruleCondition`}
        style={{ width: "20%" }}
      >
        <FormControlLabel
          className={classes.focusVisible}
          value={t("always")}
          control={<Radio tabIndex={-1} />}
          label={t("always")}
          disabled={isReadOnly}
          id={`pmweb_${t("rulesCondition")}_ruleCondition_${t("always")}`}
          tabIndex={0}
          ref={alwaysRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              alwaysRef.current.click();
              e.stopPropagation();
            }
          }}
        />

        <FormControlLabel
          className={classes.focusVisible}
          value={t("if")}
          control={<Radio tabIndex={-1} />}
          label={t("if")}
          disabled={isReadOnly}
          id={`pmweb_${t("rulesCondition")}_ruleCondition_${t("if")}`}
          tabIndex={0}
          ref={ifRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              ifRef.current.click();
              e.stopPropagation();
            }
          }}
        />
      </RadioGroup>
    </div>
  );
}

export default CommonCondition;
