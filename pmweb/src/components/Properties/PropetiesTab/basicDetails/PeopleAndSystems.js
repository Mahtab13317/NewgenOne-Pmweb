//Changes made to solve Bug 126385 -activity property>>save and cancel is not appearing after selecting people and systems
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TextField from "@material-ui/core/TextField";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { store, useGlobalState } from "state-pool";
import { useDispatch } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { propertiesLabel } from "../../../../Constants/appConstants";
import ModalUsingCSS from "../../../ViewsForms/ModalUsingCSS/ModalUsingCSS";
import secureLocalStorage from "react-secure-storage";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((props) => ({
  input: {
    height: "var(--line_height)",
  },
  inputWithError: {
    height: "var(--line_height)",
    width: "4.875rem",
  },
  errorStatement: {
    color: "red",
    fontSize: "11px",
  },
  mainDiv: {
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font_family)",
    width: "100%",
    direction: props.direction,
  },
  mainHeadDiv: {
    overflowY: "auto",
    overflowX: "hidden",
    height: "66vh",
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
      borderRadius: "0.313rem",
    },

    "&:hover::-webkit-scrollbar": {
      overflowY: "visible",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box",
      borderRadius: "0.313rem",
    },
    scrollbarColor: "#8c8c8c #fafafa",
    scrollbarWidth: "thin",
  },
  GroupTitle: {
    fontWeight: "bold",
    color: "#606060",
    fontSize: "var(--subtitle_text_font_size)",
  },
  btnIcon: {
    cursor: "pointer",
    height: "1.5rem",
    width: "1.5rem",
  },
  dotBtnIcon: {
    cursor: "pointer",
    height: "var(--line_height)",
    width: "var(--line_height)",
    border: "1px solid #CECECE",
    backgroundColor: "#fff !important",
    borderRadius: "2px",
    marginTop: "1rem",
    padding: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  addAdvisorBtnIcon: {
    cursor: "pointer",
    height: "var(--line_height)",
    width: "var(--line_height)",
    border: "1px solid var(--button_color)",
    backgroundColor: "var(--button_color) !important",
    color: "#FFFFFF !important",
    borderRadius: "2px",
    marginTop: "1rem",
    padding: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: {
    color: "#FFFFFF",
    fontSize: "var(--title_text_font_size)",
    fontWeight: "600",
  },
  fontSize: {
    fontSize: "var(--base_text_font_size)",
    fontWeight: 600,
  },
  deleteIcon: {
    width: "1.25rem",
    height: "1.25rem",
    cursor: "pointer",
  },
  clearIcon: {
    width: "1.7rem",
    height: "1.7rem",
    cursor: "pointer",
    color: "rgb(0,0,0,0.5) !important",
  },
  advisorList: {
    border: "1px solid #cecece",
    margin: "0 0 0 0.5vw",
    padding: "0.25rem 0 !important",
    maxHeight: "36vh",
    width: "61%",
    overflow: "auto",
  },
  CheckBoxIcon: {
    color: "var(--checkbox_color)",
    "& .MuiSvgIcon-root": {
      width: "1.5rem !important",
      height: "1.5rem !important",
    },
  },
  icon: {
    height: "16px",
    width: "16px",
    fontSize: "12px",
  },
  iconButton: {
    height: "fit-content !important",
    padding: "0px !important",
    margin: "0px !important",
  },
}));

