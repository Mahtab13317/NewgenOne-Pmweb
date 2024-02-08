// Changes made to solve Bug with ID 115457 -> Process Searching: search result result should refresh after erasing the entry of the search field
// Changes made to solve Bug 112929 - If search list has no data then it should have some error message appearing
// Changes made to solve bug with ID Bug 112353 - After Process importing the changes of imported process are reflecting only after the reopening of the process

import React, { useState, useEffect } from "react";
import ProcessIcon from "../../../../../assets/HomePage/HS_Process.svg";
import FileType from "../../../../../assets/ProcessView/FileType.svg";
import NoResultFound from "../../../../../assets/NoSearchResult.svg";
import "../../Projects/projects.css";
import { useTranslation } from "react-i18next";
import { tileProcess } from "../../../../../utility/HomeProcessView/tileProcess";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import * as actionCreators from "../../../../../redux-store/actions/processView/actions.js";
import { connect, useSelector } from "react-redux";
import { getProcessesByRights } from "../../../../../utility/UserRightsFunctions";
import {
  APP_HEADER_HEIGHT,
  RTL_DIRECTION,
} from "../../../../../Constants/appConstants";

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
  const [filteredRow, setFilteredRow] = useState([]);
  const history = useHistory();
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  useEffect(() => {
    props.setfilteredLength(filteredRow?.length);
  }, [filteredRow]);

  useEffect(() => {
    // code edited on 10 Jan 2023 for BugId 121183
    if (props.selectedProcessCode !== "L") {
      let processListWithRights = getProcessesByRights(props.processList);
      if (props.selectedProcessCode == "E") {
        let tempList = processListWithRights?.filter((el) => {
          return el.ProcessState == "Enabled";
        });
        setFilteredRow(tempList);
      } else {
        let tempList = processListWithRights?.filter((el) => {
          return el.ProcessState == "Disabled";
        });
        setFilteredRow(tempList);
      }
    } else {
      if (props.processList && props.processList.length > 0) {
        setFilteredRow(props.processList);
      }
    }
  }, [props.processList, props.selectedProcessCode]);

  //  Changes made to solve Bug 110792 - Process tab: Filter on Process tab not working
  useEffect(() => {
    let temp = [...filteredRow];
    const newTemp = temp.map((obj) => {
      return {
        ...obj,
        LastModifiedOn: new Date(obj.LastModifiedOn).getTime(),
      };
    });
    function compareLastModified(a, b) {
      if (a.LastModifiedOn < b.LastModifiedOn) {
        return -1;
      }
      if (a.LastModifiedOn > b.LastModifiedOn) {
        return 1;
      }
      return 0;
    }
    const newTempAsc = newTemp.sort(compareLastModified);
    if (props.selectionOne == 2 && props.selectionTwo == 0) {
      setFilteredRow(
        temp.sort((a, b) =>
          a.ProcessName.toLowerCase() > b.ProcessName.toLowerCase() ? 1 : -1
        )
      );
    } else if (props.selectionOne == 2 && props.selectionTwo == 1) {
      setFilteredRow(
        temp.sort((a, b) =>
          a.ProcessName.toLowerCase() > b.ProcessName.toLowerCase() ? -1 : 1
        )
      );
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

  useEffect(() => {
    let tempList = [];
    let processListWithRights =
      props.selectedProcessCode === "L"
        ? props.processList
        : getProcessesByRights(props.processList);
    if (processListWithRights?.length > 0) {
      if (props.selectedProcessCode !== "L") {
        if (props.selectedProcessCode == "E") {
          tempList = processListWithRights?.filter((el) => {
            return el.ProcessState == "Enabled";
          });
          //setFilteredRow(tempList);
        } else {
          tempList = processListWithRights?.filter((el) => {
            return el.ProcessState == "Disabled";
          });
          //setFilteredRow(tempList);
        }
      } else {
        //Added on 31/08/2023  for bug_id:134715
        tempList = processListWithRights;
        //till here for bug_id:134715

        if (props.processList && props.processList.length > 0) {
          //setFilteredRow(props.processList);
        }
      }
      let searchedList = tempList?.filter((row) => {
        if (props.searchTerm == "") {
          return row;
        } else if (
          row.ProcessName.toLowerCase().includes(props.searchTerm.toLowerCase())
        ) {
          return row;
        }
      });
      setFilteredRow(searchedList);
    }
  }, [props.searchTerm]);

  const handleRowClick = (el) => {
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
      el.ProcessDefId, //processId
      el.ProjectName, //parent
      el.ProcessType, //status
      el.Version, //version
      el.ProcessName //processname
    );
    // code added on 24 Nov 2022 for BugId 117805
    props.openTemplate(null, null, false);
    history.push("/process");
  };
  const handleKeyDown = (e, el) => {
    if (e.keyCode === 13) {
      handleRowClick(el);
      e.stopPropagation();
    }
  };

  let rowDisplay =
    filteredRow?.length > 0 ? (
      filteredRow.map((el) => {
        return (
          <div
            className="tableRow"
            onClick={() => handleRowClick(el)}
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
                alt="Process Name"
              />
            </div>
            <div className="processListRow2">
              {el.ProcessName}
              <span>
                v {el.Version} . {el.ProjectName}
              </span>
            </div>
            <div className="processListRow3">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  alt="Process Type"
                  src={
                    tileProcess(
                      el.ProcessType == "R"
                        ? el.ProcessState == "Enabled"
                          ? "E"
                          : "R"
                        : "L"
                    )[0]
                  }
                  style={{
                    height: "0.75rem",
                    width: "0.75rem",
                    marginRight: "0.125vw",
                  }}
                />
                <p className={classes.processType}>
                  {t(
                    tileProcess(
                      el.ProcessType == "R"
                        ? el.ProcessState == "Enabled"
                          ? "E"
                          : "R"
                        : "L"
                    )[1]
                  )}{" "}
                  <img
                    src={
                      tileProcess(
                        el.ProcessType == "R" && el.ProcessState == "Enabled"
                          ? "E"
                          : "R"
                      )[5]
                    }
                  />
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
            <br />
            <br />
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
          gap: "0.5rem",
        }}
      >
        <img
          src={NoResultFound}
          className="noSearchResultImage"
          alt={t("processList.noProcessesAreAvailable")}
          style={{ width: "150px", height: "150px", top: "42%" }}
        />
        <p style={{ fontWeight: "500", fontFamily: "var(--font_family)" }}>
          {t("processList.noProcessesAreAvailable")}
        </p>
      </div>
    );

  return (
    <div className="processTable">
      {props.showTableHead &&
      (props.selectedProcessCode === "L"
        ? props.processList?.length > 0
        : getProcessesByRights(props.processList)?.length > 0) ? (
        <div className="tableHead">
          <div className="processListHead1">
            <img
              src={FileType}
              className="iconTypeProcess"
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
      <div className="tableRows" style={{ maxHeight: props.maxHeightofTable }}>
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
