// #BugID - 116006
// #BugDescription - Validation for negative value of turnaround time added.
//Date - 19 October 2022

// #BugID - 117369
// #BugDescription - Added the option and add button.
//Date - 25 October 2022

// #BugID - 117347
// #BugDescription - Added the message for success and fail for saving the data.
//Date - 25 October 2022

// #BugID - 117347
// #BugDescription - One condition for calendar was missing added the condtition for the calendar.
//Date - 23 Nov 2022
//Changes made to solve Bug 123515 -Process Designer-icons related- UX and UI bugs
import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { useTranslation } from "react-i18next";
import {
  Button,
  // InputBase,
  MenuItem,
  TextField,
  useMediaQuery,
} from "@material-ui/core";
import SunEditor from "../../../UI/SunEditor/SunTextEditor";
import clsx from "clsx";
import CustomizedDropdown from "../../../UI/Components_With_ErrrorHandling/Dropdown";
import AddIcon from "@material-ui/icons/Add";
import axios from "axios";
// import EditOutlinedIcon from "@material-ui/icons/Edit";
import {
  SERVER_URL,
  ENDPOINT_PROCESS_PROPERTIES,
  ENDPOINT_UPDATE_PROCESS_PROPERTIES,
  RTL_DIRECTION,
  APP_HEADER_HEIGHT,
} from "../../../Constants/appConstants";
import { calendarTypeOptions } from "../../Properties/PropetiesTab/ActivityRules/CommonFunctionCall";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CircularProgress from "@material-ui/core/CircularProgress";
import Modal from "../../../UI/Modal/Modal";
import { store, useGlobalState } from "state-pool";
import { decode_utf8, encode_utf8 } from "../../../utility/UTF8EncodeDecoder";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import { useDispatch, useSelector } from "react-redux";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { CloseIcon, EditIcon } from "../../../utility/AllImages/AllImages";
import secureLocalStorage from "react-secure-storage";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { makeStyles } from "@material-ui/core/styles";
import TextInput from "../../../UI/Components_With_ErrrorHandling/InputField";
import {
  PMWEB_REGEX,
  REGEX,
  validateRegex,
} from "../../../validators/validator";
import { isProcessDeployedFunc } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

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
}));

