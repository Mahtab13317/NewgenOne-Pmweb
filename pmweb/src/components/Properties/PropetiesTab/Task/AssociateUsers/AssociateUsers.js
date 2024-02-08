import React, { useEffect, useState } from "react";
import classes from "../Task.module.css";
import Modal from "../../../../../UI/Modal/Modal";
import AddUserGroup from "./AddUserGroup";
import { connect, useDispatch, useSelector } from "react-redux";
import RedDelete from "../../../../../assets/abstractView/RedDelete.svg";
import Search from "../../../../../UI/Search Component/index";
import { store, useGlobalState } from "state-pool";
import { useTranslation } from "react-i18next";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  RTL_DIRECTION,
  SPACE,
  headerHeight,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import Users from "../../../../../assets/users.svg";
import {
  containsText,
  getLogicalOperatorReverse,
  shortenRuleStatement,
} from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { Checkbox } from "@material-ui/core";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import FilterPopup from "./FilterPopup";
import styles from "./index.module.css";
import { EditIcon } from "../../../../../utility/AllImages/AllImages";
import GroupIcon from "../../../../../assets/icons/group_circle.svg";
import { getConditionalOperator } from "../../ActivityRules/CommonFunctionCall";
import { convertToArabicDate } from "../../../../../UI/DatePicker/DateInternalization";

