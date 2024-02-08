// #BugID - 125171
// #BugDescription -  Fixed the issue Without for assignment of pmweb menu rights the user is getting all the access for the same and able to peroform operation

import React from "react";
import { useTranslation } from "react-i18next";
import TemplateIcon from "../../../assets/ProcessView/ProcessIcon.svg";
import styles from "./template.module.css";
import arabicStyles from "./templateArabicStyles.module.css";
import { Grid } from "@material-ui/core";
import {
  RTL_DIRECTION,
  SYSTEM_DEFINED_SCOPE,
  userRightsMenuNames,
} from "../../../Constants/appConstants";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import { InfoOutlined, MoreVertOutlined } from "@material-ui/icons";
import MortVertModal from "../../../UI/ActivityModal/Modal";
import * as actionCreators from "../../../redux-store/actions/processView/actions";
import * as actionCreators_template from "../../../redux-store/actions/Template";
import LockIcon from "@material-ui/icons/Lock";
import { useHistory } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import {
  PREVIOUS_PAGE_LIST,
  TEMPLATE_LIST_VIEW,
} from "../../../Constants/appConstants";
import { UserRightsValue } from "../../../redux-store/slices/UserRightsSlice";
import { getMenuNameFlag } from "../../../utility/UserRightsFunctions";
import { decode_utf8, encode_utf8 } from "../../../utility/UTF8EncodeDecoder";
import { LightTooltip } from "../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function TemplateListView(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const history = useHistory();

  const userRightsValue = useSelector(UserRightsValue);

  // Boolean that decides whether create process button will be visible or not.
  const createProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProcess
  );

  const TemplateTooltip = withStyles((theme) => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      border: "1px solid #70707075",
      font: "normal normal normal 12px/17px Open Sans",
      letterSpacing: "0px",
      color: "#000000",
      transform: "translate3d(0px, -0.25rem, 0px) !important",
    },
    arrow: {
      "&:before": {
        backgroundColor: "#FFFFFF !important",
        border: "1px solid #70707075 !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  const getActionName = (actionName, template) => {
    if (actionName === t("open")) {
      previewTemplate(template);
    } else {
      props.setActedTemplate(template);
      props.setAction(actionName);
    }
  };

  const previewTemplate = (template) => {
    localStorage.setItem("useThisTemplate", JSON.stringify(template));
    localStorage.setItem("categoryDetail", JSON.stringify(props.category));
    props.setTemplatePage(PREVIOUS_PAGE_LIST);
    props.setTemplateDetails(props.category, TEMPLATE_LIST_VIEW);
    props.openTemplate(template.Id, template.Name, true);
    // code edited on 10 Oct 2022 for BugId 112343 and BugId 112684
    props.openProcessClick("", "", "", "", "");
    history.push("/process");
  };

  let rowDisplay = props.templateList.map((el) => {
    return (
      <div
        className={styles.templateListTableRow}
        id={`pmweb_template_categoryList_${el.Name}`}
        tabIndex={0}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            previewTemplate(el);
            e.stopPropagation();
          }
        }}
      >
        {/* Changes on 07-09-2023 to resolve the bug Id 135495 */}
        <Grid
          container
          spacing={1}
          justifyContent="space-between"
          xs={12}
          style={{ display: "contents" }}
        >
          <Grid item xs={1}>
            <div
              className={styles.templateListTableIcon}
              onClick={() => previewTemplate(el)}
            >
              <img
                src={TemplateIcon}
                className={styles.templateIcon}
                alt="Template"
              />
            </div>
          </Grid>
          <Grid item xs={2}>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.templateListTableName
                  : styles.templateListTableName
              }
              onClick={() => previewTemplate(el)}
            >
              {/* Changes made to solve Bug 136311 */}
              <LightTooltip
                id="template_Tooltip"
                arrow={true}
                enterDelay={500}
                placement="right-end" //Changes made to solve Bug 136311
                title={el.Name}
              >
                <span className={styles.templateName}>
                  {shortenRuleStatement(el.Name, 15)}
                </span>
              </LightTooltip>
              {/* till here dated 21stSept */}
              {el.Description?.trim() !== "" ? (
                <TemplateTooltip
                  arrow
                  title={decode_utf8(el.Description)}
                  placement={
                    direction === RTL_DIRECTION ? "bottom-end" : "bottom-start"
                  }
                >
                  <InfoOutlined
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.templateInfoIcon
                        : styles.templateInfoIcon
                    }
                  />
                </TemplateTooltip>
              ) : (
                ""
              )}
              {el.Scope == SYSTEM_DEFINED_SCOPE ? (
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

              {
                // code added on 11 October 2022 for BugId 112359
              }
              {/* <p
            style={{
              width: "fit-content",
              background: "#F0F0F0",
              padding: "0 0.5vw",
            }}
          >
            v {el.VersionNo}
          </p> */}
            </div>
          </Grid>
          <Grid item xs={2} md={3}>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.templateListTableCreatedBy
                  : styles.templateListTableCreatedBy
              }
              onClick={() => previewTemplate(el)}
            >
              {
                // code added on 27 October 2022 for BugId 112359
              }
              {el.Creator}
              <span className={styles.templateCreationDate}>
                {
                  /*  {el.SameDate === "true"
                  ? `at ${el.CreatedTime}`
                  : `${el.CreatedBy} on ${el.CreatedDate} at ${el.CreatedTime}`} */
                  el.SameDate === "true"
                    ? `${el.CreatedBy} on ${el.CreatedDate} at ${el.CreatedTime}`
                    : `${el.CreatedBy} on ${el.CreatedDate} at ${el.CreatedTime}`
                }
              </span>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.templateListTableDate
                  : styles.templateListTableDate
              }
              onClick={() => previewTemplate(el)}
            >
              {el.AccessedDate?.trim() !== ""
                ? el.AccessedDate + " at " + el.AccessedTime
                : "-"}
            </div>
          </Grid>
          <Grid item xs={2} md={2}>
            <div
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.templateListTableUsage
                  : styles.templateListTableUsage
              }
              onClick={() => previewTemplate(el)}
            >
              <span style={{ color: "#2274bc", marginRight: "10px" }}>
                {
                  //Modified on 12/09/2023, bug_id:136595
                }
                {t("preview")}
                {
                  //till here for bug_id:136595
                }
              </span>
              {/* {el.UsageCount > 0 ? (
                <span
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.templateUsageCount
                      : styles.templateUsageCount
                  }
                >
                  {t("usedIn")} {el.UsageCount}{" "}
                  {el.UsageCount > 1 ? t("processes") : t("process")}
                </span>
              ) : null} */}
            </div>
          </Grid>
          <Grid item xs={3} md={2}>
            <div className={styles.templateListTableExtras}>
              {/* <button
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.createProcessBtn
                : styles.createProcessBtn
            }
            onClick={() => {
              props.createProcessFunc();
              props.setSelectedTemplate(el);
            }}
          >
            {t("CreateProcess")}
          </button> */}
              {createProcessRightsFlag ? (
                <button
                  className="deployButton"
                  id={`pmweb_template_CategoryList_useTemplate_btn${el.Name}`}
                  onClick={() => {
                    props.createProcessFunc();
                    props.setSelectedTemplate(el);
                  }}
                  // style={{minWidth:"10rem"}} //code modified on 28-09-2023 for bugId: 138201
                  style={{
                    minWidth: window.innerWidth < 850 ? "6rem" : "10rem",
                  }}
                >
                  <span className="deployText">{t("UseThisTemplate")}</span>
                </button>
              ) : null}

              <MortVertModal
                backDrop={false}
                getActionName={(actionName) => getActionName(actionName, el)}
                modalPaper={
                  direction === RTL_DIRECTION
                    ? arabicStyles.moreVertTemplateModal
                    : styles.moreVertTemplateModal
                }
                modalDiv={styles.moreVertDiv}
                sortByDiv={styles.moreVertModalDiv}
                oneSortOption={styles.moreVertModalOption}
                showTickIcon={false}
                sortSectionOne={
                  el.Scope === SYSTEM_DEFINED_SCOPE
                    ? [t("open")]
                    : [t("open"), t("delete")] //code edited on 30 September 2022 for BugId 116226
                }
                buttonToOpenModal={
                  <MoreVertOutlined className={styles.moreVertIcon} />
                }
                dividerLine="dividerLineActivity"
                isArabic={direction === RTL_DIRECTION}
                hideRelative={true}
                tabIndex={0}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    );
  });

  return (
    <React.Fragment>
      {props.templateList?.length > 0 ? (
        <React.Fragment>
          <div className={styles.templateListTableHeader}>
            <Grid container spacing={1} justifyContent="space-between" xs={12}>
              <Grid item xs={1}>
                <div className={styles.templateListTableHeaderIcon}>{""}</div>
              </Grid>
              <Grid item xs={2}>
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.templateListTableHeaderName
                      : styles.templateListTableHeaderName
                  }
                >
                  {t("Template")} {t("name")}
                </div>
              </Grid>
              <Grid item xs={2} md={3}>
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.templateListTableHeaderCreatedBy
                      : styles.templateListTableHeaderCreatedBy
                  }
                >
                  {t("createdBy")}
                </div>
              </Grid>
              <Grid item xs={2}>
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.templateListTableHeaderDate
                      : styles.templateListTableHeaderDate
                  }
                >
                  {t("lastOpenedOn")}
                </div>
              </Grid>
              <Grid item xs={2}>
                <div className={styles.templateListTableHeaderUsage}>{""}</div>
              </Grid>
              <Grid item xs={3} md={2}>
                <div className={styles.templateListTableHeaderExtras}>{""}</div>
              </Grid>
            </Grid>
          </div>
          <div className="tableRows">{rowDisplay}</div>
        </React.Fragment>
      ) : (
        <div className={styles.noRecordDiv}>{t("noRecords")}</div>
      )}
    </React.Fragment>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    openTemplate: (id, name, flag) =>
      dispatch(actionCreators.openTemplate(id, name, flag)),
    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        actionCreators.openProcessClick(id, name, type, version, processName)
      ),
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
    setTemplateDetails: (category, view, createBtnClick, template) =>
      dispatch(
        actionCreators_template.setTemplateDetails(
          category,
          view,
          createBtnClick,
          template
        )
      ),
  };
};

export default connect(null, mapDispatchToProps)(TemplateListView);