function ProcessProperties(props) {
  let { t } = useTranslation();
  let dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const calList = store.getState("calendarList");
  const { openProcessID, openProcessType } = props;
  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previousPropertyData, setPreviousPropertyData] = useState({});
  const [propertiesData, setPropertiesData] = useState({});
  const [ownerEmailId, setOwnerEmailId] = useState("");
  const [openUserGroupMF, setopenUserGroupMF] = useState(false);
  const [localCalendarList, setlocalCalendarList] = useGlobalState(calList);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [showCalenderMFBool, setshowCalenderMFBool] = useState(false);
  const [userGroupListData, setUserGroupListData] = useState(null);
  const costRef = useRef(null);
  //const [selectedOwner, setSelectedOwner] = useState(null)
  let { isReadOnly } = props;
  isReadOnly = isReadOnly || isProcessDeployedFunc(localLoadedProcessData);
  const classes = useStyles({ ...props, direction });

  const [owner, setOwner] = useState([
    {
      OwnerName: "",
      OwnerOrderID: "",
    },
  ]);
  const [consultant, setConsultant] = useState([
    {
      ConsultantOrderID: "",
      ConsultantName: "",
    },
  ]);
  const [description, setDescription] = useState("");
  const [calendarValue, setCalendarValue] = useState("");
  const [systemValues, setSystemValues] = useState([
    {
      SystemOrderID: "",
      SystemName: "",
    },
  ]);
  const [providerValues, setProviderValues] = useState([
    {
      ProviderName: "",
      ProviderOrderID: "",
    },
  ]);
  const [consumerValues, setConsumerValues] = useState([
    {
      ConsumerOrderID: "",
      ConsumerName: "",
    },
  ]);
  const [costValue, setCostValue] = useState("");
  const [processDetails, setProcessDetails] = useState({
    processName: "",
    version: "",
    createdBy: "",
  });
  const [turnAroundTime, setTurnAroundTime] = useState({
    Days: "0",
    Hours: "0",
    Minutes: "0",
    TATCalFlag: "N",
  });

  const [emailError, setEmailError] = useState(false);
  const [isSaveClicked, setIsSaveClicked] = useState(false);
  const [typeToOpen, settypeToOpen] = useState(); //which type of field to open picklist in
  const [costError, setCostError] = useState(false);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  console.log("SettingsTab", windowInnerHeight);
  const systemRef = useRef();
  const providerRef = useRef();
  const consumerRef = useRef();

  // Function that runs when the component loads.
  useEffect(() => {
    setIsLoading(true);
    // code edited on 7 Nov 2022 for BugId 116221
    if (localLoadedProcessData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            ENDPOINT_PROCESS_PROPERTIES +
            "/" +
            localLoadedProcessData.ProcessDefId +
            "/" +
            localLoadedProcessData.ProcessType
        )
        .then((res) => {
          if (res.data.Status === 0) {
            let temp = { ...res.data.ProcessProperty };
            setPropertiesData(temp);
            setPreviousPropertyData(temp);
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [localLoadedProcessData?.ProcessDefId]);

  // Function that gets called when propertiesData value changes.
  useEffect(() => {
    if (propertiesData) {
      setOwnerEmailId(propertiesData.OwnerEmailID);
      setProcessDetails({
        processName: propertiesData.ProcessName,
        version: propertiesData.VersionNo,
        createdBy: propertiesData.CreatedBy,
      });
      setCalendarValue(
        propertiesData.Calendar &&
          propertiesData.Calendar.CalType + propertiesData.Calendar.CalId
      );
      setCostValue(propertiesData.Cost);
      setTurnAroundTime(propertiesData.TAT);
      if (
        propertiesData.hasOwnProperty("Owner") &&
        propertiesData?.Owner.length > 0
      )
        setOwner(propertiesData?.Owner);
      if (
        propertiesData.hasOwnProperty("Consultant") &&
        propertiesData?.Consultant.length > 0
      )
        setConsultant(propertiesData.Consultant);
      if (
        propertiesData.hasOwnProperty("System") &&
        propertiesData?.System.length > 0
      )
        setSystemValues(propertiesData.System);
      if (
        propertiesData.hasOwnProperty("Provider") &&
        propertiesData?.Provider.length > 0
      )
        setProviderValues(propertiesData.Provider);
      if (
        propertiesData.hasOwnProperty("Consumer") &&
        propertiesData?.Consumer.length > 0
      )
        setConsumerValues(propertiesData.Consumer);

      setDescription(decode_utf8(propertiesData?.Description));
    }
  }, [propertiesData]);

  // Function to check if the fields are empty or not.
  const areAllFieldsFilled = () => {
    let areFieldsEmpty = false;
    systemValues?.length > 1 &&
      systemValues?.forEach((element) => {
        if (element.SystemName?.trim() === "") {
          areFieldsEmpty = true;
        }
      });
    providerValues?.length > 1 &&
      providerValues?.forEach((element) => {
        if (element.ProviderName?.trim() === "") {
          areFieldsEmpty = true;
        }
      });
    consumerValues?.length > 1 &&
      consumerValues?.forEach((element) => {
        if (element.ConsumerName?.trim() === "") {
          areFieldsEmpty = true;
        }
      });
    return areFieldsEmpty;
  };

  // Function that gets called when the user clicks on save changes button.
  const handleSaveChanges = () => {
    setIsSaveClicked(true);
    // code update on 26 Dec 2022 for  BugId 111725
    // modified on 21/10/23 for BugId 139644
    // const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // if (ownerEmailId !== "" && !ownerEmailId.match(mailformat)) {
    if (
      ownerEmailId !== "" &&
      !validateRegex(ownerEmailId, PMWEB_REGEX.EmailId)
    ) {
      dispatch(
        setToastDataFunc({
          message: t("pleaseEnterAValidEmail"),
          severity: "error",
          open: true,
        })
      );
      return false;
    }

    if (
      costValue !== "" &&
      turnAroundTime.Days !== "" &&
      turnAroundTime.Hours !== "" &&
      turnAroundTime.Minutes !== "" &&
      calendarValue != "" &&
      typeof calendarValue !== "undefined" &&
      !areAllFieldsFilled()
    ) {
      let ownerArr = [],
        consultantArr = [],
        systemArr = [],
        providerArr = [],
        consumerArr = [];
      owner?.forEach((element) => {
        if (element.OwnerOrderID !== "") {
          let tempObj = {
            ownerName: element.OwnerName,
            ownerId: element.OwnerOrderID,
          };
          ownerArr.push(tempObj);
        }
      });

      consultant?.forEach((element) => {
        if (element.ConsultantOrderID !== "") {
          let tempObj = {
            consultantName: element.ConsultantName,
            consultantId: element.ConsultantOrderID,
          };
          consultantArr.push(tempObj);
        }
      });

      systemValues?.forEach((element, i) => {
        if (element.SystemOrderID !== "") {
          let tempObj = {
            sysName: element.SystemName,
            orderId: element.SystemOrderID,
          };
          systemArr.push(tempObj);
        }
        if (element.SystemOrderID == "" && element.SystemName != "") {
          let tempObj = {
            sysName: element.SystemName,
            orderId: `${i + 1}`,
          };
          systemArr.push(tempObj);
        }
      });

      providerValues?.forEach((element, i) => {
        if (element.ProviderOrderID !== "") {
          let tempObj = {
            providerName: element.ProviderName,
            orderId: element.ProviderOrderID,
          };
          providerArr.push(tempObj);
        }
        if (element.ProviderOrderID === "" && element.ProviderName != "") {
          let tempObj = {
            providerName: element.ProviderName,
            orderId: `${i + 1}`,
          };
          consumerArr.push(tempObj);
        }
      });

      consumerValues?.forEach((element, i) => {
        if (element.ConsumerOrderID !== "") {
          let tempObj = {
            consumerName: element.ConsumerName,
            orderId: element.ConsumerOrderID,
          };
          consumerArr.push(tempObj);
        }
        if (element.ConsumerOrderID === "" && element.ConsumerName != "") {
          let tempObj = {
            consumerName: element.ConsumerName,
            orderId: `${i + 1}`,
          };
          consumerArr.push(tempObj);
        }
      });

      const finalObj = {
        processDefId: openProcessID,
        processState: openProcessType,
        processProp: {
          genPropInfo: {
            description: encode_utf8(description),
            cost: costValue,
            ownerList: ownerArr,
            consultantList: consultantArr,
            systemList: systemArr,
            providerList: providerArr,
            consumerList: consumerArr,
          },

          m_strOwnerEmailID: ownerEmailId,
          tatInfo: {
            tatCalFlag: turnAroundTime.TATCalFlag,
            wfMinutes: turnAroundTime.Minutes,
            wfHours: turnAroundTime.Hours,
            wfDays: turnAroundTime.Days,
          },
        },
      };
      if (calendarValue !== "") {
        finalObj.processProp.calendarId = calendarValue.substring(1);
        finalObj.processProp.m_strCalenderType = calendarValue.substring(0, 1);
      }

      axios
        .post(SERVER_URL + ENDPOINT_UPDATE_PROCESS_PROPERTIES, finalObj)
        .then((res) => {
          if (res?.data?.Status === 0) {
            setIsSaveClicked(false);
            setIsChanged(false);
            setPreviousPropertyData({ ...propertiesData });
            dispatch(
              setToastDataFunc({
                message: res?.data?.Message,
                severity: "success",
                open: true,
              })
            );
          } else {
            dispatch(
              setToastDataFunc({
                message: t("dataCouldNotBeSaved"),
                severity: "success",
                open: true,
              })
            );
          }
        });
    } else {
      dispatch(
        setToastDataFunc({
          message: t("mandatoryErrorStatement"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  //Added  on 08/08/2023, bug_id:132774
  const handleSaveButton = () => {
    let arr = [];
    if (typeToOpen === "Owner") {
      if (userGroupListData?.selectedUsers.length === 0) {
        let tempObj = {
          OwnerName: "",
          OwnerOrderID: "",
        };
        arr.push(tempObj);
      } else {
        userGroupListData?.selectedUsers?.forEach((user) => {
          let tempObj = {
            OwnerName: user?.name,
            OwnerOrderID: user?.id,
          };
          arr.push(tempObj);
        });
      }

      setOwner(arr);
    } else if (typeToOpen === "Consultant") {
      if (userGroupListData?.selectedUsers.length === 0) {
        let tempObj = {
          ConsultantName: "",
          ConsultantOrderID: "",
        };
        arr.push(tempObj);
      } else {
        userGroupListData?.selectedUsers.forEach((user) => {
          let tempObj = {
            ConsultantName: user.name,
            ConsultantOrderID: user.id,
          };
          arr.push(tempObj);
        });
      }

      setConsultant(arr);
    }
    setopenUserGroupMF(false);
    var elem = document.getElementById("workspacestudio_assetManifest");

    elem.parentNode.removeChild(elem);
  };

  // Function that gets called when the user clicks on cancel changes button.
  const handleCancelChanges = () => {
    setPropertiesData({ ...previousPropertyData });
    setIsChanged(false);
    // added on 19/09/23 for BugId 137240
    setEmailError(false);
    setCostError(false);
  };

  // Function that handles the change in system value fields.
  const systemValuesHandler = (value, index) => {
    let tempArr = [...systemValues];
    tempArr[index].SystemName = value;
    setSystemValues(tempArr);
    setIsChanged(true);
  };

  // Function that handles the change in provider value fields.
  const providerValuesHandler = (value, index) => {
    let tempArr = [...providerValues];
    tempArr[index].ProviderName = value;
    setProviderValues(tempArr);
    setIsChanged(true);
  };

  // Function that handles the change in consumer value fields.
  const consumerValuesHandler = (value, index) => {
    let tempArr = [...consumerValues];
    tempArr[index].ConsumerName = value;
    setConsumerValues(tempArr);
    setIsChanged(true);
  };

  // Function that handles the change in turn around time.
  const turnAroundTimeHandler = (event, key) => {
    // code updated on 22 Nov 2022 for BugId 116006
    const { value } = event.target;
    const obj = { ...turnAroundTime };
    if (key == "Days" || key == "Hours" || key == "Minutes") {
      if (/^\d*$/.test(value)) {
        setTurnAroundTime({ ...obj, [key]: value });
        setIsChanged(true);
      } else {
        event.preventDefault();
      }
    } else {
      setTurnAroundTime({ ...obj, [key]: value });
      setIsChanged(true);
    }
  };

  // Function that gets called when the user clicks on add field icon.
  const handleAddField = (name, index) => {
    if (name === "system") {
      let temp = [...systemValues];
      temp?.push({ SystemName: "", SystemOrderID: "" });
      temp?.forEach((element, index) => {
        element.SystemOrderID = `${index + 1}`;
      });
      setSystemValues(temp);
    } else if (name === "provider") {
      let temp = [...providerValues];
      temp && temp.push({ ProviderName: "", ProviderOrderID: "" });
      temp &&
        temp.forEach((element, index) => {
          element.ProviderOrderID = `${index + 1}`;
        });
      setProviderValues(temp);
    } else if (name === "consumer") {
      let temp = [...consumerValues];
      temp && temp.push({ ConsumerName: "", ConsumerOrderID: "" });
      temp &&
        temp.forEach((element, index) => {
          element.ConsumerOrderID = `${index + 1}`;
        });
      setConsumerValues(temp);
    }
    setIsChanged(true);
  };

  // Function that deletes a field based on its type.
  const handleDeleteField = (name, index) => {
    if (name === "system") {
      let temp = [...systemValues];
      temp.splice(index, 1);
      setSystemValues(temp);
    } else if (name === "provider") {
      let temp = [...providerValues];
      temp.splice(index, 1);
      setProviderValues(temp);
    } else if (name === "consumer") {
      let temp = [...consumerValues];
      temp.splice(index, 1);
      setConsumerValues(temp);
    }
    // code added on 21 Feb 2023 for BugId 123949
    else if (name === "consultant") {
      let temp = [...consultant];
      temp.splice(index, 1);
      setConsultant(temp);
    } else if (name === "owner") {
      let temp = [...owner];
      temp.splice(index, 1);
      setOwner(temp);
    }
    setIsChanged(true);
  };

  const closeModalUserGroup = () => {
    setopenUserGroupMF(false);
    var elem = document.getElementById("workspacestudio_assetManifest");

    elem.parentNode.removeChild(elem);
  };

  const pickListHandler = (peopleType) => {
    setopenUserGroupMF(true);

    let microProps = {
      data: {
        initialSelected: getSelectedUsers(peopleType),
        onSelection: (list) => getUserGroupList(list, peopleType),
        token: JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token,
        ext: true,
        customStyle: {
          selectedTableMinWidth: "40%", // selected user and group listing width
          listTableMinWidth: "60%", // user/ group listing width
          // listHeight: "16rem", // custom height common for selected listing and user/group listing
          listHeight: "50vh", // custom height common for selected listing and user/group listing
          showUserFilter: true, // true for showing user filter, false for hiding
          showExpertiseDropDown: true, // true for showing expertise dropdown, false for hiding
          showGroupFilter: false, // true for showing group filter, false for hiding
        },
      },
      locale: secureLocalStorage.getItem("locale") || "en_US",
      direction: direction,
      ContainerId: "usergroupDiv",
      Module: "ORM",
      Component: "UserGroupPicklistMF",
      InFrame: false,
      Renderer: "renderUserGroupPicklistMF",
    };
    window.loadUserGroupMF(microProps);
  };

  const getUserGroupList = (list, type) => {
    let arr = [];
    //Modified  on 08/08/2023, bug_id:132774

    /*   if (type === "Owner") {
      //code updated on 12 October 2022 for BugId 116945
      if (list?.selectedUsers.length === 0) {
        let tempObj = {
          OwnerName: "",
          OwnerOrderID: "",
        };
        arr.push(tempObj);
      } else {
        list?.selectedUsers?.forEach((user) => {
          let tempObj = {
            OwnerName: user?.name,
            OwnerOrderID: user?.id,
          };
          arr.push(tempObj);
        });
      }

      setOwner(arr);
    } else if (type === "Consultant") {
      //code updated on 12 October 2022 for BugId 116945
      if (list?.selectedUsers.length === 0) {
        let tempObj = {
          ConsultantName: "",
          ConsultantOrderID: "",
        };
        arr.push(tempObj);
      } else {
        list?.selectedUsers.forEach((user) => {
          let tempObj = {
            ConsultantName: user.name,
            ConsultantOrderID: user.id,
          };
          arr.push(tempObj);
        });
      }

      setConsultant(arr);
    }
 */
    setUserGroupListData(list);
    settypeToOpen(type);
    setIsChanged(true);
  };

  const getSelectedUsers = (type) => {
    let selectedUsers = [];
    if (type === "Owner") {
      owner?.forEach((data) => {
        if (data.OwnerOrderID !== "") {
          selectedUsers.push({
            id: data.OwnerOrderID,
            name: data.OwnerName,
          });
        }
      });
    } else if (type === "Consultant") {
      consultant?.forEach((data) => {
        if (data.ConsultantOrderID !== "") {
          selectedUsers.push({
            id: data.ConsultantOrderID,
            name: data.ConsultantName,
          });
        }
      });
    }
    return { selectedUsers: selectedUsers };
  };

  const addNewCalendar = (data) => {
    let temp = global.structuredClone(localCalendarList);
    temp.push({
      CalendarName: data.calName,
      CalendarId: data.calId,
      DefinedWithProcessDefId:
        data.calType === "L" ? localLoadedProcessData.ProcessDefId : "0",
    });
    setlocalCalendarList(temp);
  };
  const openCalenderMf = () => {
    let microProps = {
      Component: "ProcessCalendar", // change here
      Callback: (data) => addNewCalendar(data),
      source: "CAL_PRO",
      popupIndex: "1",
      ProcessDefinitionId: localLoadedProcessData.ProcessDefId + "",
      calId: -1,
      AssociationFlag: "N",
      CalendarType: "G",
      RegisteredProcess:
        localLoadedProcessData?.ProcessType === "R" ? "Y" : "N",
      ActivityId: +props.cellID,
      ContainerId: "calenderDiv",
      Module: "WCL",
      InFrame: false,
      Renderer: "renderProcessCalendar",
      closeDialog: () => {
        setshowCalenderMFBool(false);
        var elem = document.getElementById("workspacestudio_assetManifest");

        elem.parentNode.removeChild(elem);
      },
    };
    window.MdmDataModelPMWEB(microProps);
    setshowCalenderMFBool(true);
  };

  const handleCalendarEdit = () => {
    let microProps = {
      Component: "ProcessCalendar", // change here
      Callback: (id, name) => console.log(id, name),
      source: "CAL_PRO",
      popupIndex: "2",
      ProcessDefinitionId:
        calendarValue.substring(0, 1) === "L"
          ? localLoadedProcessData.ProcessDefId + ""
          : "0",
      calId: +calendarValue.substring(1),
      AssociationFlag: "N",
      CalendarType: calendarValue.substring(0, 1),
      RegisteredProcess:
        localLoadedProcessData?.ProcessType === "R" ? "Y" : "N",
      ActivityId: -1,
      ContainerId: "calenderDiv",
      Module: "WCL",
      InFrame: false,
      Renderer: "renderProcessCalendar",
      closeDialog: () => {
        setshowCalenderMFBool(false);
        var elem = document.getElementById("workspacestudio_assetManifest");

        elem.parentNode.removeChild(elem);
      },
    };
    window.MdmDataModelPMWEB(microProps);
    setshowCalenderMFBool(true);
  };

  //Added  on 08/08/2023, bug_id:132774
  const clearField = (data, index, type) => {
    if (type === "owner") {
      let temp = [...owner];
      if (temp.length > 1) {
        temp[index].OwnerName = "";
      } else {
        temp[index].OwnerName = "";
        temp[index].OwnerOrderID = "";
      }

      setOwner(temp);
    } else {
      let temp = [...consultant];
      if (temp.length > 1) {
        temp[index].ConsultantName = "";
      } else {
        temp[index].ConsultantName = "";
        temp[index].ConsultantOrderID = "";
      }

      setConsultant(temp);
    }
  };
  //Added on 27/09/2023, bug_id:135305
  const handleChange = (data) => {
    setDescription(data);
    // added on 20/10/23 for BugId 139684
    setIsChanged(true);
  };
  //till here for bug id:135305

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  } else {
    return (
      <div
        className={styles.mainDiv}
        style={{
          // changes added for bug_id: 134226
          height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 8rem)`,
        }}
      >
        <div
          className={
            direction === RTL_DIRECTION ? arabicStyles.subDiv : styles.subDiv
          }
        >
          {showCalenderMFBool ? (
            <Modal
              show={showCalenderMFBool}
              backDropStyle={{ backgroundColor: "transparent" }}
              style={{
                width: "auto",
                position: "absolute",
                // modified on 26-9-2023 for bug_id: 134135
                // top: "50%",
                // top: smallScreen ? "50%" : "30%",
                top: `calc(${APP_HEADER_HEIGHT})`,
                left: "50%",
                transform: "translate(-50%,-6%)",
                background: "white",
                padding: "0", // added on 04/10/23 for BugId 132020
                boxShadow: "none", // added on 04/10/23 for BugId 132020
              }}
              modalClosed={() => {
                setshowCalenderMFBool(false);
                var elem = document.getElementById(
                  "workspacestudio_assetManifest"
                );
                elem?.parentNode.removeChild(elem);
              }}
            >
              <div
                //Modified  on 09/08/2023, bug_id:133959
                // id="pmweb_basicDetails_calenderDiv"
                id="calenderDiv"
                style={{ width: "100%", height: "100%" }}
              >
                {/*code edited on 30 Dec 2022 for BugId 116354*/}
                <div
                  style={{
                    // modified on 04/10/23 for BugId 132020
                    // width: "800px",
                    // height: "500px",
                    width: "430px",
                    height: "35rem",
                    fontSize: "22px",
                    fontWeight: "bold",
                    // commented on 04/10/23 for BugId 132020
                    // padding: "250px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span tabIndex={0}></span>
                  <CircularProgress
                    id="pmweb_basicDetails_calendarSpinner"
                    // commented on 04/10/23 for BugId 132020
                    // style={{ marginLeft: "40%" }}
                  />
                </div>
              </div>
            </Modal>
          ) : null}
          {openUserGroupMF ? (
            <Modal
              show={openUserGroupMF}
              backDropStyle={{ backgroundColor: "transparent" }}
              style={{
                width: "70vw",
                // height: "60vh",
                minHeight: "30vh",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background: "white",
              }}
              modalClosed={() => {
                closeModalUserGroup();
              }}
              children={
                <>
                  {
                    //Modified on 24/05/2023,  bug_id:127620
                    /* <div id="usergroupDiv"></div> */
                  }

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
                          id="pmweb_ProcessProperty_DiscardBtn"
                          variant="contained"
                          onClick={() => closeModalUserGroup()}
                          style={{ marginInline: "0.3rem", cursor: "pointer" }}
                        >
                          {t("discard")}
                        </Button>

                        <Button
                          id="pmweb_ProcessProperty_SaveBtn"
                          variant="contained"
                          style={{ marginInline: "0.3rem", cursor: "pointer" }}
                          color="primary"
                          onClick={handleSaveButton}
                        >
                          {t("save")} {t("changes")}
                        </Button>

                        <ClearOutlinedIcon
                          id="pmweb_ProcessProperty_CloseUserGrpModalBtn"
                          onClick={() => closeModalUserGroup()}
                          classes={{
                            root: classes.clearIcon,
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "87%",
                      }}
                    >
                      <div id="usergroupDiv"></div>
                    </div>
                  </div>
                </>
              }
            ></Modal>
          ) : null}
          <p className={styles.heading}>{t("nameAndDescription")}</p>
          <div className={clsx(styles.flexRow, styles.basicDetailsDiv)}>
            <p className={styles.fieldTitle}>{t("ProcessName")}:</p>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.processDetails
                  : styles.processDetails
              }
            >
              {processDetails?.processName}
            </p>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldValue
                  : styles.fieldValue
              }
            ></p>
            <p className={styles.fieldTitle}>{t("Version")}:</p>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.processDetails
                  : styles.processDetails
              }
            >
              {processDetails?.version}
            </p>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldValue
                  : styles.fieldValue
              }
            ></p>
            <p className={styles.fieldTitle}>{t("createdByCapital")}:</p>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.processDetails
                  : styles.processDetails
              }
            >
              {processDetails?.createdBy}
            </p>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.fieldValue
                  : styles.fieldValue
              }
            ></p>
          </div>
          <p
            className={clsx(
              styles.fieldTitle,
              styles.ownerEmailIdText,
              styles.fieldText
            )}
          >
            {t("ownerEmailID")}
          </p>
          <TextField
            id="pmweb_ProcessProperty_OwnerEmailId"
            inputProps={{
              "aria-label": "Owner Email Id",
            }}
            variant="outlined"
            className={styles.ownerEmailIdInput}
            onChange={(event) => {
              setOwnerEmailId(event.target.value);
              // modified on 21/10/23 for BugId 139644
              /*const mailformat =
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
              if (
                event.target.value !== "" &&
                !event.target.value.match(mailformat)
              ) { */
              if (
                event.target.value !== "" &&
                !validateRegex(event.target.value, PMWEB_REGEX.EmailId)
              ) {
                setEmailError(true);
              } else {
                setEmailError(false);
              }
              setIsChanged(true);
            }}
            value={ownerEmailId}
            disabled={isReadOnly}
          />
          {
            // code update on 26 Dec 2022 for BugId 111725
            emailError ? (
              <p style={{ color: "#b52a2a" }}>{t("pleaseEnterAValidEmail")}</p>
            ) : null
          }
          <p className={clsx(styles.heading, styles.peopleAndSystemHeading)}>
            {t("peopleAndSystems")}
          </p>

          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.flexRow
                : `${styles.flexRow} ${styles.peopleSystemRow}`
            }
          >
            {
              //Modified on 29/08/2023  for bug_id:132772
            }
            <div
              className={`${styles.flexColumn} ${styles.peopleSystemColumn}`}
            >
              {
                //till here for bug_id:132772
              }
              {/*  <div className={styles.flexColumn}> */}
              <p
                className={clsx(
                  styles.fieldTitle,
                  styles.fieldText,
                  styles.title
                )}
              >
                {t("owner")}
              </p>
              {owner?.map((element, index) => {
                return (
                  <>
                    <div style={{ display: "flex", position: "relative" }}>
                      {
                        //Modified on 29/08/2023  for bug_id:132772
                      }
                      <div className={styles.ownerFieldContainer}>
                        <TextInput
                          inputValue={element?.OwnerName}
                          ariaLabel={"Owner Field"}
                          classTag={`${styles.ownerEmailIdInput} ${styles.ownerFields}`}
                          onClick={() => {
                            if (!isReadOnly) {
                              pickListHandler("Owner");
                            }
                          }}
                          name="Owner_List"
                          idTag={`pmweb_ProcessProperty_OwnerList` + `${index}`}
                          readOnlyCondition={isReadOnly}
                        />

                        {
                          //Added  on 08/08/2023, bug_id:132774
                        }
                        {owner?.length === 1 ? (
                          <CloseIcon
                            style={{
                              fontSize: "medium",
                              cursor: isReadOnly ? "not-allowed" : "pointer",
                              height: "100%",
                              width: "0.75rem",
                              color: "#707070",
                              marginRight: "5px",
                            }}
                            onClick={() =>
                              isReadOnly
                                ? null
                                : clearField(element, index, "owner")
                            }
                            id={`pmweb_owner_CloseIcon_${index}`}
                          />
                        ) : null}
                      </div>
                      {
                        //till here for bug_id:132772
                      }

                      {/* <TextField
                        tabIndex={0}
                        id={`pmweb_ProcessProperty_OwnerList` + `${index}`}
                        variant="outlined"
                        inputProps={{
                          "aria-label": "Owner Field",
                        }}
                        className={`${styles.ownerEmailIdInput} ${styles.ownerFields}`}
                        // onChange={(event) =>
                        //   // ownerValuesHandler(event.target.value, index)
                        //   pickListHandler("owner")
                        // }
                        onClick={() => {
                          if (!isReadOnly) {
                            pickListHandler("Owner");
                          }
                        }}
                        value={element?.OwnerName}
                        style={{ marginRight: "0px" }}
                        disabled={isReadOnly}
                      /> */}

                      <div style={{ height: "100%", display: "flex" }}>
                        {
                          //Modified on 13/10/2023, bug_id:134132
                        }
                        {/* {!isReadOnly && (
                          <MoreHoriz
                            tabIndex={0}
                            style={{
                              height: "var(--line_height)",
                              width: "2vw",
                              borderTop: "1px solid #cecece",
                              borderBottom: "1px solid #cecece",
                              borderRight: "1px solid #cecece",
                              padding: "0px",
                              borderRadius: "2px",
                              color: "#707070",
                              cursor: "pointer",
                            }}
                            id={
                              `pmweb_ProcessProperty_OwnerList_PickListHandler` +
                              `${index}`
                            }
                            onClick={() => pickListHandler("Owner")}
                            disabled={isReadOnly}
                          />
                        )}
 */}
                        {
                          //till her for bug_id:134132
                        }
                        {!isReadOnly && owner?.length > 1 ? (
                          <DeleteOutlinedIcon
                            tabIndex={0}
                            id={
                              `pmweb_ProcessProperty_OwnerList_DeleteField` +
                              `${index}`
                            }
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.deleteIcon
                                : styles.deleteIconOC
                            }
                            onClick={() => handleDeleteField("owner", index)}
                          />
                        ) : null}
                      </div>

                      {index === 0 && !isReadOnly ? (
                        <AddIcon
                          tabIndex={0}
                          id={
                            `pmweb_ProcessProperty_OwnerList_AddPickList` +
                            `${index}`
                          }
                          onClick={() => pickListHandler("Owner")}
                          className={`${styles.addIcon} ${styles.addIconCustom}`}
                          style={{
                            height: "var(--line_height) !important",
                            margin: "0",
                          }}
                        />
                      ) : null}
                    </div>
                  </>
                );
              })}
            </div>

            <div
              className={styles.flexColumn}
              style={{
                marginLeft: direction === RTL_DIRECTION ? "0px" : "2.34vw",
                marginRight: direction === RTL_DIRECTION ? "32px" : "0px",
              }}
            >
              <p
                className={clsx(
                  styles.fieldTitle,
                  styles.fieldText,
                  styles.title
                )}
              >
                {t("consultant")}
              </p>
              {consultant?.map((element, index) => {
                return (
                  <>
                    <div style={{ display: "flex", position: "relative" }}>
                      {
                        //added on 29/08/2023  for bug_id:132772
                      }
                      <div className={styles.ownerFieldContainer}>
                        <TextInput
                          inputValue={element?.ConsultantName}
                          ariaLabel={"Consultant Field"}
                          classTag={`${styles.ownerEmailIdInput} ${styles.ownerFields}`}
                          onClick={() => {
                            if (!isReadOnly) {
                              pickListHandler("Consultant");
                            }
                          }}
                          name="Consultant_List"
                          idTag={
                            `pmweb_ProcessProperty_ConsultantList` + `${index}`
                          }
                          readOnlyCondition={isReadOnly}
                        />
                        {
                          //Added  on 08/08/2023, bug_id:132774
                        }
                        {consultant?.length === 1 ? (
                          <CloseIcon
                            style={{
                              fontSize: "medium",
                              cursor: isReadOnly ? "not-allowed" : "pointer",
                              height: "100%",
                              width: "0.75rem",
                              color: "#707070",
                              marginRight: "5px",
                            }}
                            onClick={() =>
                              isReadOnly
                                ? null
                                : clearField(element, index, "consultant")
                            }
                            id={`pmweb_consultant_CloseIcon_${index}`}
                          />
                        ) : null}
                      </div>
                      {
                        //till here for bug_id:132772
                      }

                      {/*  <TextField
                        tabIndex={0}
                        id={`pmweb_ProcessProperty_ConsultantList` + `${index}`}
                        variant="outlined"
                        inputProps={{
                          "aria-label": "Consultant Field",
                        }}
                        className={styles.ownerEmailIdInput}
                        // onChange={(event) =>
                        //   consultantValuesHandler(event.target.value, index)
                        // }
                        onClick={() => {
                          if (!isReadOnly) {
                            pickListHandler("Consultant");
                          }
                        }}
                        value={element.ConsultantName}
                        style={{ marginRight: "-1px" }}
                        disabled={isReadOnly}
                      /> */}

                      <div style={{ height: "100%", display: "flex" }}>
                        {
                          //Modified on 13/10/2023, bug_id:134132
                        }
                        {/*  {!isReadOnly && (
                          <MoreHoriz
                            tabIndex={0}
                            style={{
                              height: "var(--line_height)",
                              width: "2vw",
                              borderTop: "1px solid #cecece",
                              borderBottom: "1px solid #cecece",
                              borderRight: "1px solid #cecece",
                              padding: "0px",
                              borderRadius: "2px",
                              color: "#707070",
                              cursor: "pointer",
                            }}
                            id={
                              `pmweb_ProcessProperty_ConsultantList_PickListHandler` +
                              `${index}`
                            }
                            onClick={() => pickListHandler("Consultant")}
                          />
                        )} */}
                        {
                          //till her for bug_id:134132
                        }

                        {!isReadOnly && consultant?.length > 1 ? (
                          <DeleteOutlinedIcon
                            tabIndex={0}
                            id={
                              `pmweb_ProcessProperty_ConsultantList_DeleteField` +
                              `${index}`
                            }
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.deleteIcon
                                : styles.deleteIconOC
                            }
                            onClick={() =>
                              handleDeleteField("consultant", index)
                            }
                          />
                        ) : null}
                      </div>

                      {!isReadOnly && index === 0 ? (
                        <AddIcon
                          tabIndex={0}
                          id={
                            `pmweb_ProcessProperty_ConsultantList_AddPickList` +
                            `${index}`
                          }
                          onClick={() => pickListHandler("Consultant")}
                          className={`${styles.addIcon} ${styles.addIconCustom}`}
                          style={{
                            height: "var(--line_height) !important",
                            margin: "0",
                          }}
                        />
                      ) : null}
                    </div>
                  </>
                );
              })}
            </div>
          </div>

          <div className={`${styles.flexRow} ${styles.peopleSystemRow}`}>
            <div
              className={`${styles.flexColumn} ${styles.peopleSystemColumn}`}
            >
              <div>
                <p
                  className={clsx(
                    styles.fieldTitle,
                    styles.fieldText,
                    styles.title
                  )}
                >
                  {t("system")}
                </p>
                {systemValues?.map((element, index) => {
                  return (
                    <div className={styles.flexRow}>
                      {/* <TextField
                      id="PP_System_List"
                      variant="outlined"
                      className={styles.inputField}
                      onChange={(event) =>
                        systemValuesHandler(event.target.value, index)
                      }
                      value={element.SystemName}
                      inputRef={systemRef}
                    onKeyPress={(e) =>
                        FieldValidations(e, 150, systemRef.current, 30)
                      }
                      disabled={isReadOnly}
                    */}
                      <TextInput
                        inputValue={element.SystemName}
                        ariaLabel={"System Field"}
                        classTag={
                          direction === RTL_DIRECTION
                            ? arabicStyles.inputField
                            : styles.inputField
                        }
                        onChangeEvent={(event) =>
                          systemValuesHandler(event.target.value, index)
                        }
                        name="System_List"
                        idTag={`pmweb_ProcessProperty_SystemList` + `${index}`}
                        errorStatement={
                          element.SystemName?.length === 0 &&
                          isSaveClicked &&
                          systemValues?.length > 1
                            ? t("pleaseFillSomeValue")
                            : ""
                        }
                        errorSeverity={
                          element.SystemName?.length === 0 &&
                          isSaveClicked &&
                          systemValues?.length > 1
                            ? "error"
                            : ""
                        }
                        errorType={0}
                        inlineError={true}
                        inputRef={systemRef}
                        onKeyPress={(e) =>
                          FieldValidations(e, 150, systemRef.current, 30)
                        }
                        readOnlyCondition={isReadOnly}
                      />

                      {!isReadOnly && systemValues?.length > 1 ? (
                        <DeleteOutlinedIcon
                          tabIndex={0}
                          id={
                            `pmweb_ProcessProperty_SystemList_DeleteField` +
                            `${index}`
                          }
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.deleteIcon
                              : styles.deleteIcon
                          }
                          onClick={() => handleDeleteField("system", index)}
                        />
                      ) : null}

                      {
                        //!isReadOnly && systemValues.length - 1 === index ? (
                        !isReadOnly && index === 0 ? (
                          <AddIcon
                            tabIndex={0}
                            id={
                              `pmweb_ProcessProperty_SystemList_AddField` +
                              `${index}`
                            }
                            onClick={() => handleAddField("system", index)}
                            className={styles.addIcon}
                            style={{ height: "var(--line_height)" }}
                          />
                        ) : null
                      }
                    </div>
                  );
                })}
              </div>

              <div>
                <p
                  className={clsx(
                    styles.fieldTitle,
                    styles.fieldText,
                    styles.title
                  )}
                >
                  {t("consumer")}
                </p>
                {consumerValues?.map((element, index) => {
                  return (
                    <div className={styles.flexRow}>
                      <div>
                        <TextInput
                          ariaLabel={"Consumer Field"}
                          inputValue={element.ConsumerName}
                          classTag={
                            direction === RTL_DIRECTION
                              ? arabicStyles.inputField
                              : styles.inputField
                          }
                          onChangeEvent={(event) =>
                            consumerValuesHandler(event.target.value, index)
                          }
                          name="Consumer_List"
                          idTag={
                            `pmweb_ProcessProperty_ConsumerList` + `${index}`
                          }
                          style={{
                            width: "100%",
                            height: "56px",
                          }}
                          errorStatement={
                            element.ConsumerName?.length === 0 &&
                            isSaveClicked &&
                            consumerValues?.length > 1
                              ? t("pleaseFillSomeValue")
                              : ""
                          }
                          errorSeverity={
                            element.ConsumerName?.length === 0 &&
                            isSaveClicked &&
                            consumerValues?.length > 1
                              ? "error"
                              : ""
                          }
                          errorType={0}
                          inlineError={true}
                          inputRef={consumerRef}
                          onKeyPress={(e) =>
                            FieldValidations(e, 150, consumerRef.current, 30)
                          }
                          readOnlyCondition={isReadOnly}
                        />
                        {/* <TextField
                        id="PP_Consumer_List"
                        variant="outlined"
                        className={styles.inputField}
                        onChange={(event) =>
                          consumerValuesHandler(event.target.value, index)
                        }
                        value={element.ConsumerName}
                        inputRef={consumerRef}
                        onKeyPress={(e) =>
                          FieldValidations(e, 150, consumerRef.current, 30)
                        }
                        disabled={isReadOnly}
                      /> */}
                        {/* {element.ConsumerName?.length === 0 && isSaveClicked ? (
                        <p style={{ color: "red" }}>
                          Please fill some value to proceed.
                        </p>
                      ) : null} */}
                      </div>
                      {!isReadOnly && consumerValues?.length > 1 ? (
                        <DeleteOutlinedIcon
                          tabIndex={0}
                          id={
                            `pmweb_ProcessProperty_ConsumerList_DeleteField` +
                            `${index}`
                          }
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.deleteIcon
                              : styles.deleteIcon
                          }
                          onClick={() => handleDeleteField("consumer", index)}
                        />
                      ) : null}

                      {
                        //!isReadOnly && consumerValues.length - 1 === index ? (
                        !isReadOnly && index === 0 ? (
                          <AddIcon
                            tabIndex={0}
                            id={
                              `pmweb_ProcessProperty_ConsumerList_AddField` +
                              `${index}`
                            }
                            onClick={() => handleAddField("consumer", index)}
                            className={styles.addIcon}
                            style={{ height: "var(--line_height)" }}
                          />
                        ) : null
                      }
                    </div>
                  );
                })}
              </div>
            </div>
            {
              //Modified on 29/08/2023  for bug_id:131409
            }
            <div
              className={clsx(
                `${styles.flexColumn} ${styles.peopleSystemColumn}`,
                direction === RTL_DIRECTION
                  ? arabicStyles.providerInput
                  : styles.providerInput
              )}
            >
              <p
                className={clsx(
                  styles.fieldTitle,
                  styles.fieldText,
                  styles.title
                )}
              >
                {t("provider")}
              </p>
              {providerValues?.map((element, index) => {
                return (
                  <div className={styles.flexRow}>
                    {/* <TextField
                      id="PP_Provider_List"
                      variant="outlined"
                      className={styles.inputField}
                      onChange={(event) =>
                        providerValuesHandler(event.target.value, index)
                      }
                      value={element.ProviderName}
                      inputRef={providerRef}
                      onKeyPress={(e) =>
                        FieldValidations(e, 150, providerRef.current, 30)
                      }
                      disabled={isReadOnly}
                    /> */}
                    <TextInput
                      inputValue={element.ProviderName}
                      ariaLabel={"Provider Field"}
                      classTag={
                        direction === RTL_DIRECTION
                          ? arabicStyles.inputField
                          : styles.inputField
                      }
                      onChangeEvent={(event) =>
                        providerValuesHandler(event.target.value, index)
                      }
                      name="Provider_List"
                      idTag={`pmweb_ProcessProperty_ProviderList` + `${index}`}
                      errorStatement={
                        element.ProviderName?.length === 0 &&
                        isSaveClicked &&
                        providerValues?.length > 1
                          ? t("pleaseFillSomeValue")
                          : ""
                      }
                      errorSeverity={
                        element.ProviderName?.length === 0 &&
                        isSaveClicked &&
                        providerValues?.length > 1
                          ? "error"
                          : ""
                      }
                      errorType={0}
                      inlineError={true}
                      inputRef={providerRef}
                      onKeyPress={(e) =>
                        FieldValidations(e, 150, providerRef.current, 30)
                      }
                      readOnlyCondition={isReadOnly}
                    />
                    {!isReadOnly && providerValues?.length > 1 ? (
                      <DeleteOutlinedIcon
                        tabIndex={0}
                        id={
                          `pmweb_ProcessProperty_ProviderList_DeleteField` +
                          `${index}`
                        }
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.deleteIcon
                            : styles.deleteIcon
                        }
                        onClick={() => handleDeleteField("provider", index)}
                      />
                    ) : null}

                    {
                      //!isReadOnly && providerValues.length - 1 === index ? (
                      !isReadOnly && index === 0 ? (
                        <AddIcon
                          tabIndex={0}
                          id={
                            `pmweb_ProcessProperty_ProviderList_AddField` +
                            `${index}`
                          }
                          onClick={() => handleAddField("provider", index)}
                          className={styles.addIcon}
                          style={{ height: "var(--line_height)" }}
                        />
                      ) : null
                    }
                  </div>
                );
              })}
            </div>
            {
              //till here for bug_id:131409
            }
          </div>

          {/* <div className={styles.flexRow}>
            <div className={styles.flexColumn}>
              <p
                className={clsx(
                  styles.fieldTitle,
                  styles.fieldText,
                  styles.title
                )}
              >
                {t("consumer")}
              </p>
              {consumerValues?.map((element, index) => {
                return (
                  <div className={styles.flexRow}>
                    <div>
                      <TextInput
                        ariaLabel={"Consumer Field"}
                        inputValue={element.ConsumerName}
                        classTag={
                          direction === RTL_DIRECTION
                            ? arabicStyles.inputField
                            : styles.inputField
                        }
                        onChangeEvent={(event) =>
                          consumerValuesHandler(event.target.value, index)
                        }
                        name="Consumer_List"
                        idTag={
                          `pmweb_ProcessProperty_ConsumerList` + `${index}`
                        }
                        style={{
                          width: "100%",
                          height: "56px",
                        }}
                        errorStatement={
                          element.ConsumerName?.length === 0 &&
                          isSaveClicked &&
                          consumerValues?.length > 1
                            ? t("pleaseFillSomeValue")
                            : ""
                        }
                        errorSeverity={
                          element.ConsumerName?.length === 0 &&
                          isSaveClicked &&
                          consumerValues?.length > 1
                            ? "error"
                            : ""
                        }
                        errorType={0}
                        inlineError={true}
                        inputRef={consumerRef}
                        onKeyPress={(e) =>
                          FieldValidations(e, 150, consumerRef.current, 30)
                        }
                        disabled={isReadOnly}
                      />
                     
                    </div>
                    {!isReadOnly && consumerValues?.length > 1 ? (
                      <DeleteOutlinedIcon
                        tabIndex={0}
                        id={
                          `pmweb_ProcessProperty_ConsumerList_DeleteField` +
                          `${index}`
                        }
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.deleteIcon
                            : styles.deleteIcon
                        }
                        onClick={() => handleDeleteField("consumer", index)}
                      />
                    ) : null}

                    {!isReadOnly && consumerValues.length - 1 === index ? (
                      <AddIcon
                        tabIndex={0}
                        id={
                          `pmweb_ProcessProperty_ConsumerList_AddField` +
                          `${index}`
                        }
                        onClick={() => handleAddField("consumer", index)}
                        className={styles.addIcon}
                        style={{ height: "var(--line_height)" }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div> */}

          <p
            className={clsx(
              styles.heading,
              styles.keyPerformanceIndicesHeading
            )}
          >
            {t("keyPerformanceIndices")}
          </p>
          <div className={styles.flexRow}>
            <div className={styles.flexColumn}>
              <div className={styles.flexRow}>
                <p
                  className={clsx(
                    styles.fieldTitle,
                    styles.fieldText,
                    styles.title
                  )}
                >
                  {t("costInDollars")}
                </p>
                <span className={styles.asterisk}>*</span>
              </div>
              {/* Bug 118303 [21-02-2023] Changed the InputBase to TextField*/}
              {/* modified on 19/09/23 for BugId 137240 */}
              {/* <TextField
                ref={costRef}
                id={"pmweb_ProcessProperty_CostValue"}
                variant="outlined"
                type="number"
                className={clsx(
                  direction === RTL_DIRECTION
                    ? arabicStyles.ownerEmailIdInput
                    : styles.ownerEmailIdInput,
                  styles.costInput
                )}
                onChange={(event) => {
                  setCostValue(event.target.value);
                  setIsChanged(true);
                }}
                value={costValue}
                InputProps={{
                  inputProps: { min: 0, "aria-label": "Cost in Dollars" },
                }}
                onKeyPress={(e) => {
                  if (e?.key === "-" || e?.key === "+" || e?.key === "e") {
                    e.preventDefault();
                  }
                  FieldValidations(e, 130, costRef.current, 30);
                }}
                onKeyPress={(event) => {
                  if (
                    event?.key === "-" ||
                    event?.key === "+" ||
                    event?.key === "e"
                  ) {
                    event.preventDefault();
                  }
                }}
                disabled={isReadOnly}
              /> */}
              <TextInput
                type="number"
                classTag={clsx(styles.ownerEmailIdInput, styles.costInput)}
                readOnlyCondition={isReadOnly}
                inputValue={costValue}
                name="cost"
                idTag="pmweb_ProcessProperty_CostValue"
                inputRef={costRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 130, costRef.current, 30)
                }
                onChangeEvent={(e) => {
                  setCostValue(e.target.value);
                  setIsChanged(true);
                  setCostError(
                    !validateRegex(e.target.value, REGEX.FloatPositive)
                  );
                }}
                ariaLabel={`${t("cost")} ${t("in $")}`}
              />
              {
                // added on 19/09/23 for BugId 137240
                costError ? (
                  <p style={{ color: "#b52a2a" }}>
                    {t("pleaseEnterACostInNumeric")}
                  </p>
                ) : null
              }
            </div>
            <div className={styles.flexColumn}>
              <div className={styles.flexRow}>
                <p
                  className={clsx(
                    styles.fieldTitle,
                    styles.fieldText,
                    styles.title
                  )}
                >
                  {t("turnaroundTime")}
                </p>
                <span className={styles.asterisk}>*</span>
              </div>
              <div className={styles.flexRow}>
                {/*    <InputBase
                  id="PP_Days_Value"
                  variant="outlined"
                  className={clsx(
                    styles.ownerEmailIdInput,
                    direction === RTL_DIRECTION
                      ? arabicStyles.turnAroundTimeInput
                      : styles.turnAroundTimeInput
                  )}
                  type="number"
                  onChange={(event) => turnAroundTimeHandler(event, "Days")}
                  value={turnAroundTime && turnAroundTime.Days}
                /> */}
                <TextField
                  id={"pmweb_ProcessProperty_DaysValue"}
                  variant="outlined"
                  className={clsx(
                    styles.ownerEmailIdInput,
                    styles.turnAroundTimeInput
                  )}
                  type="number"
                  onChange={(event) => turnAroundTimeHandler(event, "Days")}
                  value={turnAroundTime && turnAroundTime.Days}
                  InputProps={{
                    inputProps: { min: 0, "aria-label": "Days Value" },
                  }}
                  onKeyPress={(event) => {
                    if (
                      event?.key === "-" ||
                      event?.key === "+" ||
                      event?.key === "e"
                    ) {
                      event.preventDefault();
                    }
                  }}
                  disabled={isReadOnly}
                />
                <p
                  className={clsx(
                    styles.fieldTitle,
                    styles.blackColor,
                    direction === RTL_DIRECTION
                      ? arabicStyles.turnaroundTimeMargin
                      : styles.turnaroundTimeMargin
                  )}
                >
                  {t("days")}
                </p>
                {/* <InputBase
                  id="PP_Hours_Value"
                  variant="outlined"
                  className={clsx(
                    styles.ownerEmailIdInput,
                    styles.turnAroundTimeInput
                  )}
                  type="number"
                  onChange={(event) => turnAroundTimeHandler(event, "Hours")}
                  value={turnAroundTime && turnAroundTime.Hours}
                /> */}
                <TextField
                  id={"pmweb_ProcessProperty_HoursValue"}
                  variant="outlined"
                  className={clsx(
                    styles.ownerEmailIdInput,
                    styles.turnAroundTimeInput
                  )}
                  type="text"
                  onChange={(event) => turnAroundTimeHandler(event, "Hours")}
                  value={turnAroundTime && turnAroundTime.Hours}
                  InputProps={{
                    inputProps: { min: 0, "aria-label": "Hours Value" },
                  }}
                  onKeyPress={(event) => {
                    if (event?.key === "-" || event?.key === "+") {
                      event.preventDefault();
                    }
                  }}
                  disabled={isReadOnly}
                />
                <p
                  className={clsx(
                    styles.fieldTitle,
                    styles.blackColor,
                    direction === RTL_DIRECTION
                      ? arabicStyles.turnaroundTimeMargin
                      : styles.turnaroundTimeMargin
                  )}
                >
                  {t("hours")}
                </p>
                {/* <InputBase
                  id="PP_Minutes_Value"
                  variant="outlined"
                  className={clsx(
                    styles.ownerEmailIdInput,
                    styles.turnAroundTimeInput
                  )}
                  type="number"
                  onChange={(event) => turnAroundTimeHandler(event, "Minutes")}
                  value={turnAroundTime && turnAroundTime.Minutes}
                /> */}
                <TextField
                  id={"pmweb_ProcessProperty_MinutesValue"}
                  variant="outlined"
                  className={clsx(
                    styles.ownerEmailIdInput,
                    styles.turnAroundTimeInput
                  )}
                  type="text"
                  onChange={(event) => turnAroundTimeHandler(event, "Minutes")}
                  value={turnAroundTime && turnAroundTime.Minutes}
                  InputProps={{
                    inputProps: { min: 0, "aria-label": "Minutes Value" },
                  }}
                  onKeyPress={(event) => {
                    if (event?.key === "-" || event?.key === "+") {
                      event.preventDefault();
                    }
                  }}
                  disabled={isReadOnly}
                />

                <p
                  className={clsx(
                    styles.fieldTitle,
                    styles.blackColor,
                    direction === RTL_DIRECTION
                      ? arabicStyles.turnaroundTimeMargin
                      : styles.turnaroundTimeMargin
                  )}
                >
                  {t("minutesInCapital")}
                </p>
                <CustomizedDropdown
                  id={"pmweb_ProcessProperty_CalendarDropdown"}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.escalateToFieldsDropdown
                      : styles.escalateToFieldsDropdown
                  }
                  value={turnAroundTime && turnAroundTime.TATCalFlag}
                  onChange={(event) =>
                    turnAroundTimeHandler(event, "TATCalFlag")
                  }
                  isNotMandatory={true}
                  disabled={isReadOnly}
                  hideDefaultSelect={true}
                >
                  {calendarTypeOptions &&
                    calendarTypeOptions.map((element) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.menuItemStyles
                              : styles.menuItemStyles
                          }
                          key={element.value}
                          value={element.value}
                        >
                          {element.label}
                        </MenuItem>
                      );
                    })}
                </CustomizedDropdown>
              </div>
            </div>
          </div>
          <div className={styles.flexColumn}>
            <p
              className={clsx(
                styles.fieldTitle,
                styles.fieldText,
                styles.title
              )}
            >
              {t("calendar")}
              <span
                style={{
                  //  color: "red",
                  color:
                    "rgb(181, 42, 42)" /* Added on 7/9/2023 for BUGID: 135911 */,
                  marginLeft: "2px",
                  fontSize: "0.75rem",
                }}
              >
                *
              </span>
            </p>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <CustomizedDropdown
                id={"pmweb_ProcessProperty_CalendarTypeDropdown"}
                className={styles.escalateToFieldsDropdown}
                value={calendarValue}
                onChange={(event) => {
                  setCalendarValue(event.target.value);
                  setIsChanged(true);
                }}
                isNotMandatory={true}
                disabled={isReadOnly}
                hideDefaultSelect={true}
              >
                {localCalendarList &&
                  localCalendarList.map((element, index) => {
                    return (
                      <MenuItem
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.menuItemStyles
                            : styles.menuItemStyles
                        }
                        key={index}
                        value={
                          element.DefinedWithProcessDefId !== "0"
                            ? "L" + element.CalendarId
                            : "G" + element.CalendarId
                        }
                      >
                        {element.CalendarName}
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown>
              {!isReadOnly && (
                <AddIcon
                  tabIndex={0}
                  id={"pmweb_ProcessProperty_OpenCalendarMF"}
                  onClick={() => openCalenderMf()}
                  classes={{
                    root: styles.addIcon,
                  }}
                  style={{ height: "var(--line_height)" }}
                />
              )}
              {!isReadOnly && (
                <>
                  {/* <EditOutlinedIcon
                  id="editIcon_1"
                  classes={{
                    root: styles.editIcon,
                  }}
                  onClick={(e) => handleCalendarEdit()}
                /> */}
                  <EditIcon
                    tabIndex={0}
                    id="pmweb_ProcessProperty_EditCalendarBtn"
                    classes={{
                      root: styles.editIcon,
                    }}
                    onClick={(e) => handleCalendarEdit()}
                    style={{ width: "2%" }}
                  />
                </>
              )}
            </div>
          </div>
          <div className={clsx(styles.flexColumn, styles.marginBottom)}>
            <p
              className={clsx(
                styles.fieldTitle,
                styles.fieldText,
                styles.title
              )}
            >
              {t("description")}
            </p>
            <div style={{ height: "27vh" }}>
              <SunEditor
                tabIndex={0}
                id="PP_Add_description"
                width="410px"
                customHeight="6rem"
                autoFocus={false}
                placeholder={t("placeholderDescription")}
                value={description}
                getValue={(event) => {
                  setDescription(event.target.innerHTML);
                  setIsChanged(true);
                }}
                handleChange={handleChange} //Modified on 27/09/2023, bug_id:135305
                disabled={isReadOnly}
              />
            </div>
          </div>
          <div className={styles.footerDiv}>
            <div
              className={clsx(
                styles.flexRow,
                direction === RTL_DIRECTION
                  ? arabicStyles.footerSubDiv
                  : styles.footerSubDiv
              )}
            >
              {!isReadOnly && (
                <button
                  id="pmweb_ProcessProperty_CancelBtn"
                  tabIndex={0}
                  disabled={!isChanged}
                  className={
                    isChanged
                      ? styles.cancelBtn
                      : clsx(
                          direction === RTL_DIRECTION
                            ? arabicStyles.disabledBtn
                            : styles.disabledBtn,
                          styles.cancelBtn
                        )
                  }
                  onClick={handleCancelChanges}
                >
                  {t("cancel")}
                </button>
              )}
              {!isReadOnly && (
                <button
                  id="pmweb_ProcessProperty_SaveBtn"
                  tabIndex={0}
                  // modified on 19/09/23 for BugId 137240
                  disabled={!isChanged || emailError || costError}
                  // modified on 19/09/23 for BugId 137240
                  className={
                    !isChanged || emailError || costError
                      ? clsx(
                          direction === RTL_DIRECTION
                            ? arabicStyles.disabledBtn
                            : styles.disabledBtn,
                          styles.saveBtn
                        )
                      : styles.saveBtn
                  }
                  onClick={handleSaveChanges}
                >
                  {t("save")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProcessProperties;