function AssociateUsers({ taskInfo, isReadOnly, ...props }) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const [openAddUserModal, setopenAddUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const actProperty = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(actProperty);
  const [checked, setChecked] = useState({});
  const [filterBtnDisable, setFilterBtnDisable] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filterObject, setFilterObject] = useState(null);
  const [filterKey, setFilterKey] = useState(null);
  const [userFilterList, setUserFilterList] = useState([]);
  const [groupFilterList, setGroupFilterList] = useState([]);
  //useState for setting the filter criteria string in the associated user list table
  const [filterCriterea, setFilterCriterea] = useState("");
  const [disableAssociation, setDisabelAssociation] = useState(true);
    // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const filteredRows = taskInfo?.m_arrUGInfoList?.filter((arr) =>
    containsText(arr.m_strName, searchTerm)
  );

  const buildRuleStatement = (filterList) => {
    let ruleStatement = "";
    filterList?.forEach((element, i) => {
      const concatenatedString = ruleStatement.concat(
        SPACE,
        element.param1,
        SPACE,
        "is",
        SPACE,
        getConditionalOperator(element.operator),
        SPACE,
        // modified on 27/09/2023 for BugId 136677
        // element.param2,
        (element.datatype1 === "8" || element.datatype1 === "15") &&
          element.type2 === "C"
          ? convertToArabicDate(element.param2)
          : element.param2,
        // till here BugId 136677
        SPACE,
        element.logicalOp == "+" || element.logicalOp == "3"
          ? ""
          : getLogicalOperatorReverse(element.logicalOp)
      );
      ruleStatement = concatenatedString;
    });
    return ruleStatement;
  };

  useEffect(() => {
    let tempString = [];
    localLoadedProcessData?.Tasks.forEach((elem, i) => {
      if (elem?.TaskName === taskInfo?.taskTypeInfo?.taskName) {
        if (elem?.StrTaskType === "Generic") {
          setDisabelAssociation(false);
        } else {
          if (elem?.StrTaskType === "ProcessTask" && elem?.TaskMode !== "U") {
            setDisabelAssociation(true);
          } else {
            setDisabelAssociation(false);
          }
        }
      }
    });
    setUserFilterList(tempString);
  }, []);

  useEffect(() => {
    let checkObj = {};
    taskInfo?.m_arrUGInfoList?.forEach((el, i) => {
      checkObj = {
        ...checkObj,
        [`${el.m_strID}_${el.m_strName}_${el.m_strType}`]: false,
      };
    });
    setChecked(checkObj);
    let tempString = [];
    let tempGroupString = [];
    taskInfo?.m_arrUGInfoList?.forEach((el, i) => {
      if (el?.m_strType === "G") {
        if (el?.esRuleList?.length > 0) {
          tempGroupString.push(
            buildRuleStatement(el?.esRuleList[0]?.ruleCondList)
          );
        } else {
          tempGroupString.push("-");
        }
      } else {
        if (el?.esRuleList?.length > 0) {
          tempString.push(buildRuleStatement(el?.esRuleList[0]?.ruleCondList));
        } else {
          tempString.push("-");
        }
      }
    });
    setGroupFilterList(tempGroupString);
    setUserFilterList(tempString);
  }, [taskInfo?.m_arrUGInfoList]);

  const userGroupListHandler = (val) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
      taskInfo.taskTypeInfo.taskName
    ] = {
      ...temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
        taskInfo.taskTypeInfo.taskName
      ],
      m_arrUGInfoList: [...val],
    };
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };

  const closeHandler = () => {
    setopenAddUserModal(false);
    var elem = document.getElementById("workspacestudio_assetManifest");
    elem?.parentNode?.removeChild(elem);
  };

  const isAllChecked = (el) => {
    return checked[el] === true;
  };

  const deleteUserGroup = (id, type) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    Object.values(
      temp.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
    ).forEach((task) => {
      if (task.taskTypeInfo.taskId == taskInfo.taskTypeInfo.taskId) {
        temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
          taskInfo.taskTypeInfo.taskName
        ].m_arrUGInfoList = task.m_arrUGInfoList.filter(
          (usergroup) =>
            !(usergroup.m_strID === id && usergroup.m_strType === type)
        );
      }
    });
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };

  const handleUserCheckInList = (data, e) => {
    setChecked((prev) => {
      let temp = { ...prev };
      temp = {
        ...temp,
        [`${data.m_strID}_${data.m_strName}_${data.m_strType}`]:
          e.target.checked,
      };
      return temp;
    });
  };

  const handleSelectAll = (e) => {
    let checkObj = {};
    taskInfo?.m_arrUGInfoList?.forEach((el) => {
      checkObj = {
        ...checkObj,
        [`${el.m_strID}_${el.m_strName}_${el.m_strType}`]: e.target.checked,
      };
    });
    setChecked(checkObj);
  };

  const handleDeassociate = () => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    Object.values(
      temp.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
    ).forEach((task) => {
      if (+task.taskTypeInfo.taskId === +taskInfo.taskTypeInfo.taskId) {
        temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
          taskInfo.taskTypeInfo.taskName
        ].m_arrUGInfoList = task.m_arrUGInfoList.filter(
          (usergroup) =>
            !checked[
              `${usergroup.m_strID}_${usergroup.m_strName}_${usergroup.m_strType}`
            ]
        );
      }
    });
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };

  const userDisplay = (val) => {
    let name = val?.split(" ");
    let initials;

    if (name.length === 1) {
      initials = name[0].charAt(0);
    } else {
      initials = name[0].charAt(0) + "" + name[name.length - 1].charAt(0);
    }

    return initials;
  };

  useEffect(() => {
    let newCheckedObj = {};
    let tempFilterKey = null;
    Object.keys(checked)?.forEach((el) => {
      if (checked[el]) {
        newCheckedObj = { ...newCheckedObj, [el]: checked[el] };
        tempFilterKey = el;
      }
    });
    if (Object.keys(newCheckedObj)?.length === 1) {
      setFilterKey(tempFilterKey);
      setFilterBtnDisable(false);
    } else {
      setFilterBtnDisable(true);
    }
  }, [checked, userFilterList]);

  const showFilterFunc = (data, type, index) => {
    setShowFilter(true);
    if (data !== 0) {
      setFilterKey(data);
    }
    if (type === "G") {
      setFilterCriterea(groupFilterList[index]);
    } else {
      setFilterCriterea(userFilterList[index]);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        fontFamily: "var(--font_family)",
        padding: "1rem 1vw",
        direction: direction,
      }}
    >
      {!taskInfo?.m_arrUGInfoList || taskInfo?.m_arrUGInfoList?.length === 0 ? (
        <div className={classes.emptyStateMainDiv}>
          <img
            className={classes.emptyStateImage}
            src={Users}
            alt={t("noUserAssociated")}
            style={{
              marginTop: "6rem",
              marginBottom: "0",
            }}
          />
          <p
            className={classes.emptyStateText}
            style={{ marginBottom: "0.5rem", marginTop: "0" }}
          >
            {t("noUserAssociated")}
          </p>
          {!isReadOnly && (
            <button
              style={{
                border: "1px solid var(--button_color)",
                color: "var(--button_color)",
                background: "white",
                fontFamily: "var(--font_family)",
                cursor: "pointer",
              }}
              onClick={() => setopenAddUserModal(true)}
              id="pmweb_AssociateUsers_associateUsers_Groups_button"
              disabled={disableAssociation}
            >
              <p
                style={{
                  fontWeight: "600",
                  fontSize: "var(--base_text_font_size)",
                }}
              >
                {disableAssociation ? (
                  <LightTooltip
                    arrow={true}
                    enterDelay={500}
                    placement="bottom"
                    title={t("msgProcessTask")}
                  >
                    <span>{t("AssociateUsers/Groups")}</span>
                  </LightTooltip>
                ) : (
                  t("AssociateUsers/Groups")
                )}
              </p>
            </button>
          )}
        </div>
      ) : null}

      {/* Bug 122253 - Case Workdesk issues
      [30-03-2023] Provided a overlay for the modal */}
      {openAddUserModal ? (
        <Modal
          show={openAddUserModal}
          //backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            width: "70%",
            //top:"28%" code modified on 26-09-2023 for bugId: 138219
            top: "20%",
            height: "34rem",
            left: "18%",
            padding: "0",
            boxShadow: "none",
          }}
          children={
            <AddUserGroup
              taskInfo={taskInfo.taskTypeInfo}
              getUserGroupList={(val) => userGroupListHandler(val)}
              closeModal={() => closeHandler()}
            />
          }
        />
      ) : null}

      {taskInfo?.m_arrUGInfoList?.length > 0 ? (
        <div
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "2vw",
            }}
          >
            <Search
              placeholder={t("Search Users or Groups")}
              width="21vw"
              onSearchChange={(val) => setSearchTerm(val)}
              clearSearchResult={() => setSearchTerm("")}
            />

            {!isReadOnly && (
              <button
                style={{
                  border: "1px solid var(--button_color)",
                  color: "var(--button_color)",
                  background: "white",
                  fontFamily: "var(--font_family)",
                  cursor: "pointer",
                }}
                onClick={() => setopenAddUserModal(true)}
                id="pmweb_Associate_Associateusersgroup_button"
              >
                <p
                  style={{
                    fontWeight: "600",
                    fontSize: "var(--base_text_font_size)",
                  }}
                >
                  {t("AssociateUsers/Groups")}
                </p>
              </button>
            )}
          </div>
          <p
            style={{
              fontWeight: "600",
              fontSize: "var(--base_text_font_size)",
              marginBlock: "1rem",
            }}
          >
            {
              taskInfo.m_arrUGInfoList.filter((arr) => arr.m_strType === "U")
                .length
            }{" "}
            {t("user(s)and")}{" "}
            {
              taskInfo.m_arrUGInfoList.filter((arr) => arr.m_strType === "G")
                .length
            }{" "}
            {t("group(s)associated")}
          </p>
          <div className={styles.associatedHeaderContainer}>
            <div
              style={
                {
                  // display: "flex",
                  // flexDirection: "row",
                  // width: "32rem",
                  //  alignItems: "center",
                }
              }
              className={styles.selectedAll}
            >
              <p
                className={classes.tableCellText}
                style={{
                  fontWeight: "500",
                  fontSize: "var(--base_text_font_size)",
                }}
              >
                <span>
                  <Checkbox
                    checked={
                      Object.keys(checked)?.length > 0 &&
                      Object.keys(checked)?.every(isAllChecked)
                        ? true
                        : false
                    }
                    onChange={(e) => handleSelectAll(e)}
                    id="pmweb_AssociateUsers_selectuser_checkbox"
                    style={
                      {
                        // margin: "0px 2vw 0 1vw", padding: "0px"
                      }
                    }
                    disabled={isReadOnly}
                  />
                </span>
                <span>{t("selectUser")}</span>
              </p>
            </div>
            <div
              style={
                {
                  // display: "flex",
                  // flexDirection: "row",
                  // width: "50%",
                  // justifyContent: "left",
                  // marginLeft: "1vw",
                }
              }
              className={styles.filterCritereaHead}
            >
              <div style={{ minWidth: "100px", textAlign: "start" }}>
                <p
                  className={classes.tableCellText}
                  style={{
                    fontWeight: "500",
                    fontSize: "var(--base_text_font_size)",
                  }}
                >
                  {t("filter")} {t("criteria")}
                </p>
              </div>
            </div>
            <div className={styles.filterContainer}>
              <button
                className={
                  !filterBtnDisable
                    ? classes.okButton
                    : classes.filterBtnDisable
                }
                disabled={!filterBtnDisable ? false : true}
                onClick={() => {
                  showFilterFunc(0);
                }}
                id="pmweb_AssociateUsers_filter_button"
              >
                {t("filter")}
              </button>
              <button
                disabled={
                  Object.values(checked).filter((d) => d == true).length > 0
                    ? false
                    : true
                }
                className={classes.cancelButton}
                onClick={() => handleDeassociate()}
                id="pmweb_AssociateUsers_deassociate_button"
              >
                {t("deassociate")}
              </button>
            </div>
          </div>

          <div
            className={styles.associateListContainer}
            style={{
              height: `calc((${windowInnerHeight}px - ${headerHeight}) - 25rem)`,
            }}
          >
            {filteredRows
              ?.filter((arr) => arr.m_strType === "U")
              ?.map((user, i) => {
                return (
                  <div className={styles.associatedList}>
                    <div
                      style={
                        {
                          // display: "flex",
                          // flexDirection: "row",
                          // width: "32rem",
                          //  alignItems: "center",
                        }
                      }
                      className={styles.selectedUser}
                    >
                      <div style={{ width: "5%" }}>
                        <span>
                          <Checkbox
                            checked={
                              checked[
                                `${user.m_strID}_${user.m_strName}_${user.m_strType}`
                              ]
                                ? true
                                : false
                            }
                            onChange={(e) => handleUserCheckInList(user, e)}
                            id={`pmweb_AssociateUsers_usercheckInList_checkbox${i}`}
                            style={
                              {
                                //margin: "0px 2vw 0 1vw", padding: "0px"
                              }
                            }
                            disabled={isReadOnly}
                          />
                        </span>
                      </div>
                      <div style={{ width: "5%" }}>
                        <div className={styles.userIcon}>
                          {" "}
                          {userDisplay(user?.m_strName?.toUpperCase())}
                        </div>
                      </div>
                      <div style={{ width: "75%" }}>
                        <p
                          className={classes.tableCellText}
                          style={{
                            fontWeight: "500",
                            fontSize: "var(--base_text_font_size)",
                          }}
                        >
                          <span>
                            <LightTooltip
                              arrow={true}
                              enterDelay={500}
                              placement="bottom"
                              title={user.m_strName || ""}
                            >
                              <span>
                                {shortenRuleStatement(user.m_strName, 30)}
                              </span>
                            </LightTooltip>
                          </span>
                        </p>
                      </div>
                    </div>
                    <div
                      style={
                        {
                          // display: "flex",
                          // flexDirection: "row",
                          // width: "50%",
                          // justifyContent: "left",
                          // marginLeft: "1vw",
                        }
                      }
                      className={styles.filterCriterea}
                    >
                      <div style={{ minWidth: "100px", textAlign: "start" }}>
                        <p
                          className={classes.tableCellText}
                          style={{
                            fontWeight: "500",
                            fontSize: "var(--base_text_font_size)",
                          }}
                        >
                          {userFilterList[i]?.length > 0 ? (
                            <LightTooltip
                              arrow={true}
                              enterDelay={500}
                              placement="bottom"
                              title={userFilterList[i] || ""}
                            >
                              <span>
                                {shortenRuleStatement(userFilterList[i], 100)}
                              </span>
                            </LightTooltip>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={styles.action}>
                      {isReadOnly ? null : (
                        <LightTooltip
                          arrow={true}
                          enterDelay={500}
                          placement="bottom"
                          title={"Edit Filter"}
                        >
                          <EditIcon
                            style={{
                              color: "grey",
                              height: "1.25rem",
                              width: "1.25rem",
                              cursor: "pointer",
                              marginRight: "0.25rem",
                              transform:
                                direction === RTL_DIRECTION
                                  ? "scaleX(-1)"
                                  : null,
                            }}
                            id={`pmweb_AssociateUsers_Editfilter_EditIcon${i}`}
                            onClick={() => {
                              showFilterFunc(
                                `${user.m_strID}_${user.m_strName}_${user.m_strType}`,
                                user.m_strType,
                                i
                              );
                            }}
                          />
                        </LightTooltip>
                      )}

                      {Object.keys(checked)?.length > 0 &&
                        !Object.values(checked)?.includes(true) &&
                        !isReadOnly && (
                          <>
                            <LightTooltip
                              arrow={true}
                              enterDelay={500}
                              placement="bottom"
                              title={"De-Associate"}
                            >
                              <img
                                src={RedDelete}
                                style={{
                                  cursor: "pointer",
                                  marginInlineStart: "0.25rem",
                                }}
                                alt="del"
                                onClick={() =>
                                  deleteUserGroup(user.m_strID, user.m_strType)
                                }
                                id={`pmweb_AssociateUsers_deleteusergroup_img${i}`}
                              />
                            </LightTooltip>

                            {/*  <DeleteOutline
                              onClick={() =>
                                deleteUserGroup(user.m_strID, user.m_strType)
                              }
                              style={{
                                color: "grey",
                                height: "1.25rem",
                                width: "1.25rem",
                                cursor: "pointer",
                              }}
                            /> */}
                          </>
                        )}
                    </div>
                  </div>
                );
              })}
            {filteredRows
              ?.filter((arr) => arr.m_strType === "G")
              ?.map((group, i) => {
                return (
                  <div className={styles.associatedList}>
                    <div
                      style={
                        {
                          // display: "flex",
                          // flexDirection: "row",
                          // width: "32rem",
                          //  alignItems: "center",
                        }
                      }
                      className={styles.selectedUser}
                    >
                      <div style={{ width: "5%" }}>
                        <span>
                          <Checkbox
                            checked={
                              checked[
                                `${group.m_strID}_${group.m_strName}_${group.m_strType}`
                              ]
                                ? true
                                : false
                            }
                            onChange={(e) => handleUserCheckInList(group, e)}
                            style={{ marginRight: "2vw", padding: "0px" }}
                            disabled={isReadOnly}
                            id={`pmweb_AssociateUsers_filteredUserCheck_checkbox${i}`}
                          />
                        </span>
                      </div>
                      <div style={{ width: "5%" }}>
                        <span>
                          <img src={GroupIcon} alt="Group" />
                        </span>
                      </div>
                      <div style={{ width: "75%" }}>
                        <p
                          className={classes.tableCellText}
                          style={{
                            fontWeight: "500",
                            fontSize: "var(--base_text_font_size)",
                          }}
                        >
                          <span>
                            <LightTooltip
                              arrow={true}
                              enterDelay={500}
                              placement="bottom"
                              title={group.m_strName || ""}
                            >
                              <span>
                                {shortenRuleStatement(group.m_strName, 30)}
                              </span>
                            </LightTooltip>
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className={styles.filterCriterea}>
                      <div style={{ minWidth: "100px", textAlign: "start" }}>
                        <p
                          className={classes.tableCellText}
                          style={{
                            fontWeight: "500",
                            fontSize: "var(--base_text_font_size)",
                          }}
                        >
                          {groupFilterList[i]?.length > 0 ? (
                            <LightTooltip
                              arrow={true}
                              enterDelay={500}
                              placement="bottom"
                              title={groupFilterList[i] || ""}
                            >
                              <span>
                                {shortenRuleStatement(groupFilterList[i], 100)}
                              </span>
                            </LightTooltip>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className={styles.action}>
                      {isReadOnly ? null : (
                        <LightTooltip
                          arrow={true}
                          enterDelay={500}
                          placement="bottom"
                          title={"Edit Filter"}
                        >
                          <EditIcon
                            style={{
                              color: "grey",
                              height: "1.25rem",
                              width: "1.25rem",
                              cursor: "pointer",
                              marginRight: "0.25rem",
                              transform:
                                direction === RTL_DIRECTION
                                  ? "scaleX(-1)"
                                  : null,
                            }}
                            id={`pmweb_AssociateUsers_filteredEditIcon_EditIcon_${i}`}
                            onClick={() => {
                              showFilterFunc(
                                `${group.m_strID}_${group.m_strName}_${group.m_strType}`,
                                group.m_strType,
                                i
                              );
                            }}
                          />
                        </LightTooltip>
                      )}

                      {Object.keys(checked)?.length > 0 &&
                        !Object.values(checked)?.includes(true) &&
                        !isReadOnly && (
                          <img
                            src={RedDelete}
                            style={{
                              cursor: "pointer",
                              marginInlineStart: "0.25rem",
                            }}
                            alt="del"
                            onClick={() =>
                              deleteUserGroup(group.m_strID, group.m_strType)
                            }
                            id={`pmweb_AssociateUsers_deleteFilteredUserGroup_img${i}`}
                          />
                        )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}

      {showFilter ? (
        <Modal
          show={showFilter}
          //backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            width: "75%",
            left: "12%",
            top: "21.5%",
            padding: "0px",
          }}
          children={
            <FilterPopup
              showFilter={showFilter}
              setShowFilter={setShowFilter}
              filterObject={filterObject}
              setFilterObject={setFilterObject}
              filterKey={filterKey}
              userFilterList={userFilterList}
              setUserFilterList={setUserFilterList}
              groupFilterList={groupFilterList}
              setGroupFilterList={setGroupFilterList}
              taskInfo={taskInfo}
              filterCriterea={filterCriterea}
            />
          }
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(AssociateUsers);
