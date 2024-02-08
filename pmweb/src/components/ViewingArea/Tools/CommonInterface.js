// Made changes to solve bug with ID 113917
// #BugID - 119039
// #BugDescription - Switching tab data showing issue for Rules has been fixed.
// #Date - 15 November 2022
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SearchProject from "../../../UI/Search Component/index";
import Modal from "@material-ui/core/Modal";
import AddGroup from "./Exception/AddGroup";
import Rules from "./Rules/Rules";
import {
  RTL_DIRECTION,
  SCREENTYPE_EXCEPTION,
  SCREENTYPE_TODO,
  headerHeight,
} from "../../../Constants/appConstants";
import "../Tools/Interfaces.css";
import { useSelector } from "react-redux";

function CommonInterface(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [selectedTab, setSelectedTab] = useState("screenHeading");
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const { isReadOnly } = props;
  const tabChangeHandler = (e, tabName) => {
    setSelectedTab(tabName);
  };

  const loadActivities = () => {
    return props.GetActivities();
  };
  useEffect(() => {
    loadActivities();
  }, [props.loadedMileStones]);

  //code edited on 8 June 2022 for BugId 110197
  const rulesTab = () => {
    if (props.screenType === SCREENTYPE_TODO) {
      return (
        <Rules
          ruleDataType={props.ruleDataType}
          interfaceRules={props.todoAllRules}
          setInterfaceRules={props.setTodoAllRules}
          ruleType={props.ruleType}
          ruleDataTableStatement={t("todoRemoveRecords")}
          addRuleDataTableStatement={t("todoAddRecords")}
          ruleDataTableHeading={t("todoList")}
          addRuleDataTableHeading={t("availableTodo")}
          bShowRuleData={true}
          openProcessType={props.openProcessType}
          isReadOnly={isReadOnly}
        />
      );
    } else if (props.screenType === SCREENTYPE_EXCEPTION) {
      return (
        <Rules
          ruleType={props.ruleType}
          ruleDataType={props.ruleDataType}
          interfaceRules={props.exceptionAllRules}
          setInterfaceRules={props.setExceptionAllRules}
          ruleDataTableStatement={t("exceptionRemoveRecords")}
          addRuleDataTableStatement={t("exceptionAddRecords")}
          ruleDataTableHeading={t("exceptionList")}
          addRuleDataTableHeading={t("availableException")}
          bShowRuleData={true}
          openProcessType={props.openProcessType}
          isReadOnly={isReadOnly}
        />
      );
    }
  };

  return (
    <div className="relative" style={{ direction: direction }}>
      <div
        className="DocTypes"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          height: `calc(${windowInnerHeight}px - ${headerHeight})`,
        }}
      >
        <div className="oneDocDiv">
          <div className="docNameDiv" role="tablist">
            <p
              onClick={(e) => tabChangeHandler(e, "screenHeading")}
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  tabChangeHandler(e, "screenHeading");
                  e.stopPropagation();
                }
              }}
              style={{
                margin:
                  direction !== RTL_DIRECTION ? "0 0.5vw 0 0" : "0 0 0 0.5vw",
                padding: "1px 0.5vw",
              }}
              id={`pmweb_commonInterface_${props.screenHeading}`}
              className={
                selectedTab === "screenHeading"
                  ? "selectedBottomBorder screenHeading"
                  : "screenHeading"
              }
              role="tab"
              aria-selected={selectedTab === "screenHeading"}
            >
              {props.screenHeading}
            </p>
            <p
              onClick={(e) => tabChangeHandler(e, "rules")}
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  tabChangeHandler(e, "rules");
                  e.stopPropagation();
                }
              }}
              className={
                selectedTab === "rules" ? "selectedBottomBorder Rules" : "Rules"
              }
              style={{
                padding: "1px 1vw",
              }}
              id={`pmweb_commonInterface_rules`}
              role="tab"
              aria-selected={selectedTab === "rules"}
            >
              {t("rules")}
            </p>
          </div>
          {selectedTab === "screenHeading" ? (
            <React.Fragment>
              <div
                className="docSearchDiv"
                style={{
                  // modified on 30/10/23 for BugId 139819
                  // marginBottom: "0.45rem",
                  marginBottom:
                    props.screenType === SCREENTYPE_TODO ? "0.3rem" : "0.4rem",
                  // till here BugId 139819
                  marginTop: "0.75rem",
                }}
              >
                <div
                  className="searchBarNFilterInterface"
                  style={{ width: "100%" }}
                >
                  <div className="docSearchBar" style={{ flex: "2.5" }}>
                    <SearchProject
                      id="pmweb_listSearch"
                      title={"CommonInterface"}
                      onSearchChange={props.onSearchChange}
                      clearSearchResult={props.clearSearchResult}
                      setSearchTerm={props.setSearchTerm}
                      placeholder={t("search")}
                      width="100%"
                      ariaDescription={`${
                        props.ruleType === "E"
                          ? "Exception"
                          : props.ruleType === "D"
                          ? "Documents"
                          : "To Do List"
                      }`}
                    />
                  </div>
                  {isReadOnly || props.openProcessType !== "L" ? null : (
                    <p
                      className="addGroupButton"
                      style={{ flex: "1" }}
                      onClick={props.handleOpen}
                      id="pmweb_CommonInterface_addGroup"
                      tabIndex={0}
                      onKeyUp={props.onKeyUp}
                    >
                      {t("addGroupButton")}
                    </p>
                  )}
                  <Modal
                    open={props.addGroupModal}
                    aria-label="Add Group"
                    aria-description="Adds the group"
                  >
                    <AddGroup
                      newGroupToMove={props.newGroupToMove}
                      addGroupToList={props.addGroupToList}
                      handleClose={props.handleClose}
                      bGroupExists={props.bGroupExists}
                      setbGroupExists={props.setbGroupExists}
                      groupName={props.groupName}
                      setGroupName={props.setGroupName}
                      groupsList={props.groupsList}
                      showGroupNameError={props.showGroupNameError}
                    />
                  </Modal>
                </div>
              </div>
              {props.GetList()}
            </React.Fragment>
          ) : null}
        </div>

        {selectedTab == "screenHeading" ? (
          <div className="activitySideDiv">
            <div className="activityHeadingDiv" style={{ width: "100%" }}>
              <p className="activitySideHeading" style={{ flex: "1" }}>
                {t("rightsOnActivities")}
              </p>
              <div className="actvitySearchDiv">
                <SearchProject
                  onSearchChange={props.onActivitySearchChange}
                  clearSearchResult={props.clearActivitySearchResult}
                  setSearchTerm={props.setActivitySearchTerm}
                  placeholder={t("search")}
                  width="100%"
                  id="activitySearch"
                  title={"acitivitySearch"}
                  ariaDescription="Activities"
                />
              </div>
            </div>
            <div className="oneBox" id="oneBoxMatrix">
              {/**code added for bugid 138347 */}

              <div style={{ display: "flex", minWidth: "101%" }}>
                {props.GetActivities()}
              </div>
            </div>
          </div>
        ) : (
          <React.Fragment>{rulesTab()}</React.Fragment>
        )}
      </div>
    </div>
  );
}

export default CommonInterface;
