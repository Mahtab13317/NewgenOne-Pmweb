// Changes made to solve Bug 116204 - Associated Queue: Selected Group title is grammatically incorrect
// Changes made to solve Bug 116179 - Associated Queue: Search is not working for Groups
import React, { useState, useEffect } from "react";
import styles from "../../../ProcessSettings/Trigger/Properties/properties.module.css";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { connect } from "react-redux";
import SearchComponent from "../../../../UI/Search Component/index.js";
import PersonIcon from "@material-ui/icons/Person";
import filter from "../../../../assets/Tiles/Filter.svg";
import Modal from "../../../../UI/Modal/Modal.js";
import FilterScreen from "./filterScreen";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { store, useGlobalState } from "state-pool";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function GroupsTab(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);

  // modified on 23/01/24 for BugId 141169
  /*let readOnlyProcess =
    props.openTemplateFlag ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === PROCESSTYPE_REGISTERED_CHECKED ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo;*/
  let readOnlyProcess =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo;
  // till here BugId 141169

  const [first, setfirst] = useState("0");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterScreen, setShowFilterScreen] = useState(null);
  const [deSelectedRows, setDeSelectedRows] = useState([]); //Added on 06/10/2023, bug_id:135581

  useEffect(() => {
    setfirst(props.selectedGroupLength);
  }, [props.selectedGroupLength]);

  //Added on 06/10/2023, bug_id:135581
  useEffect(() => {
    if (props?.addedVarList?.length > 0) {
      const results = props?.tableContent.filter(
        ({ ID: id1 }) => !props?.addedVarList.some(({ ID: id2 }) => id2 === id1)
      );
      props?.setVariableList(results);
      setDeSelectedRows(results);
    } else {
      setDeSelectedRows(props?.tableContent);
    }
  }, [props?.addedVarList, props?.deSelectedVarList]);

  //till here for  bug_id:135581

  const openFilterScreenHandler = (option) => {
    setShowFilterScreen(option.ID);
  };

  const getTableHeader = () => {
    if (first == 0 || first == 1) {
      return `${first} ${t("groupSelected")}`;
    } else {
      return `${first} ${t("groupsSelected")}`;
    }
  };

  //Modified on 06/10/2023, bug_id:135581
  let filteredRows = deSelectedRows?.filter((row) => {
    //let filteredRows = props?.tableContent.filter((row) => {
    if (searchTerm == "") {
      return row;
    } else if (row.GroupName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return row;
    }
  });

  return (
    <React.Fragment>
      <table
        className={styles.dataTableQueue}
        style={{
          border: "1px solid #EFEFEF",
          marginInlineEnd: props.tableType === "add" ? "1vw" : "0px",
        }}
      >
        <thead className={styles.dataTableHead}>
          <tr>
            <th className={styles.dataTableHeadCell}>
              <p className={styles.dataTableHeadCellContent}>
                {props.tableType === "add"
                  ? t("selectGroup")
                  : t("selectedGroups")}
              </p>
            </th>
          </tr>
        </thead>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "0.5rem 0.5vw",
          }}
        >
          <SearchComponent
            style={{
              width: "100%",
              height: "var(--line_height)",
            }}
            setSearchTerm={setSearchTerm}
            ariaDescription={
              props.tableType === "add" ? "Select Group" : "Selected Groups"
            }
            placeholder={t("search")}
          />
          {
            // added on 23/01/24 for BugId 141169
            (+props.queueType === 0 && props.queueFrom === "graph") ||
            +props.queueType === 1
              ? // till here BugId 141169
                !readOnlyProcess &&
                (props.tableContent && props.tableContent.length > 0 ? (
                  <th className={styles.dataTableHeadCell_Buttons}>
                    <p
                      className={styles.dataEntryAddRemoveBtnHeader}
                      style={{
                        color:
                          props.tableType === "remove"
                            ? "rgb(181,42,42)"
                            : "#0072C6",
                      }}
                      onClick={props.headerEntityClickFunc}
                      id={`${props.id}_all`}
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && props.headerEntityClickFunc(e)
                      }
                    >
                      {props.tableType === "remove"
                        ? "- " + t("removeAll")
                        : "+ " + t("addAll")}
                    </p>
                  </th>
                ) : null)
              : null
          }
        </div>
        {props.tableType === "add" ? (
          <p
            style={{
              fontSize: "14px",
              fontWeight: "700",
              margin: "0.5rem 0.5vw",
            }}
          >
            {getTableHeader()}
          </p>
        ) : null}
        <tbody
          className={
            props.tableContent && props.tableContent.length > 0
              ? props.tableType === "remove"
                ? styles.dataTableBodyQueueRemove
                : styles.dataTableBodyQueue
              : `relative ${styles.dataTableBodyQueue} ${
                  props.tableType === "remove"
                    ? styles.dataTableBodyWithNoDataQueueAssRemove
                    : styles.dataTableBodyWithNoDataQueueAss
                }`
          }
          style={{
            margin: "0.5rem 0.5vw",
          }}
        >
          {props.tableContent && props.tableContent.length > 0 ? (
            filteredRows?.map((option, index) => {
              return (
                <tr
                  className={styles.dataTableRow_Queue}
                  style={{ position: "relative" }}
                >
                  <td className={styles.dataTableBodyCell_Queue}>
                    <div className={styles.dropdownVariable}>
                      {/*Bug 116181 [28-02-2023] Provided the LightTooltip */}
                      <LightTooltip
                        id="doc_Tooltip"
                        arrow={true}
                        enterDelay={500}
                        placement="bottom-start"
                        title={option.GroupName}
                      >
                        <span
                          style={{
                            flex: "0.75",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {shortenRuleStatement(option?.GroupName, 30)}
                        </span>
                      </LightTooltip>
                      {/* <span>{option.SystemDefinedName}</span> */}
                    </div>
                  </td>
                  <td
                    className={styles.dataTableBodyCell_Queue}
                    style={{
                      position: "absolute",
                      right: direction !== RTL_DIRECTION ? "26%" : "",
                      left: direction === RTL_DIRECTION ? "26%" : "",
                      top: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <PersonIcon style={{ height: "14px" }} />
                    <span style={{ fontSize: "11px" }}>60 </span>
                    {props.tableType === "remove" ? (
                      <img
                        src={filter}
                        alt="Filter"
                        style={{
                          height: "1.5rem",
                          width: "1.5rem",
                          cursor: "pointer",
                        }}
                        onClick={() => openFilterScreenHandler(option)}
                      />
                    ) : null}
                  </td>
                  {
                    // added on 23/01/24 for BugId 141169
                    (+props.queueType === 0 && props.queueFrom === "graph") ||
                    +props.queueType === 1
                      ? // till here BugId 141169
                        !readOnlyProcess && (
                          <td className={styles.dataTableBodyCell_Queue}>
                            <p
                              className={`${styles.dataEntryAddRemoveBtnHeader} ${styles.mt025}`}
                              style={{
                                color:
                                  props.tableType === "remove"
                                    ? "rgb(181,42,42)"
                                    : "#0072C6",
                              }}
                              onClick={() =>
                                props.singleEntityClickFunc(option)
                              }
                              id={`${props.id}_item${index}`}
                              tabIndex={0}
                              aria-label={`${option?.GroupName}`}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                props.singleEntityClickFunc(option)
                              }
                            >
                              {props.tableType === "remove"
                                ? "- " + t("remove")
                                : "+ " + t("add")}
                            </p>
                          </td>
                        )
                      : null
                  }
                </tr>
              );
            })
          ) : (
            <div className={styles.noDataEntryRecords}>
              {props.tableType === "add"
                ? t("groupsRemoveRecords")
                : t("groupsAddRecords")}
            </div>
          )}
        </tbody>
      </table>
      {/* -------------------------------------------------SHOW FILTER MODAL-------------------------------------------- */}
      {showFilterScreen !== null ? (
        <Modal
          show={showFilterScreen !== null}
          backDropStyle={{ backgroundColor: "black", opacity: "0.4" }}
          style={{
            top: "15%",
            left: "6%",
            padding: "0",
            position: "absolute",
            width: "520px",
            height: "342px",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          // code removed on 22 April 2023 for BugId 127404 - queue>>group>>filter>>cross button is not working
          children={
            <FilterScreen
              setShowFilterScreen={setShowFilterScreen}
              query={props.query}
              selectedGroupId={showFilterScreen}
              setQuery={props.setQuery}
              isReadOnly={readOnlyProcess}
              queueType={props.queueType} // added on 23/01/24 for BugId 141169
              queueFrom={props.queueFrom} // added on 23/01/24 for BugId 141169
            />
          }
        ></Modal>
      ) : null}

      {/* -------------------------------------------------------END---------------------------------------------------- */}
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessType: state.openProcessClick.selectedType,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(GroupsTab);
