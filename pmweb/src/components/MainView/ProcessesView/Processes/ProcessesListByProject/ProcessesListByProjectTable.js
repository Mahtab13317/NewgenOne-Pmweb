// Changes made to solve Bug 115456 -> Process Search: Searching not working for Processes listed under the projects
// Changes made to solve Bug 112929 - If search list has no data then it should have some error message appearing
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly
import React, { useState, useEffect } from "react";
import ProcessIcon from "../../../../../assets/HomePage/HS_Process.svg";
import FileType from "../../../../../assets/ProcessView/FileType.svg";
import "../../Projects/projects.css";
import { useTranslation } from "react-i18next";
import { tileProcess } from "../../../../../utility/HomeProcessView/tileProcess";
import { useHistory } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import * as actionCreators from "../../../../../redux-store/actions/processView/actions.js";
import NoResultFound from "../../../../../assets/NoSearchResult.svg";
import { getProcessesByRights } from "../../../../../utility/UserRightsFunctions";
import secureLocalStorage from "react-secure-storage";
import {
  APP_HEADER_HEIGHT,
  RTL_DIRECTION,
} from "../../../../../Constants/appConstants";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";

const useStyles = makeStyles({
  processType: {
    textTransform: "uppercase",
    fontFamily: "var(--font_family)",
    fontWeight: "600",
    fontSize: "11px",
  },
  checkedType: {
    fontFamily: "var(--font_family)",
    fontSize: "11px",
  },
});

