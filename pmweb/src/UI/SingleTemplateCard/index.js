// #BugID - 112343
// #BugDescription - preview button of Template the screen redirection of blank screen fixed
import React, { useState } from "react";
import { Card, CardContent } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import TemplateMileStone from "../ProcessTemplate/TemplateMileStone";
import styles from "./index.module.css";
import arabicStyles from "./arabicIndex.module.css";
import {
  RTL_DIRECTION,
  SYSTEM_DEFINED_SCOPE,
  WORD_LIMIT_DESC,
} from "../../Constants/appConstants";
import { connect } from "react-redux";
import * as actionCreators from "../../redux-store/actions/processView/actions";
import { useHistory } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import LockIcon from "@material-ui/icons/Lock";
import Tooltip from "@material-ui/core/Tooltip";
import { decode_utf8 } from "../../utility/UTF8EncodeDecoder";
import { v4 as uuidv4 } from "uuid";

function SingleTemplateCard(props) {
  let { t } = useTranslation();
  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const { item } = props;
  const direction = `${t("HTML_DIR")}`;

  const history = useHistory();

  const previewTemplate = () => {
    if (props.previewFunc) {
      props.previewFunc();
    }
    props.openTemplate(props.templateId, props.templateName, true);
    history.push("/process");
  };

  const TemplateTooltip = withStyles((theme) => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      border: "1px solid #70707075",
      font: "normal normal normal 12px/17px Open Sans",
      letterSpacing: "0px",
      color: "#000000",
      zIndex: "100",
      transform: "translate3d(0px, -0.125rem, 0px) !important",
    },
    arrow: {
      "&:before": {
        backgroundColor: "#FFFFFF !important",
        border: "1px solid #70707075 !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  return (
    <Card
      variant="outlined"
      className={
        direction === RTL_DIRECTION ? arabicStyles.cardTemp : styles.cardTemp
      }
      style={{
        direction: `${t("HTML_DIR")}`,
        ...props.style,
      }}
    >
      <CardContent
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.tempCardContent
            : styles.tempCardContent
        }
      >
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.cardHeading
              : styles.cardHeading
          }
          style={{ ...props.cardHeadingStyle }}
        >
          <span>
            {item.Name}
            {item.Scope === SYSTEM_DEFINED_SCOPE ? (
              <TemplateTooltip
                arrow
                title={t("predefinedTemplate")}
                placement={
                  direction === RTL_DIRECTION ? "bottom-end" : "bottom-start"
                }
              >
                <LockIcon
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.templatePredefinedIcon
                      : styles.templatePredefinedIcon
                  }
                />
              </TemplateTooltip>
            ) : null}
          </span>
          <span className={styles.extrasDiv}>
            {/* {item.UsageCount > 0 ? (
                <span
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.templateUsageCount
                      : styles.templateUsageCount
                  }
                >
                  {t("usedIn")} {item.UsageCount}{" "}
                  {item.UsageCount > 1 ? t("processes") : t("process")}
                </span>
              ) : null} */}
            {props.moreVertIcon ? props.moreVertIcon : null}
          </span>
        </p>
        {props.showCategory && (
          <p className={styles.categoryName}>
            {t("Category")}: {props.categoryName}
          </p>
        )}
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.cardDesc
              : styles.cardDesc
          }
          style={{ ...props.cardDescStyle }}
        >
          {item.Description ? (
            item.Description?.match(/\w+/g).length < WORD_LIMIT_DESC ? (
              <div>{decode_utf8(item.Description)}</div>
            ) : (
              <div>
                {item.Description && showMoreDesc
                  ? decode_utf8(item.Description)
                  : decode_utf8(item.Description)
                      .split(" ")
                      .splice(0, WORD_LIMIT_DESC)
                      .join(" ")}

                {/* <TemplateTooltip
                    arrow={true}
                    enterDelay={100}
                    placement={
                      direction === RTL_DIRECTION
                        ? "bottom-end"
                        : "bottom-start"
                    }
                    title={item.Description}
                  >*/}
                <span
                  style={{
                    color: "blue",
                  }}
                  onClick={() => setShowMoreDesc(!showMoreDesc)}
                  id="pmweb_TemplateCard_showMoreDesc"
                >
                  &nbsp;{showMoreDesc ? t("showLess") : t("showMore")}
                </span>
                {/*</TemplateTooltip>*/}
              </div>
            )
          ) : null}
        </p>
        <TemplateMileStone
          milestone={item.Milestones}
          mileStoneTempStyle={props.mileStoneTempStyle}
          templateComboStyle={props.templateComboStyle}
        />
        {props?.noBackBtn ? (
          ""
        ) : (
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.reusableCardFooter
                : styles.reusableCardFooter
            }
            style={{ ...props.cardFooter }}
          >
            <div className={styles.reusableLeftDiv}>
              {props.bRemoveBtn ? (
                <button
                  className={styles.previewButton}
                  onClick={props.removeFunction}
                  id="pmweb_removeBtn_TempCard"
                >
                  {t("remove")}
                </button>
              ) : null}
            </div>
            <div className={styles.reusableRightDiv}>
              {props.bReplaceBtn ? (
                <button
                  className={styles.previewButton}
                  onClick={props.replaceFunction}
                  id="pmweb_replaceBtn_TempCard"
                >
                  {t("replace")}
                </button>
              ) : null}
              {props.bPreviewBtn ? (
                <button
                  className={styles.previewButton}
                  onClick={previewTemplate}
                  id={`pmweb_previewBtn_TempCard_${uuidv4()}`}
                >
                  {t("preview")}
                </button>
              ) : null}
              {props.bSelectBtn ? (
                <button
                  className={
                    props.disableSelect
                      ? styles.disabledButton
                      : styles.previewButton
                  }
                  onClick={props.selectFunction}
                  disabled={props.disableSelect}
                  id={`pmweb_selectBtn_TempCard_${uuidv4()}`}
                >
                  {t("select")}
                </button>
              ) : null}
              {props.bSelectTemplateBtn ? (
                <button
                  className={styles.selectButton}
                  onClick={props.selectTemplate}
                  id={`pmweb_selectTemplateBtn_TempCard_${uuidv4()}`}
                >
                  {t("selectTemplate")}
                </button>
              ) : null}
              {props.bOpenBtn ? (
                <button
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.previewButton
                      : styles.previewButton
                  }
                  onClick={previewTemplate}
                  id={`pmweb_openBtn_TempCard_${uuidv4()}`}
                >
                  {t("open")}
                </button>
              ) : null}
              {props.bCreateProcessBtn ? (
                <button
                  className={styles.selectButton}
                  onClick={props.createProcessFunc}
                  id={`pmweb_createProcessBtn_TempCard_${uuidv4()}`}
                >
                  {t("CreateProcess")}
                </button>
              ) : null}
              {props.bUseTemplateBtn ? (
                <button
                  className={styles.useTemplateBtn}
                  onClick={props.useTemplateFunc}
                  id="pmweb_useTemplateBtn_TempCard"
                >
                  {t("UseTemplate")}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    openTemplate: (id, name, flag) =>
      dispatch(actionCreators.openTemplate(id, name, flag)),
  };
};

export default connect(null, mapDispatchToProps)(SingleTemplateCard);