const PeopleAndSystems = (props) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const ref = React.useRef(null);
  const [open, setopen] = useState(false);
  const loadedActivityPropertyData = store.getState("activityPropertyData"); //current processdata clicked
  const localProcessData = store.getState("loadedProcessData");
  const [userGroupListData, setuserGroupListData] = useState({});
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [localLoadedProcessData] = useGlobalState(localProcessData);
  const locale = secureLocalStorage.getItem("locale");
  const [peopleAndSystemsArray, setpeopleAndSystemsArray] = useState([
    {
      //Added label key for adding translation keys for for Labels in poeple and systems
      label: t("owner"),
      type: "Owner",
      names: [{ id: "", name: "" }],
    },
    {
      label: t("consultant"),
      type: "Consultant",
      names: [{ id: "", name: "" }],
    },
    {
      label: t("system"),
      type: "System",
      names: [{ id: "", name: "" }],
    },
    {
      label: t("provider"),
      type: "Provider",
      names: [{ id: "", name: "" }],
    },
    {
      label: t("consumer"),
      type: "Consumer",
      names: [{ id: "", name: "" }],
    },
  ]);
  const [typeToOpen, settypeToOpen] = useState(); //which type of field to open picklist in
  const [openUserGroupMF, setopenUserGroupMF] = useState(false);
  const classes = useStyles({ ...props, direction });

  useEffect(() => {
    updatePeopleAndSystems(localLoadedActivityPropertyData);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setopen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const updatePeopleAndSystems = (actData) => {
    let temp = [
      //Added label key for adding translation keys for for Labels in poeple and systems
      {
        label: t("owner"),
        type: "Owner",
        names:
          actData.ActivityProperty.actGenPropInfo.genPropInfo.ownerList
            .length !== 0
            ? actData.ActivityProperty.actGenPropInfo.genPropInfo.ownerList.map(
                (item) => {
                  return {
                    id: item.orderID,
                    name: item.ownerName,
                  };
                }
              )
            : [{ id: "", name: "" }],
      },
      {
        label: t("consultant"),
        type: "Consultant",
        names:
          actData.ActivityProperty.actGenPropInfo.genPropInfo.consultantList
            .length !== 0
            ? actData.ActivityProperty.actGenPropInfo.genPropInfo.consultantList.map(
                (item) => {
                  return {
                    id: item.orderID,
                    name: item.consultantName,
                  };
                }
              )
            : [{ id: "", name: "" }],
      },
      {
        label: t("system"),
        type: "System",
        names:
          actData.ActivityProperty.actGenPropInfo.genPropInfo.systemList
            .length !== 0
            ? actData.ActivityProperty.actGenPropInfo.genPropInfo.systemList.map(
                (item) => {
                  return {
                    id: item.orderID,
                    name: item.sysName,
                  };
                }
              )
            : [{ id: "", name: "" }],
      },
      {
        label: t("provider"),
        type: "Provider",
        names:
          actData.ActivityProperty.actGenPropInfo.genPropInfo.providerList
            .length !== 0
            ? actData.ActivityProperty.actGenPropInfo.genPropInfo.providerList.map(
                (item) => {
                  return {
                    id: item.orderID,
                    name: item.providerName,
                  };
                }
              )
            : [{ id: "", name: "" }],
      },
      {
        label: t("consumer"),
        type: "Consumer",
        names:
          actData.ActivityProperty.actGenPropInfo.genPropInfo.consumerList
            .length !== 0
            ? actData.ActivityProperty.actGenPropInfo.genPropInfo.consumerList.map(
                (item) => {
                  return {
                    id: item.orderID,
                    name: item.consumerName,
                  };
                }
              )
            : [{ id: "", name: "" }],
      },
    ];

    setpeopleAndSystemsArray(temp);
  };

  const addField = (data) => {
    let temp = [...peopleAndSystemsArray];
    temp.forEach((item) => {
      if (item.type === data.type) {
        item.names.push({ id: "", name: "" });
      }
    });
    setpeopleAndSystemsArray(temp);
  };

  const deleteField = (data, deleteId, index) => {
    let temp = [...peopleAndSystemsArray];
    temp.forEach((item) => {
      if (item.type === data.type) {
        item.names.splice(index, 1);
      }
    });
    setpeopleAndSystemsArray(temp);
    updateActivityPropertyData("delete", data.type, deleteId);
  };

  const clearField = (data, index) => {
    let temp = [...peopleAndSystemsArray];
    temp.forEach((item) => {
      if (item.type === data.type) {
        item.names[index].name = "";
      }
    });
    setpeopleAndSystemsArray(temp);
  };

  const getUserGroupList = (data, type) => {
    setuserGroupListData(data);
    // let temp = global.structuredClone(localLoadedActivityPropertyData);
    //Modified on 24/05/2023, bug_id:127652
    /* temp.ActivityProperty.actGenPropInfo.genPropInfo[
        `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
      ] = []; */
    /* temp.ActivityProperty.actGenPropInfo.genPropInfo[
        `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
      ].push({
        [`${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`]: "",
        [`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`]: "",
      });*/
    /* if (type === "Owner" || type === "Consultant") {

      data?.selectedUsers?.forEach((user) => {
        temp.ActivityProperty.actGenPropInfo.genPropInfo[
          `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
        ].push({
          [`${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`]:
            user.name,
          [`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`]: user.id,
          bRenderPlus: false,
        });
        const unique = [
          ...new Map(
            temp.ActivityProperty.actGenPropInfo.genPropInfo[
              `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
            ].map((item) => [
              item[`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`],
              item,
            ])
          ).values(),
        ];
        temp.ActivityProperty.actGenPropInfo.genPropInfo[
          `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
        ].names = unique;
      });
    } else if (type === "System") {
      data.selectedUsers.forEach((user) => {
        temp.ActivityProperty.actGenPropInfo.genPropInfo.systemList.push({
          sysName: user.name,
          orderId: user.id,
          bRenderPlus: false,
        });
      });
    } else {
      data.selectedUsers.forEach((user) => {
        temp.ActivityProperty.actGenPropInfo.genPropInfo[
          `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
        ].push({
          [`${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`]:
            user.name,
          orderId: user.id,
          bRenderPlus: false,
        });
      });
    }*/
    // let temp2 = global.structuredClone(peopleAndSystemsArray);

    /*  temp2.forEach((_var) => {
      if (_var.type === type) {
        _var.names = [];
        temp.ActivityProperty.actGenPropInfo.genPropInfo[
          `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
        ].forEach((people) => {
          _var.names = _var.names.filter((name) => name.id !== "");
          _var.names.push({
            id: people[
              `${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`
            ],
            name: people[
              `${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`
            ],
          });
          const unique = [
            ...new Map(_var.names.map((item) => [item.id, item])).values(),
          ];
          _var.names = unique;
        });
      }
    });*/

    // setpeopleAndSystemsArray(temp2);
    // setlocalLoadedActivityPropertyData(temp);
    /* dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );*/
  };

  const getSelectedUsers = (type) => {
    let selectedUsers = [];
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    temp.ActivityProperty.actGenPropInfo.genPropInfo[
      `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
    ].forEach((people) => {
      if (people[`${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`]) {
        selectedUsers.push({
          id: people[`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`],
          name: people[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`
          ],
        });
      }
    });
    return { selectedUsers: selectedUsers };
  };

  const pickListHandler = (event, data, itemName) => {
    settypeToOpen(data.type);
    setopenUserGroupMF(true);

    let microProps = {
      data: {
        initialSelected: getSelectedUsers(data.type),
        onSelection: (list) => getUserGroupList(list, data.type),
        token: JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token,
        ext: true,
        customStyle: {
          selectedTableMinWidth: "50%", // selected user and group listing width
          listTableMinWidth: "50%", // user/ group listing width
          listHeight: "16rem", // custom height common for selected listing and user/group listing
          showUserFilter: true, // true for showing user filter, false for hiding
          showExpertiseDropDown: true, // true for showing expertise dropdown, false for hiding
          showGroupFilter: false, // true for showing group filter, false for hiding
          // ORM changes for modal styling issue for bug: 138107
          selectedTableMargin: 0,
          selectedTableMinWidth: "calc(50% - 0.5rem)",
          listTableMargin: "0 !important",
          //till here for bug: 138107
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

  const setOtherFields = (e, data, index) => {
    let temp = [...peopleAndSystemsArray];
    let tempActData = global.structuredClone(localLoadedActivityPropertyData);

    temp.forEach((item) => {
      if (item.type === data.type) {
        item.names[index].name = e.target.value;
        item.names[index].id = index + 1;
      }
    });

    temp.forEach((item) => {
      if (item.type === data.type) {
        tempActData.ActivityProperty.actGenPropInfo.genPropInfo[
          `${data.type.charAt(0).toLowerCase() + data.type.slice(1) + "List"}`
        ] = [];
        tempActData.ActivityProperty.actGenPropInfo.genPropInfo[
          `${data.type.charAt(0).toLowerCase() + data.type.slice(1) + "List"}`
        ] = item.names.map((people, index) => {
          return {
            orderId: people.id,
            bRenderPlus: false,
            [`${
              data.type.charAt(0).toLowerCase() + data.type.slice(1) ===
              "system"
                ? "sysName"
                : data.type.charAt(0).toLowerCase() +
                  data.type.slice(1) +
                  "Name"
            }`]: item.names[index].name,
          };
        });
      }
    });

    setpeopleAndSystemsArray(temp);

    setlocalLoadedActivityPropertyData(tempActData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const closeModalUserGroup = () => {
    setopenUserGroupMF(false);
    setuserGroupListData({});
    settypeToOpen("");
    var elem = document.getElementById("workspacestudio_assetManifest");

    elem?.parentNode.removeChild(elem);
  };

  const saveChangeHandler = () => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    // code edited on 22 Dec 2022 for BugId 120959
    /*  let newArr = [];
    userGroupListData?.selectedUsers?.forEach((user) => {
      newArr.push({
        consultantName: user.consultantName,
        consultantId: user.consultantId,
        bRenderPlus: user.bRenderPlus,
      });
    });
    temp.ActivityProperty.actGenPropInfo.genPropInfo.consultantList = [
      ...newArr,
    ];*/
    // let temp = global.structuredClone(localLoadedActivityPropertyData);
    //Modified on 24/05/2023, bug_id:127652
    /* temp.ActivityProperty.actGenPropInfo.genPropInfo[
        `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
      ] = []; */
    /* temp.ActivityProperty.actGenPropInfo.genPropInfo[
        `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
      ].push({
        [`${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`]: "",
        [`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`]: "",
      });*/
    const type = typeToOpen;
    if (type === "Owner" || type === "Consultant") {
      userGroupListData?.selectedUsers?.forEach((user) => {
        const isuserAlreadyPresentIndex =
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].findIndex(
            (usr) =>
              usr[`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`] ===
              user.id
          );

        if (isuserAlreadyPresentIndex === -1) {
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].push({
            [`${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`]:
              user.name,
            [`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`]: user.id,
            bRenderPlus: false,
          });
          const unique = [
            ...new Map(
              temp.ActivityProperty.actGenPropInfo.genPropInfo[
                `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
              ].map((item) => [
                item[`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`],
                item,
              ])
            ).values(),
          ];
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].names = unique;
        }
      });
    } else if (type === "System") {
      userGroupListData?.selectedUsers?.forEach((user) => {
        const isuserAlreadyPresentIndex =
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].findIndex((usr) => usr.orderId === user.id);

        if (isuserAlreadyPresentIndex === -1) {
          temp.ActivityProperty.actGenPropInfo.genPropInfo.systemList.push({
            sysName: user.name,
            orderId: user.id,
            bRenderPlus: false,
          });
        }
      });
    } else {
      userGroupListData?.selectedUsers?.forEach((user) => {
        const isuserAlreadyPresentIndex =
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].findIndex((usr) => usr.orderId === user.id);
        if (isuserAlreadyPresentIndex === -1) {
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].push({
            [`${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`]:
              user.name,
            orderId: user.id,
            bRenderPlus: false,
          });
        }
      });
    }
    let temp2 = global.structuredClone(peopleAndSystemsArray);

    temp2.forEach((_var) => {
      if (_var.type === type) {
        _var.names = [];
        temp.ActivityProperty.actGenPropInfo.genPropInfo[
          `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
        ].forEach((people) => {
          _var.names = _var.names.filter((name) => name.id !== "");
          _var.names.push({
            id: people[
              `${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`
            ],
            name: people[
              `${type.charAt(0).toLowerCase() + type.slice(1) + "Name"}`
            ],
          });
          const unique = [
            ...new Map(_var.names.map((item) => [item.id, item])).values(),
          ];
          _var.names = unique;
        });
      }
    });

    setpeopleAndSystemsArray(temp2);
    setlocalLoadedActivityPropertyData(temp);
    closeModalUserGroup();
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false, // code edited on 25 Nov 2022 for BugId 119630
        },
      })
    );
  };

  const updateActivityPropertyData = (action, type, idOfUser) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    if (action === "delete") {
      if (type == "Owner" || type === "Consultant") {
        const isuserAlreadyPresentIndex =
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].findIndex(
            (usr) =>
              usr[`${type.charAt(0).toLowerCase() + type.slice(1) + "Id"}`] ===
              idOfUser
          );
        if (isuserAlreadyPresentIndex !== -1) {
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].splice(isuserAlreadyPresentIndex, 1);
        }
      } else {
        const isuserAlreadyPresentIndex =
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].findIndex((usr) => usr.orderID === idOfUser);
        if (isuserAlreadyPresentIndex !== -1) {
          temp.ActivityProperty.actGenPropInfo.genPropInfo[
            `${type.charAt(0).toLowerCase() + type.slice(1) + "List"}`
          ].splice(isuserAlreadyPresentIndex, 1);
        }
      }
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  return (
    <div style={{ paddingBottom: "1rem" }}>
      <p
        style={{
          fontSize: "var(--subtitle_text_font_size)",
          fontWeight: "600",
          marginBottom: "0.5rem",
        }}
      >
        {props.disabled ? t("disabledPeopleAndSystems") : t("peopleAndSystems")}
      </p>
      {/*  {openUserGroupMF ? (
        <ModalUsingCSS
          style={{
            width: "70%",
            top: "28%",
            height: "34rem",
            left: "18%",
            padding: "0",
            boxShadow: "none",
            background: "white",
          }}
          closeModal={() => {
            closeModalUserGroup();
          }}
          children={<div id="usergroupDiv"></div>}
        ></ModalUsingCSS>
      ) : null} */}

      {peopleAndSystemsArray?.map((item, i) => {
        return (
          <div key={i}>
            <label
              style={{
                fontSize: "var(--base_text_font_size)",
                marginBottom: "0.25rem",
              }}
              id={`pmWeb_peopleAndSystems_${item.type}`}
            >
              {/* Added label key for adding translation keys for for Labels in poeple and systems */}
              {item.label}
            </label>
            {item?.names?.map((name, index) => {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: "0.5rem",
                  }}
                  key={`${i}_${index}`}
                >
                  {item.type === "Owner" || item.type === "Consultant" ? (
                    <div
                      style={{
                        height: "var(--line_height)",
                        display: "flex",
                        flexDirection: "row",
                        width: item.names.length > 1 ? "76%" : "87%",
                        cursor: "pointer",
                        border: "1px solid #CECECE",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        onClick={(e) =>
                          props.disabled ? null : pickListHandler(e, item, name)
                        }
                        id={`pmweb_peopleSys_${name.name}`}
                        style={{
                          padding: "0.3rem",
                          width: item.names.length > 1 ? "76%" : "78%",
                          height: "100%",
                        }}
                        tabindex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter" && !props.disabled) {
                            pickListHandler(e, item, name);
                          }
                        }}
                        aria-label={`${item.type}`}
                      >
                        <p
                          style={{
                            color: "#000000",
                            fontSize: "var(--base_text_font_size)",
                          }}
                        >
                          {name.name}
                        </p>
                      </div>
                      <div style={{ height: "100%", display: "flex" }}>
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            justifyItems: "center",
                            alignItems: "center",
                          }}
                        >
                          <IconButton
                            onClick={() =>
                              props.disabled ? null : clearField(item, index)
                            }
                            id={`pmweb_peopleSys_CloseIcon_${index}`}
                            tabindex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter" && !props.disabled) {
                                clearField(item, index);
                              }
                            }}
                            className={classes.iconButton}
                            aria-label={`${item.type} Close`}
                            disableFocusRipple
                            disableTouchRipple
                            disableRipple
                          >
                            <CloseIcon
                              style={{
                                fontSize: "medium",
                                cursor: props.disabled
                                  ? "not-allowed"
                                  : "pointer",
                                height: "100%",
                                width: "1.2rem",
                                color: "#707070",
                                marginRight: "2px",
                                // display: props.disabled ? "none": ""
                              }}
                            />
                          </IconButton>
                        </div>
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            justifyItems: "center",
                            alignItems: "center",
                            borderLeft: "1px solid #CECECE",
                          }}
                        >
                          <IconButton
                            onClick={(e) =>
                              props.disabled
                                ? null
                                : pickListHandler(e, item, name)
                            }
                            id={`pmweb_peopleSys_more_${index}`}
                            tabindex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter" && !props.disabled) {
                                pickListHandler(e, item, name);
                              }
                            }}
                            aria-label={`${item.type} Menu Popper`}
                            className={classes.iconButton}
                            disableFocusRipple
                            disableTouchRipple
                            disableRipple
                          >
                            <MoreHorizIcon
                              style={{
                                height: "100%",
                                width: "1.8rem",
                                color: "#707070",
                                //borderLeft: "1px solid #CECECE",
                                cursor: props.disabled
                                  ? "not-allowed"
                                  : "pointer",
                                // display: props.disabled ? "none": ""
                              }}
                            />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {item?.type === "System" ||
                  item?.type === "Consumer" ||
                  item?.type === "Provider" ? (
                    <div
                      style={{
                        height: "var(--line_height)",
                        display: "flex",
                        flexDirection: "row",
                        width: item.names.length > 1 ? "76%" : "87%",
                        cursor: "pointer",
                        border: "1px solid #CECECE",
                        justifyContent: "space-between",
                      }}
                      // onClick={(e) => pickListHandler(e, item)}
                    >
                      {
                        // code updated on 22 feb 2023 for BugId 119982
                      }
                      <TextField
                        inputProps={{
                          "aria-labelledby": `pmWeb_peopleAndSystems_${item.type}`,
                        }}
                        InputProps={{
                          readOnly: props.disabled,
                        }}
                        key={name.id}
                        id={`pmweb_peopleSys_${name.id}`}
                        value={name.name}
                        onChange={(e) => {
                          setOtherFields(e, item, index);
                        }}
                        // disabled={true}
                        // onKeyUp={(e) => detectLastKeyPress(e)}
                        style={{ width: "87vw" }}
                      />
                      <div style={{ height: "100%" }}></div>
                    </div>
                  ) : null}
                  {item?.names?.length > 1 ? (
                    <IconButton
                      onClick={() => deleteField(item, name.id, index)}
                      tabindex={0}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          deleteField(item, name.id, index);
                        }
                      }}
                      className={classes.iconButton}
                      disableFocusRipple
                      disableTouchRipple
                      disableRipple
                      aria-label={`Delete`}
                    >
                      <DeleteOutlinedIcon
                        style={{
                          border: "1px solid #CECECE",
                          color: "#606060",
                          marginTop: "0px",
                          //marginRight: "5px",
                          width: "2rem",
                          // Added on 23-05-2023 for BUGID: 127588
                          // height: "2rem",
                          height: "2.5rem",
                          cursor: "pointer",
                          display: props.disabled ? "none" : "",
                        }}
                        id={`pmweb_peopleSys_deleteIcon_${index}`}
                      />
                    </IconButton>
                  ) : null}
                  {item.names.length === index + 1 ? (
                    <div
                      className="basicDetails-addIcon"
                      style={{
                        display: props.disabled ? "none" : "",
                        //Added on: 23-05-2023 for BUGID: 127588
                        cursor: "pointer",
                      }}
                    >
                      <IconButton
                        onClick={() => (props.disabled ? null : addField(item))}
                        id={`pmweb_peopleSys_addIcon_${index}`}
                        tabindex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            addField(item);
                          }
                        }}
                        className={classes.iconButton}
                        aria-label={`${item?.type} Add`}
                      >
                        <AddIcon className="basicDetails-addIconSvg" />
                      </IconButton>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}

      {openUserGroupMF ? (
        <ModalUsingCSS
          style={{
            width: "70%",
            top: window?.innerWidth < 1200 ? "26%" : "22%", // code modified on 06-102023 for bugId:134018
            height: "40rem",
            left: "18%",
            padding: "0",
            boxShadow: "none",
            background: "white",
            border: "1px solid rgb(211, 211, 211)",
            borderRadius: "0",
          }}
          children={
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
                  height: "13%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "var(--title_text_font_size)",
                  paddingInline: "1rem",
                  fontWeight: "600",
                  borderBottom: "1px solid rgb(0,0,0,0.3)",
                }}
              >
                {t("users")}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => closeModalUserGroup()}
                    id="pmweb_peopleSys_discard"
                    style={{ marginInline: "0.3rem", cursor: "pointer" }}
                  >
                    {t("discard")}
                  </Button>

                  <Button
                    variant="contained"
                    style={{ marginInline: "0.3rem", cursor: "pointer" }}
                    color="primary"
                    onClick={saveChangeHandler}
                    id="pmweb_peopleSys_saveChanges"
                  >
                    {t("save")} {t("changes")}
                  </Button>

                  <ClearOutlinedIcon
                    onClick={() => closeModalUserGroup()}
                    id="pmweb_peopleSys_clearICon"
                    classes={{
                      root: classes.clearIcon,
                    }}
                    tabindex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        closeModalUserGroup();
                      }
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "87%",
                  overflow: "auto",
                  padding: "0 10px",
                }}
              >
                <div id="usergroupDiv"></div>
              </div>
            </div>
          }
        ></ModalUsingCSS>
      ) : null}
    </div>
  );
};

export default PeopleAndSystems;
