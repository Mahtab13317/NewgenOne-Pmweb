import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./modal.module.css";
import {
  MENUOPTION_CHECKIN,
  MENUOPTION_CHECKOUT,
  MENUOPTION_DISABLE,
  MENUOPTION_ENABLE,
  MENUOPTION_SAVE_NEW_V,
  SPACE,
  VERSION_TYPE_MAJOR,
  VERSION_TYPE_MINOR,
} from "../../../Constants/appConstants";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  FormControl,
} from "@material-ui/core";

function CommonModalBody(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  return (
    <React.Fragment>
      <div className={styles.subHeader} style={{ direction: direction }}>
        {`${props.modalHead}`}{" "}
        {props.modalType !== MENUOPTION_ENABLE &&
        props.modalType !== MENUOPTION_DISABLE &&
        props.modalType !== MENUOPTION_SAVE_NEW_V
          ? `: ${props.openProcessName}`
          : null}
      </div>
      {props.isActionsDisabled ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1.25rem 1vw",
              direction: direction
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#606060",
                marginBottom: "2px",
              }}
            >
              {t("ProcessName")}
            </p>
            <p
              style={{ fontSize: "12px", color: "#000000", fontWeight: "600" }}
            >
              {props.openProcessName}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "0px 1vw 1.5rem",
              direction: direction
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "red",
                marginBottom: "2px",
              }}
            >
              {t("checkInText") + SPACE + t("failed")}
            </p>
            <p style={{ fontSize: "12px", color: "#606060" }}>
              {t("someErrorsAndWarningsPresent")}
              {SPACE}
              <span
                style={{
                  color: "var(--link_color)",
                  fontSize: "var(--base_text_font_size)",
                  cursor: "pointer",
                  marginLeft: "2vw",
                  fontWeight: "600",
                }}
                id="pmweb_CommonModalBody_ViewDetails"
                onClick={() => {
                  props.toggleDrawer();
                  props.setModalClosed();
                }}
              >
                {t("viewDetails")}
              </span>
            </p>
          </div>
        </>
      ) : (
        <div className={styles.subForm} style={{ direction: direction }}>
          {props.modalType === MENUOPTION_CHECKOUT ? (
            <p className={styles.checkoutString}>
              {t("checkOutNote")}{" "}
              <span style={{ fontWeight: "700" }}>{props.projectName}</span>
            </p>
          ) : null}
          {props.modalType === MENUOPTION_SAVE_NEW_V ? (
            <p className="flex">
              <span className={styles.versionTypeHeading}>{t("Version")}</span>
              <FormControl aria-label="Choose a version">
                <RadioGroup
                  //aria-label={`radio_Button_${props.selectedType}`}
                  name="createChildWorkitem"
                  className={styles.saveNew_radioDiv}
                  value={props.selectedType}
                  onChange={(e) => {
                    props.setSelectedType(e.target.value);
                  }}
                >
                  <FormControlLabel
                    value={VERSION_TYPE_MAJOR}
                    // aria-label={`radio_Button_major_version`}
                    id="major_version_opt"
                    control={<Radio style={{ color: "var(--radio_color)" }} />}
                    label={`${t("Major")} ${t("Version")} (${Math.floor(
                      +props.existingVersion + 1
                    ).toFixed(1)})`}
                    className={styles.saveNew_radioButton}
                  />
                  <FormControlLabel
                    value={VERSION_TYPE_MINOR}
                    //aria-label={`radio_Button_minor_version`}
                    id="minor_version_opt"
                    control={<Radio style={{ color: "var(--radio_color)" }} />}
                    label={`${t("Minor")} ${t("Version")} (${(
                      +props.existingVersion + 0.1
                    ).toFixed(1)})`}
                    className={styles.saveNew_radioButton}
                  />
                </RadioGroup>
              </FormControl>
            </p>
          ) : null}
          <p className="flex">
            <span className={styles.commentHeading}>
              {t("comment")}
              {props.commentMandatory ? (
                <span className={styles.starIcon}>*</span>
              ) : null}
            </span>
            <textarea
              id={`${props.id}_commentField`}
              aria-label={`${props.id}_commentField`}
              className={styles.commentArea}
              value={props.comment}
              onChange={(e) => props.setComment(e.target.value)}
            />
          </p>
        </div>
      )}
      <div className={styles.footer} style={{ direction: direction }}>
        <button
          id={`${props.id}_cancelBtn`}
          className={styles.cancelCategoryButton}
          onClick={() => props.setModalClosed()}
          disabled={props.disableCancel}
        >
          {t("cancel")}
        </button>
        {props.modalType === MENUOPTION_CHECKIN ? (
          props.isBtnTwoProcessing ? (
            <button
              className={
                ((props.comment.trim() === "" || !props.comment) &&
                  props.commentMandatory) ||
                props.isActionsDisabled
                  ? styles.disabledCategoryButton
                  : styles.outlinedButton
              }
              id={`${props.id}_btn2`}
              disabled={
                ((props.comment.trim() === "" || !props.comment) &&
                  props.commentMandatory) ||
                props.isActionsDisabled
              }
            >
              <CircularProgress
                color="#FFFFFF"
                style={{
                  height: "1rem",
                  width: "1rem",
                }}
              />
              {props.buttonTwo}
            </button>
          ) : (
            <button
              className={
                ((props.comment.trim() === "" || !props.comment) &&
                  props.commentMandatory) ||
                props.isActionsDisabled
                  ? styles.disabledCategoryButton
                  : styles.outlinedButton
              }
              id={`${props.id}_btn2`}
              onClick={props.buttonTwoFunc}
              disabled={
                ((props.comment.trim() === "" || !props.comment) &&
                  props.commentMandatory) ||
                props.isActionsDisabled
              }
            >
              {props.buttonTwo}
            </button>
          )
        ) : null}
        {props.isBtnOneProcessing ? (
          <button
            className={
              (props.comment.trim() === "" || !props.comment) &&
              props.commentMandatory
                ? styles.disabledCategoryButton
                : styles.addCategoryButton
            }
            id={`${props.id}_btn1`}
          >
            <CircularProgress
              color="#FFFFFF"
              style={{
                height: "1rem",
                width: "1rem",
              }}
            />
            {props.buttonOne}
          </button>
        ) : (
          props.showBtnOne && (
            <button
              className={
                ((props.comment.trim() === "" || !props.comment) &&
                  props.commentMandatory) ||
                props.isActionsDisabled
                  ? styles.disabledCategoryButton
                  : styles.addCategoryButton
              }
              onClick={props.buttonOneFunc}
              disabled={
                ((props.comment.trim() === "" || !props.comment) &&
                  props.commentMandatory) ||
                props.isActionsDisabled
              }
              id={`${props.id}_btn1`}
            >
              {props.buttonOne}
            </button>
          )
        )}
      </div>
    </React.Fragment>
  );
}

CommonModalBody.defaultProps = {
  showBtnOne: true,
};

export default CommonModalBody;
