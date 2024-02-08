// #BugID - 109982 (Trigger Bug)
// #BugDescription - Added a condition to check if description is added or not and prevented trigger from adding.
// #BugID - 116663
// #BugDescription - Moved the condition for closing modal when this component is opened in activity rules file.
// #BugID - 115602
// #BugDescription - Validation applied for constant value.
// Changes made to solve Bug 119487 - Trigger: modified trigger name is not saving
// Changes made to solve Bug 121951 - Pmweb - Mail trigger -> not able to modify and saved when we imported the process
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, ClickAwayListener } from "@material-ui/core";
import styles from "./trigger.module.css";
import { connect, useDispatch, useSelector } from "react-redux";
import * as actionCreators from "../../../redux-store/actions/Trigger";
import {
  triggerTypeOptions,
  triggerTypeName,
} from "../../../utility/ProcessSettings/Triggers/triggerTypeOptions";
import { LatestVersionOfProcess } from "../../../utility/abstarctView/checkLatestVersion";
import SearchComponent from "../../../UI/Search Component/index";
import axios from "axios";
import {
  ENDPOINT_GETTRIGGER,
  SERVER_URL,
  ENDPOINT_ADDTRIGGER,
  ENDPOINT_REMOVETRIGGER,
  ENDPOINT_MODIFYTRIGGER,
  RTL_DIRECTION,
  STATE_CREATED,
  STATE_EDITED,
  STATE_ADDED,
  ADD_OPTION,
  EDIT_OPTION,
  PROCESSTYPE_REGISTERED,
} from "../../../Constants/appConstants";
import { getTriggerPropObj } from "../../../utility/ProcessSettings/Triggers/getTriggerPropObj";
import NoTriggerScreen from "./NoTriggerScreen";
import FileIcon from "../../../assets/HomePage/processIcon.svg";
import NoSelectedTriggerScreen from "./NoSelectedTriggerScreen";
import ButtonDropdown from "../../../UI/ButtonDropdown";
import TriggerListView from "./TriggerListView";
import TriggerMainFormView from "./TriggerMainForm";
import { store, useGlobalState } from "state-pool";
import CircularProgress from "@material-ui/core/CircularProgress";
import { getSelectedTriggerProperties } from "../../../utility/ProcessSettings/Triggers/getSelectedTriggerProperties";
import { encode_utf8, decode_utf8 } from "../../../utility/UTF8EncodeDecoder";
import {
  TRIGGER_TYPE_CHILDWORKITEM,
  TRIGGER_TYPE_DATAENTRY,
  TRIGGER_TYPE_EXCEPTION,
  TRIGGER_TYPE_EXECUTE,
  TRIGGER_TYPE_GENERATERESPONSE,
  TRIGGER_TYPE_LAUNCHAPP,
  TRIGGER_TYPE_MAIL,
  TRIGGER_TYPE_SET,
} from "../../../Constants/triggerConstants";
import "./commonTrigger.css";
import clsx from "clsx";
import DefaultModal from "../../../UI/Modal/Modal";
import ObjectDependencies from "../../../UI/ObjectDependencyModal";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import {
  OpenProcessSliceValue,
  setOpenProcess,
} from "../../../redux-store/slices/OpenProcessSlice";
import {
  checkRegex,
  getIncorrectLenErrMsg,
  getIncorrectRegexErrMsg,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import {
  PMWEB_ARB_REGEX,
  PMWEB_REGEX,
  validateRegex,
} from "../../../validators/validator";

function TriggerDefinition(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const variableDefinition = localLoadedProcessData?.Variable;
  let { t } = useTranslation();
  const { hideLeftPanel, handleCloseModal, isModalOpen, isReadOnly } = props;
  const direction = `${t("HTML_DIR")}`;
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState();
  const [descInput, setDescInput] = useState("");
  const [showTypeOption, setShowTypeOptions] = useState(false);
  const [selectedField, setSelectedField] = useState();
  const [disableNameAndType, setDisableNameAndType] = useState(false);
  const [triggerData, setTriggerData] = useState([]);
  const [addedTriggerTypes, setAddedTriggerTypes] = useState([]);
  const [spinner, setspinner] = useState(true);
  const [searchedTriggerData, setSearchedTriggerData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(null);
  const [errorMsg, setErrorMsg] = useState({
    triggerName: "",
    triggerDesc: "",
  });
  const triggerTypeOptionList = [
    TRIGGER_TYPE_MAIL,
    TRIGGER_TYPE_EXECUTE,
    TRIGGER_TYPE_LAUNCHAPP,
    TRIGGER_TYPE_DATAENTRY,
    TRIGGER_TYPE_SET,
    TRIGGER_TYPE_GENERATERESPONSE,
    TRIGGER_TYPE_EXCEPTION,
    TRIGGER_TYPE_CHILDWORKITEM,
  ];
  let readOnlyProcess =
    isReadOnly ||
    localLoadedProcessData?.ProcessType === PROCESSTYPE_REGISTERED ||
    localLoadedProcessData?.ProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;
  // added by mahtab
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [taskAssociation, setTaskAssociation] = useState([]);
  // Added on 16-05-23 for bug 127902
  const openProcessData = useSelector(OpenProcessSliceValue);
  const [localState, setLocalState] = useState(null);
  // till here for bug 127902
  const dispatch = useDispatch();
  // const [showAddTriggerButtonScreen, setShowAddTriggerButtonScreen] =
  //   useState(false);

  // Added on 16-05-23 for bug 127902
  useEffect(() => {
    setLocalState(openProcessData.loadedData);
  }, [openProcessData.loadedData]);
  // till here for bug 127902

  //api call to load existing triggers
  useEffect(() => {
    // code edited on 7 Nov 2022 for BugId 116221
    if (localLoadedProcessData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            ENDPOINT_GETTRIGGER +
            "/" +
            localLoadedProcessData.ProcessDefId +
            "/" +
            localLoadedProcessData.ProcessType
        )
        .then((res) => {
          if (res.status === 200) {
            // Code added for decoding description data when fetching trigger data.
            let data = res.data?.TriggerList;
            data?.forEach((element) => {
              element.Description = decode_utf8(element.Description);
            });
            //load Trigger Data
            setTriggerData(data ? data : []);
            //load Template List in redux
            props.setTemplates(res.data?.Templates ? res.data.Templates : []);
          }
          setspinner(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    setspinner(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  //load content from selected field to various states
  useEffect(() => {
    if (selectedField) {
      setTypeInput(selectedField.type);
      if (selectedField.status === STATE_CREATED) {
        //if new temporary trigger is created, set focus on name Input field and clear the values in name Input and desc Input state
        document.getElementById("pmweb_triggerMainForm_triggerName")?.focus();
        setNameInput("");
        setDescInput("");
        setDisableNameAndType(false);
      } else {
        setDisableNameAndType(true);
      }
    }
  }, [selectedField]);

  //group triggers according to their types
  useEffect(() => {
    let triggerTypeArr = [];
    // triggerTypeOptionList.map((option) => {
    triggerTypeOptionList?.forEach((option) => {
      triggerData?.length > 0 &&
        triggerData.map((trigger) => {
          if (
            trigger.TriggerType === option &&
            !triggerTypeArr.includes(option)
          ) {
            triggerTypeArr.push(option);
          }
        });
    });
    setAddedTriggerTypes(triggerTypeArr);
    setSearchTerm("");
    clearResult();
  }, [triggerData]);

  //if some changes have occurred in definition part of trigger, which has been added to database, then redux value is set from definition component, and used here.
  useEffect(() => {
    if (props.triggerEdited) {
      if (selectedField) {
        //change status of trigger from added or created to edited
        setSelectedField((prev) => {
          return { ...prev, status: STATE_EDITED };
        });
      }
    }
  }, [props.triggerEdited]);

  //clickaway listener func to hide dropdown, that appears on click of +Add trigger button
  const handleClickAway = () => {
    setShowTypeOptions(false);
  };

  //create new temporary trigger on screen
  const createNewTrigger = (triggerType) => {
    if (triggerType) {
      setDisableNameAndType(false);
    }
    handleClickAway();
    setTypeInput(triggerType);
    let indexVal;
    //to remove existing temporary triggers from list, before adding new trigger temporary trigger
    triggerData?.forEach((trigger, index) => {
      if (trigger.status && trigger.status === STATE_CREATED) {
        indexVal = index;
      }
    });
    if (indexVal >= 0) {
      setTriggerData((prev) => {
        let newData = [];
        if (prev.length > 0) {
          newData = [...prev];
        }
        newData.splice(indexVal, 1);
        return newData;
      });
    }
    //calculate maxId of trigger in triggerData
    let maxId = 0;
    triggerData?.forEach((trigger) => {
      if (trigger.TriggerId > maxId) {
        maxId = trigger.TriggerId;
      }
    });
    let newId = +maxId + 1;
    //push temporary trigger in triggerData
    setTriggerData((prev) => {
      let newData = [];
      if (prev.length > 0) {
        newData = [...prev];
      }
      newData.push({
        TriggerId: newId,
        TriggerName: t("newTrigger"),
        TriggerType: triggerType,
        status: STATE_CREATED,
      });
      return newData;
    });
    //set temporary trigger as selected field
    setSelectedField({
      id: newId,
      name: t("newTrigger"),
      type: triggerType,
      status: STATE_CREATED,
    });
    props.setReload(true);
    setErrorMsg({
      triggerName: "",
      triggerDesc: "",
    });
  };

  //on field selection, set selected field with existing status and if status is not present, then added status is applied.
  const onFieldSelection = (data) => {
    setSelectedField({
      id: data.TriggerId,
      name: data.TriggerName,
      type: data.TriggerType,
      status: data.status ? data.status : STATE_ADDED,
    });
    setNameInput(data.TriggerName);
    setDescInput(data.Description);
    setTypeInput(data.TriggerType);
    //set properties of selected field by setting the values in redux
    if (data.Configurations) {
      let properties = getSelectedTriggerProperties(
        data.TriggerType,
        data.Configurations,
        variableDefinition
      );
      props.setTriggerEdited(false);
      props[triggerTypeOptions(data.TriggerType)[3]](properties);
      props.setInitialValues(true);
    } else {
      props.setReload(true);
    }
  };

  /*code updated on 30 September 2022 for BugId 116352 */
  ///code updated on 14 October 2022 for BugId 116594
  const validateFunc = () => {
    let requiredFieldsFilled = true;
    if (props[triggerTypeOptions(typeInput)[0]]) {
      //to check whether all the mandatory fields are filled in definition
      triggerTypeOptions(typeInput)[2]?.forEach((field) => {
        if (
          props[triggerTypeOptions(typeInput)[0]][field] === null ||
          props[triggerTypeOptions(typeInput)[0]][field] === "" ||
          !props[triggerTypeOptions(typeInput)[0]][field]
        ) {
          requiredFieldsFilled = false;
        }
      });
    }
    if (
      typeInput === TRIGGER_TYPE_SET ||
      typeInput === TRIGGER_TYPE_DATAENTRY
    ) {
      //to check whether array has some values

      //Added  on 03/08/2023, bug_id:131962

      let filterObj = props[triggerTypeOptions(typeInput)[0]].filter(
        (d) => d.field === null || d.value === null
      );

      if (
        props[triggerTypeOptions(typeInput)[0]].length < 1 ||
        filterObj.length > 0
      ) {
        requiredFieldsFilled = false;
      }
    }
    if (typeInput === TRIGGER_TYPE_CHILDWORKITEM) {
      let tempVar = props[triggerTypeOptions(typeInput)[0]];
      if (tempVar.list?.length < 1) {
        requiredFieldsFilled = false;
      }
      triggerTypeOptions(typeInput)[2]?.forEach((field1) => {
        if (
          props[triggerTypeOptions(typeInput)[0]][field1] === null ||
          props[triggerTypeOptions(typeInput)[0]][field1]?.trim() === "" ||
          !props[triggerTypeOptions(typeInput)[0]][field1]
        ) {
          requiredFieldsFilled = false;
        }
      });
    }

    let errMsgObj = {};
    //function to check whether all required fields are filled or not
    let [errMsg, isValid] = validateData(nameInput, "triggerName", true, 50);
    if (!isValid) {
      document.getElementById("pmweb_triggerMainForm_triggerName")?.focus();
    }
    let [errMsgDesc, isValidDesc] = validateData(
      descInput,
      "triggerDesc",
      false,
      255
    );
    if (!isValidDesc) {
      document
        .getElementById("pmweb_triggerMainForm_trigger_description")
        ?.focus();
    }
    errMsgObj = { triggerName: errMsg, triggerDesc: errMsgDesc };
    setErrorMsg(errMsgObj);
    if (
      isValid &&
      isValidDesc &&
      props[triggerTypeOptions(typeInput)[0]] &&
      !requiredFieldsFilled
    ) {
      dispatch(
        setToastDataFunc({
          message: t("requiredTriggerDefinitionMsg"),
          severity: "error",
          open: true,
        })
      );
    } else if (isValid && isValidDesc) {
      return 1;
    }
  };

  // Function to get maximum trigger id.
  const getMaxTriggerId = (triggerDataArr) => {
    let maxId = 0;
    triggerDataArr?.forEach((trigger) => {
      if (trigger.TriggerId > maxId) {
        maxId = trigger.TriggerId;
      }
    });
    return +maxId;
  };

  const ValidateEmail = (name, type) => {
    // modified on 21/10/23 for BugId 139644
    // var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // if (!name.match(mailformat)) {
    if (!validateRegex(name, PMWEB_REGEX.EmailId)) {
      return false;
    } else {
      return true;
    }
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleModalKeyDown = (e) => {
    if (isModalOpen) {
      if (e.keyCode === 13 && e.target.name === "addTriggerBtn") {
        addModifyTriggerFunc(ADD_OPTION);
      } else if (e.keyCode === 27) {
        handleCloseModal();
        e.stopPropagation();
      }
    }
  };

  // Function that runs when the handleKeyDown value changes.
  useEffect(() => {
    document.addEventListener("keydown", handleModalKeyDown);
    return () => document.removeEventListener("keydown", handleModalKeyDown);
  }, [handleModalKeyDown]);

  // to add or modify trigger in database using api
  const addModifyTriggerFunc = (type) => {
    let validateVal = validateFunc();
    let isValid = true;
    let isPresent = false;
    let validateObj = {
      from: true,
      to: true,
      cc: true,
      bcc: true,
    };
    if (validateVal === 1) {
      //get properties json of specific trigger type
      const [triggerProperties, localProps] = getTriggerPropObj(
        typeInput,
        props[triggerTypeOptions(typeInput)[0]]
      );

      if (triggerProperties?.mailTrigProp) {
        if (triggerProperties.mailTrigProp.mailInfo.varFieldTypeFrom == "C") {
          validateObj = {
            ...validateObj,
            from: ValidateEmail(
              triggerProperties.mailTrigProp.mailInfo.fromUser,
              "fromUser"
            ),
          };
        }
        if (triggerProperties.mailTrigProp.mailInfo.varFieldTypeTo == "C") {
          validateObj = {
            ...validateObj,
            to: ValidateEmail(
              triggerProperties.mailTrigProp.mailInfo.toUser,
              "toUser"
            ),
          };
        }
        if (triggerProperties.mailTrigProp.mailInfo.varFieldTypeCC == "C") {
          if (triggerProperties.mailTrigProp.mailInfo.ccUser?.trim() === "") {
            validateObj = {
              ...validateObj,
              cc: false,
            };
          } else if (triggerProperties.mailTrigProp.mailInfo.ccUser) {
            validateObj = {
              ...validateObj,
              cc: ValidateEmail(
                triggerProperties.mailTrigProp.mailInfo.ccUser,
                "ccUser"
              ),
            };
          }
        }
        if (triggerProperties.mailTrigProp.mailInfo.varFieldTypeBCC == "C") {
          if (triggerProperties.mailTrigProp.mailInfo.bccUser?.trim() === "") {
            validateObj = {
              ...validateObj,
              bcc: false,
            };
          } else if (triggerProperties.mailTrigProp.mailInfo.bccUser) {
            validateObj = {
              ...validateObj,
              bcc: ValidateEmail(
                triggerProperties.mailTrigProp.mailInfo.bccUser,
                "bccUser"
              ),
            };
          }
        }

        if (
          validateObj.from &&
          validateObj.to &&
          validateObj.cc &&
          validateObj.bcc
        ) {
          isValid = true;
        } else {
          isValid = false;
        }
      } else {
        isValid = true;
      }

      // bug 131815 resolved with the below changes
      //Modified on 23/06/2023, bug_id:130815

      // Coded ADDED to solve Bug 127296 dated 19th May 2023
      /*  for (let i = 0; i < localLoadedProcessData?.TriggerList?.length; i++) {
        if (localLoadedProcessData.TriggerList[i].TriggerName === nameInput) {
          isPresent = true;
          isValid = false;
          setNameInput("");
          document.getElementById("trigger_name").focus();
          break;
        }
      } */
      // till here

      if (type === ADD_OPTION) {
        for (let i = 0; i < localLoadedProcessData?.TriggerList?.length; i++) {
          if (localLoadedProcessData.TriggerList[i].TriggerName === nameInput) {
            isPresent = true;
            isValid = false;
            setNameInput("");
            document
              .getElementById("pmweb_triggerMainForm_triggerName")
              ?.focus();
            break;
          }
        }
      }

      if (isValid && !isPresent) {
        const jsonBody = {
          processDefId: localLoadedProcessData?.ProcessDefId,
          triggerName: nameInput,
          triggerId: hideLeftPanel
            ? `${getMaxTriggerId(triggerData) + 1}`
            : selectedField.id,
          triggerType: typeInput,
          triggerTypeName: t(triggerTypeOptions(typeInput)[0]),
          triggerDesc: encode_utf8(descInput),
          triggerPropInfo: triggerProperties,
        };

        axios
          .post(
            SERVER_URL +
              (type === ADD_OPTION
                ? ENDPOINT_ADDTRIGGER
                : ENDPOINT_MODIFYTRIGGER),
            jsonBody
          )
          .then((res) => {
            if (res?.data?.Status === 0) {
              setSelectedField((prev) => {
                let newData = { ...prev };
                newData.name = nameInput;
                newData.type = typeInput;
                newData.status = STATE_ADDED;
                // modified on 06/09/2023 for BugId 135975
                if (type === ADD_OPTION) {
                  newData.id = res?.data?.TriggerId;
                }
                return newData;
              });
              setTriggerData((prev) => {
                let newData = [...prev];
                newData.forEach((data) => {
                  if (data.TriggerId === selectedField.id) {
                    data.TriggerName = nameInput;
                    data.TriggerType = typeInput;
                    data.Description = descInput;
                    data.Configurations = localProps;
                    data.status = STATE_ADDED;
                    // modified on 06/09/2023 for BugId 135975
                    if (type === ADD_OPTION) {
                      data.TriggerId = res?.data?.TriggerId;
                    }
                  }
                });
                return newData;
              });
              if (type === EDIT_OPTION) {
                //setTriggerEdited to false when trigger is modified
                props.setTriggerEdited(false);
                let newData = JSON.parse(
                  JSON.stringify(localLoadedProcessData)
                );
                newData.TriggerList?.forEach((trigger) => {
                  if (trigger.TriggerId === selectedField.id) {
                    trigger.Description = descInput;
                    trigger.TriggerName = nameInput;
                    trigger.TriggerType = typeInput;
                  }
                });
                setlocalLoadedProcessData(newData);
              } else if (type === ADD_OPTION) {
                let newData = JSON.parse(
                  JSON.stringify(localLoadedProcessData)
                );
                newData.TriggerList.push({
                  Description: descInput,
                  // modified on 06/09/2023 for BugId 135975
                  TriggerId: res?.data?.TriggerId,
                  TriggerName: nameInput,
                  TriggerType: typeInput,
                });
                // Added on 16-05-23 for bug 127902
                if (hideLeftPanel) {
                  let temp = JSON.parse(JSON.stringify(localState));
                  temp.TriggerList.push({
                    Description: descInput,
                    // modified on 06/09/2023 for BugId 135975
                    TriggerId: res?.data?.TriggerId,
                    TriggerName: nameInput,
                    TriggerType: typeInput,
                  });
                  dispatch(setOpenProcess({ loadedData: temp }));
                }
                // till here for bug 127902
                setlocalLoadedProcessData(newData);
                props.setInitialValues(true);
              }
            }
          });
        if (hideLeftPanel) {
          handleCloseModal();
        }
      } else if (isPresent) {
        dispatch(
          setToastDataFunc({
            message: t("sameTriggerName"),
            severity: "error",
            open: true,
          })
        );
      } else {
        dispatch(
          setToastDataFunc({
            message: t("emailInvalidFormat"),
            severity: "error",
            open: true,
          })
        );
      }
    }
  };

  //function to cancel the changes made to the trigger and reset it to its initial values
  const cancelEditTriggerFunc = () => {
    triggerData.forEach((trigger) => {
      if (trigger.TriggerId === selectedField.id) {
        onFieldSelection(trigger);
      }
    });
  };

  //function to delete the temporary trigger
  const cancelAddTriggerFunc = () => {
    if (isModalOpen) {
      handleCloseModal();
    }
    let indexVal;
    triggerData.forEach((trigger, index) => {
      if (trigger.TriggerId === selectedField.id) {
        indexVal = index;
      }
    });
    let newData = [...triggerData];
    newData.splice(indexVal, 1);
    setTriggerData(newData);
    setSelectedField();
    setNameInput("");
    setTypeInput();
    setDescInput("");
  };

  // api call to delete trigger
  const deleteTriggerFunc = () => {
    let jsonBody = {
      processDefId: localLoadedProcessData?.ProcessDefId,
      triggerName: selectedField.name,
      triggerId: selectedField.id,
      triggerType: selectedField.type,
      triggerDesc: descInput,
    };
    axios.post(SERVER_URL + ENDPOINT_REMOVETRIGGER, jsonBody).then((res) => {
      if (res.data.Status === 0) {
        setTaskAssociation(res?.data?.Validations);
        if (res?.data?.Validations?.length > 0) {
          setShowDependencyModal(true);
          return false;
        } else {
          cancelAddTriggerFunc();
          let newData = JSON.parse(JSON.stringify(localLoadedProcessData));
          let indexVal;
          newData.TriggerList?.forEach((trigEl, index) => {
            if (trigEl.TriggerId === selectedField.id) {
              indexVal = index;
            }
          });
          newData.TriggerList.splice(indexVal, 1);
          setlocalLoadedProcessData(newData);
        }
      }
    });
  };

  const onSearchSubmit = (searchVal) => {
    setSearchTerm(null);
    let arr = [];
    let triggerTypeArr = [];
    //code modified for bug_id 143377
    /*triggerData?.forEach((elem) => {
      if (
        elem.TriggerName.toLowerCase().includes(
          searchVal.trim()
        )
      ) {
        arr.push(elem);
      }
    });*/
    triggerData?.forEach((elem) => {
      if (
        elem.TriggerName.toLowerCase().includes(
          searchVal?.toLowerCase()?.trim()
        )
      ) {
        arr.push(elem);
      }
    });
    //till here for bug_id 143377
    setSearchedTriggerData(arr);
    // triggerTypeOptionList.map((option) => {
    triggerTypeOptionList?.forEach((option) => {
      arr?.length > 0 &&
        // arr.map((trig) => {
        arr?.forEach((trig) => {
          if (trig.TriggerType === option && !triggerTypeArr.includes(option)) {
            triggerTypeArr.push(option);
          }
        });
    });
    setAddedTriggerTypes(triggerTypeArr);
  };

  const clearResult = () => {
    let triggerTypeArr = [];
    setSearchedTriggerData(triggerData);
    // triggerTypeOptionList.map((option) => {
    triggerTypeOptionList?.forEach((option) => {
      triggerData?.length > 0 &&
        triggerData.map((trigEl) => {
          if (
            trigEl.TriggerType === option &&
            !triggerTypeArr.includes(option)
          ) {
            triggerTypeArr.push(option);
          }
        });
    });
  };

  const validateData = (value, val, restrictChar, maxCharAllowed) => {
    let isValid = true;
    let errMsg = "";

    if (value?.trim() === "") {
      isValid = false;
      errMsg = `${t("pleaseDefine")} ${t(val)}`;
    } else if (
      value?.trim() !== "" &&
      restrictChar &&
      !checkRegex(value, PMWEB_REGEX.Trigger_Name, PMWEB_ARB_REGEX.Trigger_Name)
    ) {
      isValid = false;
      errMsg = getIncorrectRegexErrMsg(val, t, `& * | \\ : ' " < > ? /`);
    } else if (value?.trim() !== "" && value?.length > maxCharAllowed) {
      isValid = false;
      errMsg = getIncorrectLenErrMsg(val, maxCharAllowed, t);
    }
    return [errMsg, isValid];
  };

  return spinner ? (
    <CircularProgress
      style={
        direction === RTL_DIRECTION
          ? { marginTop: "40vh", marginRight: "50%" }
          : { marginTop: "40vh", marginLeft: "50%" }
      }
    />
  ) : (
    <div
      className={clsx(
        styles.triggerDiv,
        hideLeftPanel && styles.triggerDivRules
      )}
    >
      {triggerData?.length > 0 ? (
        <React.Fragment>
          {!hideLeftPanel ? (
            <div className={styles.triggerListViewArea}>
              <div className={styles.triggerMainView}>
                <div className={`flex ${styles.triggerSearchDiv}`}>
                  <div className={`${styles.searchComponent}`}>
                    <SearchComponent
                      width="100%" //Change made to solve Bug 127297
                      onSearchChange={onSearchSubmit}
                      clearSearchResult={clearResult}
                      name="search"
                      placeholder={t("search")}
                      searchTerm={searchTerm}
                      id="pmweb_triggerDef_search"
                      ariaDescription="Trigger List"
                    />
                  </div>

                  {readOnlyProcess ? null : (
                    <ClickAwayListener onClickAway={handleClickAway}>
                      <div className={styles.addTriggerDiv}>
                        <button
                          onClick={() => {
                            setShowTypeOptions(true);
                          }}
                          className={styles.addTrigger}
                          id="pmweb_triggerDef_side_add_btn"
                        >
                          {"+ "} {t("trigger")}
                        </button>
                        {showTypeOption ? (
                          <ButtonDropdown
                            open={showTypeOption}
                            handleClose={() => setShowTypeOptions(false)}
                            dropdownOptions={triggerTypeOptionList}
                            onSelect={createNewTrigger}
                            optionRenderFunc={triggerTypeName}
                            id="pmweb_triggerDef_sideAdd_varList"
                            style={{ maxHeight: "16rem" }}
                          />
                        ) : null}
                      </div>
                    </ClickAwayListener>
                  )}
                </div>
                <TriggerListView
                  addedTriggerTypes={addedTriggerTypes}
                  triggerData={searchedTriggerData}
                  onFieldSelection={onFieldSelection}
                  selectedField={selectedField}
                />
              </div>
            </div>
          ) : null}

          {selectedField && selectedField !== null ? (
            <div
              className={clsx(
                styles.triggerMainFormArea,
                hideLeftPanel && styles.triggerMainFormAreaRules
              )}
            >
              <div className={`flex ${styles.triggerHeadDiv}`}>
                <h2 className={styles.triggerNameHeading}>
                  <img
                    src={FileIcon}
                    className={styles.triggerFileIcon}
                    alt="file"
                  />
                  {selectedField.name}
                </h2>

                {!readOnlyProcess ? (
                  selectedField.status === STATE_CREATED ? (
                    <div>
                      <Button
                        onClick={cancelAddTriggerFunc}
                        className={styles.cancelTriggerButton}
                        id="pmweb_triggerDef_cancel_btn"
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        name="addTriggerBtn"
                        onClick={() => addModifyTriggerFunc(ADD_OPTION)}
                        className={styles.addTriggerButton}
                        id="pmweb_triggerDef_add_btn"
                        disabled={
                          errorMsg?.triggerName !== "" ||
                          errorMsg?.triggerDesc !== ""
                        }
                      >
                        {t("add")} {t("trigger")}
                      </Button>
                    </div>
                  ) : selectedField.status === STATE_EDITED ? (
                    <div>
                      <Button
                        onClick={cancelEditTriggerFunc}
                        className={styles.cancelTriggerButton}
                        id="pmweb_triggerDef_editing_cancel_btn"
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        onClick={() => addModifyTriggerFunc(EDIT_OPTION)}
                        className={styles.addTriggerButton}
                        id="pmweb_triggerDef_edit_btn"
                      >
                        {t("save")} {t("changes")}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button
                        onClick={deleteTriggerFunc}
                        className={styles.cancelTriggerButton}
                        id="pmweb_triggerDef_delete_btn"
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  )
                ) : null}
              </div>
              <TriggerMainFormView
                processType={localLoadedProcessData?.ProcessType}
                nameInput={nameInput}
                validateData={validateData}
                errorMsg={errorMsg}
                setErrorMsg={setErrorMsg}
                disableNameAndType={disableNameAndType}
                setNameInput={setNameInput}
                typeInput={typeInput}
                setTypeInput={setTypeInput}
                descInput={descInput}
                setDescInput={setDescInput}
                triggerTypeOptionList={triggerTypeOptionList}
                selectedField={selectedField}
                setSelectedField={setSelectedField}
                isReadOnly={readOnlyProcess}
              />
              <p className={styles.definitionHeading}>
                {t("definition")}
                <Divider className={styles.definitionLine} />
              </p>
              {triggerTypeOptions(typeInput, readOnlyProcess)[1]}
            </div>
          ) : triggerData && triggerData.length > 0 && hideLeftPanel ? (
            <NoTriggerScreen
              typeList={triggerTypeOptionList}
              setTypeInput={setTypeInput}
              setTriggerData={setTriggerData}
              setSelectedField={setSelectedField}
              processType={localLoadedProcessData?.ProcessType}
              hideLeftPanel={hideLeftPanel}
              isReadOnly={readOnlyProcess}
            />
          ) : (
            <NoSelectedTriggerScreen />
          )}
          {showDependencyModal ? (
            <DefaultModal
              show={showDependencyModal}
              style={{
                width: "45vw",
                left: "28%",
                top: "21.5%",
                padding: "0",
                zIndex: "1000",
              }}
              modalClosed={() => setShowDependencyModal(false)}
              children={
                <ObjectDependencies
                  {...props}
                  processAssociation={taskAssociation}
                  cancelFunc={() => setShowDependencyModal(false)}
                />
              }
            />
          ) : null}
        </React.Fragment>
      ) : (
        <NoTriggerScreen
          typeList={triggerTypeOptionList}
          setTypeInput={setTypeInput}
          setTriggerData={setTriggerData}
          setSelectedField={setSelectedField}
          processType={localLoadedProcessData?.ProcessType}
          isReadOnly={readOnlyProcess}
        />
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
    setTypeTrigger: (list) =>
      dispatch(actionCreators.setTrigger_properties(list)),
    dataEntryTypeTrigger: (list) =>
      dispatch(actionCreators.dataEntryTrigger_properties(list)),
    executeTypeTrigger: (funcName, serverExecutable, argString) =>
      dispatch(
        actionCreators.execute_properties(funcName, serverExecutable, argString)
      ),
    launchApplicationTypeTrigger: ({ appName, argumentStrValue }) =>
      dispatch(
        actionCreators.launch_application_properties({
          appName,
          argumentStrValue,
        })
      ),
    exceptionTypeTrigger: ({
      exceptionId,
      exceptionName,
      attribute,
      comment,
    }) =>
      dispatch(
        actionCreators.exception_properties({
          exceptionId,
          exceptionName,
          attribute,
          comment,
        })
      ),
    generateResponseTypeTrigger: ({
      fileId,
      fileName,
      docTypeName,
      docTypeId,
    }) =>
      dispatch(
        actionCreators.generate_response_properties({
          fileId,
          fileName,
          docTypeName,
          docTypeId,
        })
      ),
    setTemplates: (list) => dispatch(actionCreators.setTemplates(list)),
    mailTypeTrigger: ({
      from,
      isFromConst,
      to,
      isToConst,
      cc,
      isCConst,
      bcc,
      isBccConst,
      priority,
      subjectValue,
      mailBodyValue,
    }) =>
      dispatch(
        actionCreators.mail_properties({
          from,
          isFromConst,
          to,
          isToConst,
          cc,
          isCConst,
          bcc,
          isBccConst,
          priority,
          subjectValue,
          mailBodyValue,
        })
      ),
    createChildWorkitemTypeTrigger: ({
      m_strAssociatedWS,
      type,
      generateSameParent,
      variableId,
      varFieldId,
      list,
    }) =>
      dispatch(
        actionCreators.createChildWorkitemTrigger_properties({
          m_strAssociatedWS,
          type,
          generateSameParent,
          variableId,
          varFieldId,
          list,
        })
      ),
  };
};

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessType: state.openProcessClick.selectedType,
    triggerEdited: state.triggerReducer.isTriggerEdited,
    MAIL: state.triggerReducer.Mail,
    SET: state.triggerReducer.Set,
    DATAENTRY: state.triggerReducer.DataEntry,
    EXECUTE: state.triggerReducer.Execute,
    LAUNCHAPPLICATION: state.triggerReducer.LaunchApp,
    EXCEPTION: state.triggerReducer.Exception,
    GENERATERESPONSE: state.triggerReducer.generateResponse,
    CREATE_CHILD_WORKITEM: state.triggerReducer.CreateChild,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TriggerDefinition);