function Table(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles();
  const history = useHistory();
  const [filteredRow, setFilteredRow] = useState([]);
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const clickRow = (el) => {
    // code commented on 06 June 2023 for BugId 119488 and BugId 127429
    /*dispatch(
      setPreviousProcessPage({
        previousProcessPage: PREVIOUS_PAGE_PROCESS,
        projectId: props.selectedProjectId,
        tabType: props.tabValue,
        clickedTile: null,
        clickedTileIndex: null,
        clickedTileCount: null,
      })
    );*/
    props.openProcessClick(
      el.ProcessDefId,
      el.ProjectName,
      el.ProcessType,
      el.Version,
      el.ProcessName
    );
    props.openTemplate(null, null, false);
    history.push("/process");
  };

  useEffect(() => {
    let processListWithRights =
      props.tabValue === 0
        ? props.processesPerProject
        : getProcessesByRights(props.processesPerProject);
    setFilteredRow(processListWithRights);
  }, [props.processesPerProject]);

  useEffect(() => {
    let processListWithRights =
      props.tabValue === 0
        ? props.processesPerProject
        : getProcessesByRights(props.processesPerProject);
    if (processListWithRights?.length > 0) {
      if (props.searchTerm == "") {
        setFilteredRow(processListWithRights);
      } else {
        let searchedList = processListWithRights?.filter((row) => {
          if (
            row.ProcessName.toLowerCase().includes(
              props.searchTerm.toLowerCase()
            )
          ) {
            return row;
          }
        });
        setFilteredRow(searchedList);
      }
    }
  }, [props.searchTerm]);

  useEffect(() => {
    let processListWithRights =
      props.tabValue === 0
        ? props.processesPerProject
        : getProcessesByRights(props.processesPerProject);
    let temp;
    if (props.selectionOne == 2 || props.selectionTwo == 1) {
      temp = [...processListWithRights];
    } else {
      temp = [
        ...processListWithRights.filter((el) => {
          return el.LastModifiedBy == secureLocalStorage.getItem("username");
        }),
      ];
    }
    const newTemp = temp.map((obj) => {
      return {
        ...obj,
        LastModifiedOn: new Date(obj.LastModifiedOn).getTime(),
      };
    });
    function compare(a, b) {
      if (a.LastModifiedOn < b.LastModifiedOn) {
        return -1;
      }
      if (a.LastModifiedOn > b.LastModifiedOn) {
        return 1;
      }
      return 0;
    }
    const newTempAsc = newTemp.sort(compare);
    if (props.selectionOne == 2 && props.selectionTwo == 1) {
      setFilteredRow(temp.reverse());
    } else if (props.selectionOne == 2 && props.selectionTwo == 0) {
      setFilteredRow(temp);
    } else if (
      (props.selectionOne == 1 && props.selectionTwo == 0) ||
      (props.selectionOne == 0 && props.selectionTwo == 0)
    ) {
      setFilteredRow(newTempAsc);
    } else if (
      (props.selectionOne == 1 && props.selectionTwo == 1) ||
      (props.selectionOne == 0 && props.selectionTwo == 1)
    ) {
      setFilteredRow(newTempAsc.reverse());
    }
  }, [props.selectionOne, props.selectionTwo]);

  const getSourceFunc = (el) => {
    if (el.ProcessType === "R" && el.ProcessState === "Disabled") {
      return tileProcess("R")[0];
    } else if (el.ProcessType === "R" && el.ProcessState === "Enabled") {
      return tileProcess("E")[0];
    } else if (el.ProcessType === "L") {
      return tileProcess("L")[0];
    }
  };

  const getTagFunc = (el) => {
    if (el.ProcessType === "R" && el.ProcessState === "Disabled") {
      return tileProcess("R")[1];
    } else if (el.ProcessType === "R" && el.ProcessState === "Enabled") {
      return tileProcess("E")[1];
    } else if (el.ProcessType === "L") {
      return tileProcess("L")[1];
    }
  };

  const getImageFunc = (el) => {
    if (el.ProcessType === "R" && el.ProcessState === "Disabled") {
      return tileProcess("R")[5];
    } else if (el.ProcessType === "R" && el.ProcessState === "Enabled") {
      return tileProcess("E")[5];
    } else if (el.ProcessType === "L") {
      return tileProcess("L")[5];
    }
  };
  // code updated on 07 Dec 2022 for BugId 119885

  const handleKeyDown = (e, el) => {
    if (e.keyCode === 13) {
      clickRow(el);
      e.stopPropagation();
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyDown);
  //   return () => document.removeEventListener("keydown", handleKeyDown);
  // },[handleKeyDown]);

  let rowDisplay = (
    props.tabValue === 0
      ? props.processesPerProject?.length > 0
      : getProcessesByRights(props.processesPerProject)?.length > 0
  ) ? (
    filteredRow?.length > 0 ? (
      filteredRow.map((el) => {
        return (
          <div
            className="tableRow"
            onClick={() => clickRow(el)}
            id={`pmweb_processesTab_${el.ProcessName}`}
            onKeyDown={(e) => handleKeyDown(e, el)}
            tabIndex={0}
            role="TableRow"
            aria-label={`${el.ProcessName}`}
            aria-description={`Clickable ${el.ProcessName} Row`}
          >
            <div
              className="processListRow1"
              style={{
                transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
              }}
            >
              <img
                src={ProcessIcon}
                className="iconTypeProcess"
                alt={t("processListing")}
              />
            </div>
            <div className="processListRow2">
              {el.ProcessName}
              {
                //Added  on 14/08/2023, bug_id:131405
              }
              <LightTooltip
                id="pmweb_projectname_Tooltip"
                arrow={true}
                enterDelay={500}
                placement="bottom-start"
                title={el.ProjectName}
              >
                <span>
                  v {el.Version} . {shortenRuleStatement(el.ProjectName, 40)}
                </span>
              </LightTooltip>
            </div>
            <div className="processListRow3">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={getSourceFunc(el)}
                  style={{
                    height: "0.75rem",
                    width: "0.75rem",
                    marginRight: "0.125vw",
                  }}
                  alt={t("processListing")}
                />
                <p className={classes.processType}>
                  {t(getTagFunc(el))}
                  {/* <img src={getImageFunc(el)} alt=" "/> */}
                </p>
                <span className={classes.checkedType}>
                  {el.CheckedOut === "Y" ? `(${t("Checked")})` : null}
                </span>
              </div>
              <p style={{ fontSize: "11px" }}>
                {t("processesTable.createdOn")} {el.CreatedDate}
              </p>
            </div>
            <div className="processListRow4">
              <p
                className="recentTableProcessDate"
                style={{
                  fontFamily: "var(--font_family)",
                  fontWeight: "600",
                  fontSize: "11px",
                }}
              >
                {el.ModifiedDate}
              </p>
              <p
                style={{
                  fontFamily: "var(--font_family)",
                  fontSize: "11px",
                }}
              >
                {t("processesTable.editedBy")} {el.LastModifiedBy}{" "}
                {t("processesTable.at")} {el.ModifiedTime}
              </p>
            </div>
          </div>
        );
      })
    ) : (
      // code updated on 28 Nov 2022 for BugId 112906
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          // height: "68vh",
          height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 14rem)`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "150px", height: "150px" }}>
          <img
            src={NoResultFound}
            className="noSearchResultImage"
            alt={t("noSearchResult")}
          />
        </div>
        <p>{t("noSearchResult")}</p>
      </div>
    )
  ) : (
    // Changes to resolve the bug Id 125523
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        // height: "68vh",
        height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 14rem)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "150px", height: "150px" }}>
        <img
          src={NoResultFound}
          className="noSearchResultImage"
          alt={t("processList.noProcessesAreAvailable")}
          style={{
            transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
          }}
        />
      </div>
      {/* Added on : 23-05-2023 for BUGID: 127407 */}
      {/* <p>{t("noProcessesAreAvailable")}</p> */}
      <p>{t("processList.noProcessesAreAvailable")}</p>
    </div>
  );

  return (
    <div className="processTable">
      {props.showTableHead ? (
        <div className="tableHead">
          <div className="processListHead1">
            <img
              src={FileType}
              className="iconTypeProject"
              style={{
                transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
              }}
              alt={t("processesTable.processesName")}
            />
          </div>
          <div className="processListHead2">
            {t("processesTable.processesName")}
          </div>
          <div className="processListHead3">
            {t("processesTable.processStatus")}
          </div>
          <div className="processListHead4">
            {t("processesTable.lastModifiedDate")}
          </div>
        </div>
      ) : (
        ""
      )}
      <div
        className="tableRows"
        style={{
          height: "auto",
          maxHeight: props.maxHeightofTable,
          margin: props.margin,
        }}
      >
        {rowDisplay}
      </div>
    </div>
  );
}
const mapDispatchToProps = (dispatch) => {
  return {
    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        actionCreators.openProcessClick(id, name, type, version, processName)
      ),
    openTemplate: (id, name, flag) =>
      dispatch(actionCreators.openTemplate(id, name, flag)),
  };
};

export default connect(null, mapDispatchToProps)(Table);
