import React, { useEffect, useState } from "react";
import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import secureLocalStorage from "react-secure-storage";

function AddUserGroup(props) {
  let { t } = useTranslation();
  const [userGroupData, setUserGroupData] = useState([]);
  const actProperty = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(actProperty);
  const locale = secureLocalStorage.getItem("locale");
  const direction = `${t("HTML_DIR")}`;

  const saveChangeHandler = () => {
    props.getUserGroupList(userGroupData);
    props.closeModal();
    setUserGroupData([]);
  };

  const getInitialSelectedUsersGroups = () => {
    let users = [];
    let groups = [];
    Object.values(
      localLoadedActivityPropertyData.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTasks?.taskMap
    ).forEach((task) => {
      if (task.taskTypeInfo.taskId == props.taskInfo.taskId) {
        task.m_arrUGInfoList.forEach((arr) => {
          if (arr.m_strType === "U") {
            users.push({ id: arr.m_strID, name: arr.m_strName });
          } else groups.push({ id: arr.m_strID, name: arr.m_strName });
        });
      }
    });

    return { selectedUsers: users, selectedGroups: groups };
  };

  const groupUserHandler = (val) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    let userDataList = [];
    let groupDataList = [];

    Object.values(
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
    ).forEach((task, i) => {
      if (+task.taskTypeInfo.taskId === +props.taskInfo.taskId) {
        val?.selectedUsers?.forEach((user, j) => {
          let tempArr = task?.m_arrUGInfoList?.filter(
            (d) => d?.m_strID === user?.id
          );
          if (tempArr?.length > 0) {
            userDataList.push({
              m_strID: user.id,
              m_strType: user.type,
              m_strName: user.name,
              esRuleList: tempArr[0]?.esRuleList,
            });
          } else {
            userDataList.push({
              m_strID: user.id,
              m_strType: user.type,
              m_strName: user.name,
            });
          }

          const unique = [
            ...new Map(
              userDataList.map((item) => [item.m_strID, item])
            ).values(),
          ];
          userDataList = [...unique];
        });
        val.selectedGroups.forEach((group) => {
          let tempArr = task?.m_arrUGInfoList?.filter(
            (d) => d?.m_strID === group?.id
          );
          if (tempArr?.length > 0) {
            groupDataList.push({
              m_strID: group.id,
              m_strType: group.type,
              m_strName: group.name,
              esRuleList: tempArr[0]?.esRuleList,
            });
          } else {
            groupDataList.push({
              m_strID: group.id,
              m_strType: group.type,
              m_strName: group.name,
            });
          }

          const unique = [
            ...new Map(
              groupDataList.map((item) => [item.m_strID, item])
            ).values(),
          ];
          groupDataList = [...unique];
        });
      }
    });
    setUserGroupData([...userDataList, ...groupDataList]);
  };

  const pickListHandler = () => {
    let microProps = {
      data: {
        initialSelected: getInitialSelectedUsersGroups(),
        onSelection: (val) => groupUserHandler(val),
        token: JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token,
        ext: true,
        customStyle: {
          // selectedTableMinWidth: "50%", // selected user and group listing width
          listTableMinWidth: "50%", // user/ group listing width
          listHeight: "15rem", // custom height common for selected listing and user/group listing
          showUserFilter: true, // true for showing user filter, false for hiding
          showExpertiseDropDown: true, // true for showing expertise dropdown, false for hiding
          showGroupFilter: true, // true for showing group filter, false for hiding
          // ORM changes for modal styling issue
          selectedTableMargin: 0,
          selectedTableMinWidth: "calc(50% - 0.5rem)",
          listTableMargin: "0 !important",
          //till here
        },
      },
      locale: locale ? locale : "en_US",
      direction: direction,
      ContainerId: "usergroupDiv",
      Module: "ORM",
      Component: "UserGroupPicklistMF",
      InFrame: false,
      Renderer: "renderUserGroupPicklistMF",
    };
    window.loadUserGroupMF(microProps);
  };

  useEffect(() => {
    pickListHandler();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Open Sans",
      }}
    >
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #D3D3D3",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1vw",
          height: "10%",
        }}
      >
        <p
          style={{
            fontSize: "var(--subtitle_text_font_size)",
            fontWeight: "600",
          }}
        >
          {t("associateUserGroup")}
        </p>
      </div>
      {/* code added on 17-10-23 added overflow property for scroller bugId: 134642, 137472, 138107, 138113, 138216  */}
      <div
        style={{
          width: "100%",
          height: "80%",
          overflow: "auto",
          padding: "0 10px",
        }}
        id="usergroupDiv"
      >
        {" "}
        {/* <MicroFrontendContainer
          styles={{
            width: "100%",
            height: "50vh",
            paddingInline: "10px",
            // background: "red",
          }}
          containerId="rdDIv"
          microAppsJSON={microAppsJSON}
          domainUrl=""
          //ProcessDefId={localLoadedProcessData.ProcessDefId}
        /> */}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          height: "10%",
          width: direction === "rtl" ? "68.7vw" : "",
        }}
      >
        <Button
          variant="contained"
          style={{ marginInline: "0.3rem" }}
          color="primary"
          onClick={saveChangeHandler}
          id="pmweb_AddUserGroup_SaveChanges_button"
        >
          {t("save")} {t("changes")}
        </Button>
        <Button
          variant="contained"
          onClick={props.closeModal}
          style={{ marginInline: "0.3rem" }}
          id="pmweb_AddUserGroup_discard_button"
        >
          {t("discard")}
        </Button>
      </div>
      {/* <div
        style={{
          width: "100%",
          height: "3rem",
          display: "flex",
          flexDirection: "row-reverse",
          padding: "0.5rem",
          background: "red",
        }}
      >
        <Button variant="contained" style={{ marginInline: "0.6rem" }}>
          Discard
        </Button>
        <Button variant="contained" color="primary">
          Save Changes
        </Button>
      </div> */}
    </div>
  );
}

export default AddUserGroup;
