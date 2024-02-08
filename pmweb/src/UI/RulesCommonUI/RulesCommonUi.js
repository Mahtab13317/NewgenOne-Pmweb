import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./RulesCommonUi.module.css";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Divider } from "@material-ui/core";
import { PROCESSTYPE_LOCAL_CHECKED } from "../../Constants/appConstants";

function RulesCommonUi(props) {
  let { t } = useTranslation();
  const { rules } = props;

  return (
    <div>
      <div className={styles.LeftPannel}>
        {rules.length == 0 ? (
          <div className="row">
            <p className={styles.noRuleDefined}>
              {t("no")}
              {" " + t("rulesAreDedined")}
            </p>
            <button
              className={styles.addnavBtn}
              onClick={addNewRule}
              style={{ display: showBtn }}
              id="addRuleLocaly"
            >
              {t("addRule")}
            </button>
          </div>
        ) : (
          <div className="row">
            <p className={styles.noRuleDefined}>
              {rules.length}
              {" " + t("rulesAreDedined")}
            </p>
            {props.openProcessType === PROCESSTYPE_LOCAL ||
            props.openProcessType === PROCESSTYPE_LOCAL_CHECKED ? (
              <button
                className={styles.addnavBtn}
                onClick={addNewRule}
                style={{ display: showBtn }}
                id="addRuleLocalBtn"
              >
                {t("addRule")}
              </button>
            ) : null}
          </div>
        )}
        <ul>
          {rules && rules.length != 0 ? (
            rules.map((el, index) => {
              return (
                <li
                  className={styles.restList}
                  style={{
                    backgroundColor: selected == index ? "#0072C60F " : null,
                    color: selected == index ? "#000000" : null,
                    borderLeft: selected == index ? "5px solid #0072C6" : null,
                  }}
                  onClick={() => setselected(index)}
                >
                  {el.Desc}
                </li>
              );
            })
          ) : (
            <li
              className={styles.restList}
              style={{
                backgroundColor: "#0072C60F ",
                color: "#000000",
                borderLeft: "5px solid #0072C6",
              }}
            >
              {t("no")}
              {" " + t("rulesAreDedined")}
            </li>
          )}
        </ul>
      </div>
      <div className={styles.vl}></div>
    </div>
  );
}

export default RulesCommonUi;
