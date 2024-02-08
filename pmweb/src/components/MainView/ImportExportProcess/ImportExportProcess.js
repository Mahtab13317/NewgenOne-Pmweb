// Changes made to solve bug with ID Bug 112353 - After Process importing the changes of imported process are reflecting only after the reopening of the process
// #BugID - 117313
// #BugDescription - Validation added for process name on input.
// #BugID - 119893
// #BugDescription - Added functionality to show version list after importing new version process.
// Changes made to solve Bug 112353 - After Process importing the changes of imported process are reflecting only after the reopening of the processv
// #BugID - 119890
// #BugDescription - Loader added.
// #BugID - 120616
// #BugDescription - added functionality to Create project option from drafts and deployed.
// #BugID - 122056,122388
// #BugDescription - Added the validation for process name character length.
// #BugID - 121796
// #BugDescription - Handled the function to open and close modal of project creation while import the process.
// #BugID - 125844
// #BugDescription - Handled the projectname issue.

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ImportExportProcess.module.css";
import CloseIcon from "@material-ui/icons/Close";
import {
  MenuItem,
  makeStyles,
  useMediaQuery,
  IconButton,
  Grid,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ProjectCreation from "../ProcessesView/Projects/ProjectCreation";
import Modal from "../../../UI/Modal/Modal";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useSelector, useDispatch, connect } from "react-redux";
import {
  SERVER_URL,
  ENDPOINT_OPENPROCESS,
  PREVIOUS_PAGE_PROCESS,
  SPACE,
  RTL_DIRECTION,
  PMWEB_CONTEXT,
  ENDPOINT_IMPORT_PROCESS,
  ENDPOINT_EXPORT_PROCESS,
} from "../../../Constants/appConstants";
import {
  ImportExportSliceValue,
  setImportExportVal,
} from "../../../redux-store/slices/ImportExportSlice";
import {
  CONST_BPEL,
  CONST_BPMN,
  CONST_XML,
  CONST_XPDL,
} from "../../../Constants/appConstants";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import { useGlobalState, store } from "state-pool";
import * as actionCreators from "../../../redux-store/actions/processView/actions.js";
import { useHistory } from "react-router-dom";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { base64toBlob } from "../../../utility/Base64Operations/base64Operations";
// import ConfirmationModal from "./ConfirmationModal/ConfirmationModal";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import { processAdded } from "../../../redux-store/slices/processListSlice";
import { setPreviousProcessPage } from "../../../redux-store/slices/storeProcessPage";
import DOMPurify from "dompurify";
import ErrorAndInformationModal from "./ErrorAndInformationModal";
import { setOpenProcessLoader } from "../../../redux-store/slices/OpenProcessLoaderSlice";
import { handleKeyHelp, openWebHelpInPmWeb } from "../../AppHeader/AppHeader";
import QuestionMarkIcon from "../../../assets/HomePage/HS_Question Mark.svg";
import CustomizedDropdown from "../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  isEnglishLocaleSelected,
  isArabicLocaleSelected,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function ImportExportProcess(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let history = useHistory();

  const StyledLabel = withStyles({
    label: {
      color: "#606060",
      fontFamily: "var(--font_family)",
      fontSize: "var(--base_text_font_size)",
      fontWeight: "550",
    },
  })(FormControlLabel);

  const useStyles = makeStyles({
    select: {
      "& ul": {
        paddingTop: 0,
        paddingBottom: 0,
        border: "1px solid #cecece",
        borderRadius: "inherit",
      },
    },
    focusVisible: {
      outline: "none",
      "&:focus-visible": {
        "& svg": {
          outline: `2px solid #00477A`,
          borderRadius: "10px",
        },
      },
    },
  });
  const classes = useStyles();

  const [selectedProject, setselectedProject] = useState(
    props?.selectedProjectId
  );
  const [processCreationModal, setprocessCreationModal] = useState(false);
  const [exportType, setexportType] = useState("xml");
  const [importType, setimportType] = useState("xml");
  const [showErrorsBool, setshowErrorsBool] = useState(false);

  const [spinner, setSpinner] = useState({
    import: false,
    importAndOpen: false,
    overwriteExistingProcess: false,
    createNewVersion: false,
    export: false,
  });
  const ProjectValue = useSelector(ImportExportSliceValue);
  const loadedProcessData = store.getState("loadedProcessData");
  const [openConfirmationModal, setopenConfirmationModal] = useState(false);
  const [selectedProcessName, setselectedProcessName] = useState("");
  const dispatch = useDispatch();
  const { setAction, typeImportorExport } = props;
  const [selectedFile, setselectedFile] = useState();
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const arrProcessesData = store.getState("arrProcessesData");
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const openProcessesArr = store.getState("openProcessesArr"); //array of keys of processdata stored
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const [openProcessFlag, setopenProcessFlag] = useState(false);
  const [responseObj, setresponseObj] = useState({});
  const [errorObj, seterrorObj] = useState({
    importType: "",
    processName: "",
    projectName: "",
  });
  const [createNewVersionFlag, setCreateNewVersionFlag] = useState(false); // State that stores the flag to show the 'Create as New Version' button on the basis of flag sent in the Open process API call.
  const smallScreen = useMediaQuery("(max-width: 699px)");
  const xmlRef = useRef();
  const xpdlRef = useRef();
  const bpelRef = useRef();
  const bpmnRef = useRef();
  const errorMessagesArray = [
    {
      key: "missingDataObjects",
      header: t(
        "ProcessDefinitionExportedWithoutTheBelowDataObjectsDueToSomeError"
      ),
      subHeaders: [t("DataObjectsNotIncludedInTheProcess")],
    },
    {
      key: "unchangedDataObjects",
      header: t("BelowDataObjectsAreAlreadyBeingUsedInTheCurrentProcess"),
      subHeaders: [t("DataObjectsAlreadyBeingUsed")],
    },
    {
      key: "renamedDataObjects",
      header: t("SomeDataObjectsAreAlreadyBeingUsedInOtherProcesses"),
      subHeaders: [t("DataObjects"), t("RenamedDataObjects")],
    },
    {
      key: "failedDataObjects",
      header: t(
        "ProcessDefinitionImportedWithoutTheBelowDataObjectsDueToSomeError"
      ),
      subHeaders: [t("DataObjectsNotImportedInTheProcess")],
    },
  ];
  const [errorMessageObj, seterrorMessageObj] = useState([]);
  const sectionNameRef = useRef();
  const selectedProcessNameRef = useRef();
  const fileInputRef = useRef();

  const modalRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModalOnImport, setShowModalOnImport] = useState({
    showErrors: false,
    showInformation: false,
  });

  // Function that runs when the value localArrProcessesData changes.
  useEffect(() => {
    if (localArrProcessesData) {
      const updatedArr = localArrProcessesData.filter(
        (d) => +d.ProcessDefId === +props.openProcessID
      );
      const getBooleanFlag = (value) => value === "Y";
      setCreateNewVersionFlag(
        getBooleanFlag(updatedArr[0]?.RequiredNewVersion)
      );
    }
  }, [localArrProcessesData]);

  useEffect(() => {
    if (selectedProcessName === "") {
      seterrorObj((prev) => {
        let temp = { ...prev };
        temp.processName = "Please enter a valid Process Name";
        return temp;
      });
    } else {
      seterrorObj((prev) => {
        let temp = { ...prev };
        temp.processName = "";
        return temp;
      });
    }
  }, [selectedProcessName]);

  const checkFormatType = (file) => {
    let splitArr = file.name.split(".");

    return splitArr[splitArr.length - 1];
  };

  const uploadFile = (e) => {
    let regex = new RegExp(/^[A-Za-z][A-Za-z0-9_\.\_\s]*$/gm);

    if (
      checkFormatType(e.target.files[0]) ===
      (importType === "xml" ? "zip" : importType)
    ) {
      /*  if (e.target.files[0].name.length > 22) {
     
        setErrorMsg("Maximum 22 characters allowed");
      } else {
        seterrorObj((prev) => {
          let temp = { ...prev };
          temp.importType = "";
          return temp;
        });
      } */
      setselectedFile(e.target.files[0]);
    } else {
      seterrorObj((prev) => {
        let temp = { ...prev };
        temp.importType = `${t("pleaseUploadOnly")} .${
          importType === "xml" ? t("zip") : importType
        } ${t("files")}`;
        return temp;
      });
    }
  };

  useEffect(() => {
    if (!props.showOverwrite) {
      setselectedProcessName(
        selectedFile?.name.split(".").slice(0, -1).join(".")
      );
      if (selectedFile?.name.split(".").slice(0, -1).join(".").length > 22) {
        setErrorMsg(t("processNameMsg"));
      } else {
        setErrorMsg("");
      }
    }
  }, [selectedFile?.name, props.showOverwrite]);

  useEffect(() => {
    if (localLoadedProcessData?.ProcessDefId)
      setselectedProcessName(localLoadedProcessData.ProcessName);
  }, [localLoadedProcessData?.ProcessDefId]);

  const closeHandler = () => {
    dispatch(setImportExportVal({ ProjectName: null, Type: null }));
    setAction();
  };

  useEffect(() => {
    if (selectedProject === "none") {
      seterrorObj((prev) => {
        let temp = { ...prev };
        temp.projectName = "Please select a Project";
        return temp;
      });
    } else
      seterrorObj((prev) => {
        let temp = { ...prev };
        temp.projectName = "";
        return temp;
      });
  }, [selectedProject]);

  // Function that checks and returns boolean value whether buttons should be disabled or not while user is doing some action while importing a process.
  const shouldButtonsBeDisabled = () => {
    let disabled = false;
    disabled =
      spinner?.import ||
      spinner?.importAndOpen ||
      spinner?.overwriteExistingProcess ||
      spinner?.createNewVersion ||
      spinner?.export;

    return disabled;
  };

  const getProjectIdFromName = (name) => {
    let temp;
    ProjectValue.ProjectList.forEach((project) => {
      if (project.ProjectName === name) {
        temp = project.ProjectId;
      }
    });
    return temp;
  };

  const getProjectNameFromId = (id) => {
    let temp;
    ProjectValue.ProjectList.forEach((project) => {
      if (project.ProjectId === id) {
        temp = project.ProjectName;
      }
    });
    return temp;
  };

  useEffect(() => {
    if (ProjectValue?.ProjectName) {
      setselectedProject(
        getProjectIdFromName(ProjectValue?.ProjectName.ProjectName)
      );
    }
  }, [ProjectValue?.ProjectName]);

  const importTypeAbbvr = (data) => {
    if (data === "xml") return "N";
    else if (data === "xpdl") return "X";
    else if (data === "bpmn") return "B";
    else return "BP";
  };

  const disableImport = () => {
    if (
      !!selectedProcessName &&
      !!(selectedProject || props.selectedProjectId) &&
      !!selectedFile?.name &&
      selectedProject !== "none"
    )
      return false;
    else return true;
  };

  //code updated on 30 Nov 2022 for BugId 119883
  useEffect(() => {
    if (ProjectValue?.ProjectName) {
      setselectedProject(ProjectValue?.ProjectName?.ProjectId);
    }
  }, [selectedProject]);

  // Function that checks and saves the data for showing errors and informations to user when the user imports a process and that process has any errors or any change in data objects.
  const showMessageModalAfterImporting = (response, calledFromImport) => {
    let showModal = { showErrors: false, showInformation: false };
    const dataObj = response.data;
    if (
      (dataObj?.hasOwnProperty("failedDataObjects") &&
        dataObj["failedDataObjects"]?.length > 0) ||
      (dataObj?.hasOwnProperty("missingDataObjects") &&
        dataObj["missingDataObjects"]?.length > 0)
    ) {
      showModal.showErrors = true;
    }

    if (
      dataObj?.hasOwnProperty("dmsImportStatus") &&
      dataObj["dmsImportStatus"]?.length > 0
    ) {
      showModal.showErrors = true;
    }

    let tempArr = [];
    if (typeImportorExport === "import") {
      errorMessagesArray?.forEach((errorMsg) => {
        if (
          dataObj?.hasOwnProperty(errorMsg?.key) &&
          dataObj[errorMsg.key]?.length > 0
        ) {
          showModal.showInformation = true;
          tempArr.push({ ...errorMsg, errorData: [...dataObj[errorMsg.key]] });
        }
      });
    } else {
      errorMessagesArray?.forEach((errorMsg) => {
        if (
          dataObj?.hasOwnProperty(errorMsg?.key) &&
          dataObj[errorMsg.key]?.length > 0
        ) {
          // showModal.showInformation = true;
          tempArr.push({ ...errorMsg, errorData: [...dataObj[errorMsg.key]] });
        }
      });
    }
    seterrorMessageObj(tempArr);
    return showModal;
  };

  const handleSubmit = async (
    event,
    isOverwrite,
    isNewVersion,
    openProcessFlag,
    loaderButtonType // Parameter that gives the type of button on which loader should work on.
  ) => {
    setopenProcessFlag(openProcessFlag);
    let regex = new RegExp(/^[A-Za-z][A-Za-z0-9_\.\_\s]*$/gm);
    setSpinner((prevState) => {
      let temp = { ...prevState };
      return {
        ...temp,
        [loaderButtonType]: true,
      };
    });
    event.preventDefault();
    if (
      errorObj.importType === "" &&
      errorObj.processName === "" &&
      errorObj.projectName === ""
    ) {
      if (isEnglishLocaleSelected() && !regex.test(selectedProcessName)) {
        //Modified on 8/9/2023 for bug_id: 136419
        dispatch(
          setToastDataFunc({
            message: t("processnameValidation"),
            severity: "error",
            open: true,
          })
        );
        setSpinner((prevState) => {
          let temp = { ...prevState };
          return {
            ...temp,
            [loaderButtonType]: false,
          };
        });
      } else if (selectedProcessName.length > 22) {
        dispatch(
          setToastDataFunc({
            // Changes on 18-09-23 to resolve the bug Id 136405
            // message: `Maximum 22 characters allowed`,
            message: t("processNameMsg"),
            severity: "error",
            open: true,
          })
        );
        setSpinner((prevState) => {
          let temp = { ...prevState };
          return {
            ...temp,
            [loaderButtonType]: false,
          };
        });
      } else {
        let payload = {
          processName: selectedProcessName.trim(), //Modified on 28/09/2023, bug_id:138523
          //processName: selectedProcessName,
          projectId: selectedProject || props.selectedProjectId,
          projectName:
            ProjectValue?.ProjectName?.ProjectName ||
            getProjectNameFromId(selectedProject),
          processMode: "L",
          qGrpAssoc: "N",
          overwrite: false,
          newVersion: false,
          checkoutProcess: localLoadedProcessData?.CheckedOut || "N",
          importedName: selectedFile?.name.split(".").slice(0, -1).join("."),
          importType: importTypeAbbvr(importType),
        };
        if (props.showOverwrite && isOverwrite) {
          payload = { ...payload, overwrite: true };
          payload = {
            ...payload,
            processDefId: localLoadedProcessData.ProcessDefId,
          };
        }
        if (props.showOverwrite && isNewVersion) {
          payload = { ...payload, newVersion: true };
          payload = {
            ...payload,
            processDefId: localLoadedProcessData.ProcessDefId,
          };
        }
        const formData = new FormData();

        formData.append("file", selectedFile);
        formData.append(
          "processInfo",
          new Blob([JSON.stringify(payload)], {
            type: "application/json",
          })
        );

        const response = await axios({
          method: "post",
          url: `${PMWEB_CONTEXT}${ENDPOINT_IMPORT_PROCESS}`,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        let confirmationBoolean = false;
        if (response?.status === 200) {
          if (props?.projectAfterImport) {
            props?.projectAfterImport(); //Added on 11/10/2023, bug_id:126848
          }
          setresponseObj(response);
          setSpinner((prevState) => {
            let temp = { ...prevState };
            return {
              ...temp,
              [loaderButtonType]: false,
            };
          });
          let tempObj = showMessageModalAfterImporting(response, true);
          setShowModalOnImport(tempObj);
          if (tempObj?.showErrors || tempObj?.showInformation) {
            confirmationBoolean = true;
          }
          if (isNewVersion) {
            // code edited on 19 April 2023 for BugId 119893
            let temp = [...localOpenProcessesArr];
            temp.splice(
              localOpenProcessesArr.indexOf(
                `${props.openProcessID}#${props.openProcessType}`
              ),
              1
            );
            setLocalOpenProcessesArr(temp);
            const updatedArr = localArrProcessesData.filter(
              (d) => +d.ProcessDefId !== +props.openProcessID
            );
            setLocalArrProcessesData(updatedArr);
            setlocalLoadedProcessData(null);
            props.openProcessClick(
              response?.data?.process?.ProcessDefId,
              response?.data?.process?.ProjectName,
              props.openProcessType,
              response?.data?.process?.Version,
              props.openProcessName
            );
            props.openTemplate("", "", false);
            history.push("/process");
          }

          if (!confirmationBoolean) {
            setAction(null);
            if (isOverwrite) {
              /*code added on 1 Aug 2023 for Bug 132312 - regression>>import Process>>overwrite>>
              changes of imported process is not getting displayed and on clicking trigger tab, error 
              is appearing */
              setlocalLoadedProcessData(null);
              dispatch(
                setOpenProcessLoader({
                  loader: true,
                })
              );
              axios
                .get(
                  SERVER_URL +
                    ENDPOINT_OPENPROCESS +
                    response?.data?.process?.ProcessDefId +
                    "/" +
                    props.openProcessName +
                    "/" +
                    props.openProcessType
                )
                .then((res) => {
                  if (res?.data?.Status === 0) {
                    // added on 02/11/23 for BugId 140513
                    let newProcessData = { ...res.data.OpenProcess };
                    let localArrIdx;
                    localArrProcessesData.forEach((d, idx) => {
                      if (+d.ProcessDefId === +props.openProcessID) {
                        localArrIdx = idx;
                      }
                    });
                    const updatedArr = localArrProcessesData.filter(
                      (d) => +d.ProcessDefId !== +props.openProcessID
                    );
                    updatedArr.splice(localArrIdx, 0, {
                      ProcessDefId: newProcessData.ProcessDefId,
                      ProcessType: newProcessData.ProcessType,
                      ProcessName: newProcessData.ProcessName,
                      ProjectName: newProcessData.ProjectName,
                      VersionNo: newProcessData.VersionNo,
                      ProcessVariantType: newProcessData.ProcessVariantType,
                      isProcessActive: true,
                    });
                    let temp = [...localOpenProcessesArr];
                    let idx = localOpenProcessesArr.indexOf(
                      `${props.openProcessID}#${props.openProcessType}`
                    );
                    temp.splice(idx, 1);
                    temp.splice(
                      idx,
                      0,
                      `${newProcessData.ProcessDefId}#${newProcessData.ProcessType}`
                    );
                    setLocalOpenProcessesArr(temp);
                    setLocalArrProcessesData(updatedArr);
                    // till here BugId 140513
                    setlocalLoadedProcessData(newProcessData);
                    /*code added on 1 Aug 2023 for Bug 132312 - regression>>import Process>>overwrite>>
                    changes of imported process is not getting displayed and on clicking trigger tab, error 
                    is appearing */
                    dispatch(
                      setOpenProcessLoader({
                        loader: false,
                      })
                    );
                  } else {
                    <CircularProgress />;
                  }
                });
            }
          } else {
            setopenConfirmationModal(true);
          }
          dispatch(processAdded(response.data?.process));

          if (openProcessFlag && !confirmationBoolean) {
            openProcessAfterImport(response);
          }
          dispatch(
            setToastDataFunc({
              message: t("processImportedSuccessfully"),
              severity: "success",
              open: true,
            })
          );
        } else {
          setSpinner((prevState) => {
            let temp = { ...prevState };
            return {
              ...temp,
              [loaderButtonType]: false,
            };
          });
        }
      }
    } else {
      setshowErrorsBool(true);
    }
  };

  const openProcessAfterImport = (response) => {
    props.openProcessClick(
      response.data.process?.ProcessDefId,
      response.data.process?.ProjectName,
      "L",
      "1.0",
      response.data.process?.ProcessName
    );
    // code added on 30 Nov 2022 for BugId 119488
    dispatch(
      setPreviousProcessPage({
        previousProcessPage: PREVIOUS_PAGE_PROCESS,
        projectId: props.selectedProjectId,
        tabType: props.tabValue,
        clickedTile: props.selectedProcessCode,
        clickedTileIndex: props.selectedProcessTile,
        clickedTileCount: props.selectedProcessCount,
      })
    );
    history.push("/process");
  };

  // added on 02/11/23 for BugId 140513
  const openProcessAfterOverwriteWithErrors = (response) => {
    setlocalLoadedProcessData(null);
    dispatch(
      setOpenProcessLoader({
        loader: true,
      })
    );
    axios
      .get(
        SERVER_URL +
          ENDPOINT_OPENPROCESS +
          response?.data?.process?.ProcessDefId +
          "/" +
          props.openProcessName +
          "/" +
          props.openProcessType
      )
      .then((res) => {
        if (res?.data?.Status === 0) {
          let newProcessData = { ...res.data.OpenProcess };
          let localArrIdx;
          localArrProcessesData.forEach((d, idx) => {
            if (+d.ProcessDefId === +props.openProcessID) {
              localArrIdx = idx;
            }
          });
          const updatedArr = localArrProcessesData.filter(
            (d) => +d.ProcessDefId !== +props.openProcessID
          );
          updatedArr.splice(localArrIdx, 0, {
            ProcessDefId: newProcessData.ProcessDefId,
            ProcessType: newProcessData.ProcessType,
            ProcessName: newProcessData.ProcessName,
            ProjectName: newProcessData.ProjectName,
            VersionNo: newProcessData.VersionNo,
            ProcessVariantType: newProcessData.ProcessVariantType,
            isProcessActive: true,
          });
          let temp = [...localOpenProcessesArr];
          let idx = localOpenProcessesArr.indexOf(
            `${props.openProcessID}#${props.openProcessType}`
          );
          temp.splice(idx, 1);
          temp.splice(
            idx,
            0,
            `${newProcessData.ProcessDefId}#${newProcessData.ProcessType}`
          );
          setLocalOpenProcessesArr(temp);
          setLocalArrProcessesData(updatedArr);
          setlocalLoadedProcessData(newProcessData);
          dispatch(
            setOpenProcessLoader({
              loader: false,
            })
          );
        }
      });
  };
  // till here BugId 140513

  // Function called when the user clicks on export button.
  const exportHandler = () => {
    //Modified on 23/05/2023, bug_id:127694

    /* let payload = {
      processDefId: localLoadedProcessData.ProcessDefId,
      processName: localLoadedProcessData.ProcessName,
      projectId: localLoadedProcessData.ProjectId,
      projectName: localLoadedProcessData.ProjectName,
      processMode: localLoadedProcessData.ProcessType,
      qGrpAssoc: "N",
      exportFormat: importTypeAbbvr(exportType),
    }; */

    let payload = {
      processDefId: props.openProcessID + "",
      processName: props.openProcessName,
      projectId: props.selectedProjectId + "",
      projectName: props.selectedProjectName,
      processMode: props.openProcessType,
      qGrpAssoc: "N",
      exportFormat: importTypeAbbvr(exportType),
    };

    setSpinner((prevState) => {
      let temp = { ...prevState };
      return {
        ...temp,
        ["export"]: true,
      };
    });
    axios({
      // url: "/pmweb/exportProcess", //your url
      url: `${PMWEB_CONTEXT}${ENDPOINT_EXPORT_PROCESS}`,

      method: "POST",
      // responseType: "blob", // important
      data: payload,
    })
      .then((res) => {
        let confirmationBoolean = false;
        let tempObj = showMessageModalAfterImporting(res, false);
        setShowModalOnImport(tempObj);
        if (tempObj?.showErrors || tempObj?.showInformation) {
          confirmationBoolean = true;
        }
        // errorMessagesArray.forEach((errorMsg) => {
        //   if (
        //     res.data.hasOwnProperty(errorMsg.key) &&
        //     res.data[errorMsg.key].length > 0
        //   ) {
        //     confirmationBoolean = true;
        //     seterrorMessageObj((prev) => [
        //       { ...errorMsg, errorData: [...res.data[errorMsg.key]] },
        //     ]);
        //   }
        // });
        const url = window.URL.createObjectURL(
          base64toBlob(res?.data?.fileData, "application/octet-stream")
        );

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          res.data?.fileName || `${localLoadedProcessData.ProcessName}`
        ); //or any other extension

        // document.body.appendChild(link);
        // link.click();
        /*  const sanitizedHref = DOMPurify.sanitize(link.href);
        link.href = sanitizedHref; */
        // document.body.appendChild(link);
        // link.click();
        const sanitizedHref = DOMPurify.sanitize(link.href);
        link.href = sanitizedHref;
        link.click();

        if (!confirmationBoolean) {
          setAction(null);
        } else {
          setopenConfirmationModal(true);
        }

        setSpinner((prevState) => {
          let temp = { ...prevState };
          return {
            ...temp,
            ["export"]: false,
          };
        });
        dispatch(
          setToastDataFunc({
            message: t("processExportedSuccessfully"),
            severity: "success",
            open: true,
          })
        );
      })
      .catch(function (error) {
        setSpinner((prevState) => {
          let temp = { ...prevState };
          return {
            ...temp,
            ["export"]: false,
          };
        });
        dispatch(
          setToastDataFunc({
            message: t("processExportedFailed"),
            severity: "error",
            open: true,
          })
        );
      });
  };

  const exportTypeDropdownHandler = (e) => {
    setexportType(e.target.value);
  };

  //Added validations for arabic and english both
  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      const regex = new RegExp("[~`!@#$%^&*()+\\-={}\\[\\]|\\\\:\";'<>?,.//]+");
      return !regex.test(str);
    } else {
      const regex = new RegExp(
        /^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&\@\#\!\$\%\(\)\<\>\;\-]*$/gm
      );
      return regex.test(str);
    }
  };

  const validateData = (e, val) => {
    if (!containsSpecialChars(e.target.value)) {
      setErrorMsg(t("ProcessErrorMsg"));
    } else if (e.target.value.length > 22) {
      setErrorMsg(t("processNameMsg"));
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };

  const processHandler = (e) => {
    validateData(e, t("NameofProcess"));
    setselectedProcessName(e.target.value);
  };

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        closeHandler();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const handleKeyExport = (e) => {
    if (e.keyCode === "Enter") {
      exportHandler();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={modalRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {openConfirmationModal ? (
        <Modal
          show={openConfirmationModal}
          style={{
            // margin: "auto",
            // // width: "450px", code updated on 28 Feb 2023 for BugId 124152
            // height: "550px",
            // position: "fixed",
            // left: "32% !important",
            // top: 0,
            // bottom: 0,
            // left: 0,
            // right: 0,
            minHeight: "500px",
            maxHeight: "500px",
            top: typeImportorExport !== "import" ? "-114%" : "-30%",
            left: "-22%",
            width: "600px",
            padding: "0px !important",
          }}
          modalClosed={() => {
            setopenConfirmationModal(false);
          }}
          children={
            <ErrorAndInformationModal
              closeModal={() => setopenConfirmationModal(false)}
              errorMessageObj={errorMessageObj}
              setopenConfirmationModal={setopenConfirmationModal}
              setAction={setAction}
              // modified on 02/11/23 for BugId 140513
              //  openProcessFlag={openProcessFlag}
              //  openProcessAfterImport={openProcessAfterImport}
              openProcessFlag={
                typeImportorExport === "import" && props.showOverwrite
                  ? true
                  : openProcessFlag
              }
              openProcessAfterImport={
                typeImportorExport === "import" && props.showOverwrite
                  ? openProcessAfterOverwriteWithErrors
                  : openProcessAfterImport
              }
              // till here BugId 140513
              responseObj={responseObj}
              showModalOnImport={showModalOnImport}
              typeImportorExport={typeImportorExport}
              title={
                typeImportorExport === "import" ? (
                  <p>
                    {SPACE}
                    {t("import")}
                    {SPACE}
                    {t("alert")}
                  </p>
                ) : (
                  <p>
                    {SPACE}
                    {t("export")}
                    {SPACE}
                    {t("alert")}
                  </p>
                )
              }
            />
          }
        />
      ) : null}

      {processCreationModal ? (
        <Modal
          show={processCreationModal}
          style={{
            // Changes the width 30 to 20vw to resolve the bug ID 124898
            width: "29vw",
            left: "50%",
            top: "50%",
            padding: "0",
            transform: "translate(-50%, -50%)",
          }}
          modalClosed={() => {
            setprocessCreationModal(false);
            setselectedProject(props?.selectedProjectId);
          }}
          children={
            <ProjectCreation
              setShowModal={() => setprocessCreationModal(false)}
              width="100%"
              height="40px"
              setselectedProject={setselectedProject}
              selectedProject={props?.selectedProjectId}
              modalHeight="30vh" //Bug 111171 [24-02-2023] Reduced the modalHeight from 60vh to 30vh
            />
          }
        />
      ) : null}

      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #c4c4c4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding:
            direction === RTL_DIRECTION
              ? "0.75rem 1vw 0vw 0.75rem"
              : "0.75rem 0vw 1vw 0.75rem",
          fontSize: "var(--title_text_font_size)",
          fontWeight: "600",
          fontFamily: "var(--font_family)",
        }}
      >
        {typeImportorExport === "import" ? (
          <p>
            {t("import")} {t("Process")}
          </p>
        ) : (
          <p>
            {t("export")} {t("Process")}
          </p>
        )}
        <div style={{ display: "flex", gap: "0.25vw", alignItems: "center" }}>
          {typeImportorExport === "import" && (
            <IconButton
              onClick={() => openWebHelpInPmWeb("?rhmapno=1411")}
              tabIndex={0}
              onKeyDown={(e) => handleKeyHelp(e, "?rhmapno=1411")}
              id="pmweb_importExport_helpIcon"
              disableTouchRipple
              disableFocusRipple
              disableRipple
            >
              <img
                src={QuestionMarkIcon}
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  cursor: "pointer",
                }}
                alt="Help"
                // onClick={() => openWebHelpInPmWeb("?rhmapno=1411")}
                // tabIndex={0}
                // onKeyDown={(e) => handleKeyHelp(e, "?rhmapno=1411")}
                // id="pmweb_importExport_helpIcon"
                className="iconButton"
              />
            </IconButton>
          )}
          <IconButton
            onClick={closeHandler}
            id="pmweb_ImportExport_Close"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                closeHandler();
                e.stopPropagation();
              }
            }}
            aria-label="closeIcon"
            disableTouchRipple
            disableFocusRipple
          >
            <CloseIcon
              fontSize="small"
              style={{
                opacity: "0.5",
                cursor: "pointer",
                width: "1.25rem",
                height: "1.25rem",
              }}
              // onClick={closeHandler}
              // id="pmweb_ImportExport_Close"
              // // className="iconButton"
              // // tabIndex={0}
              // onKeyDown={(e) => {
              //   if (e.key === "Enter") {
              //     closeHandler();
              //     e.stopPropagation();
              //   }
              // }}
            />
          </IconButton>
        </div>
      </div>
      {typeImportorExport === "import" ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column",
            width: "100%",
            padding: "0.5rem 1vw",
            // overflowY: "auto", //code updated on 15 Dec 2022 for BugId 120136
            direction: direction,
            height: smallScreen ? "10rem" : null,
          }}
        >
          <label
            className={styles.heading}
            htmlFor="pmweb_ImportExport_ImportType"
          >
            {t("import")} {t("type")}
          </label>

          <CustomizedDropdown
            IconComponent={ExpandMoreIcon}
            style={{
              width: "100%",
              height: "var(--line_height)",
              marginBottom: "1rem",
              direction: direction,
            }}
            id="pmweb_ImportExport_ImportType"
            ariaLabel="Select import Type"
            direction="rtl"
            variant="outlined"
            value={importType}
            onChange={(e) => {
              setimportType(e.target.value);
              seterrorObj({
                importType: "",
                processName: "",
                projectName: "",
              });
              setselectedFile(undefined);
              setselectedProcessName(undefined);
            }}
            relativeStyle={{ width: "100%" }}
          >
            <MenuItem
              value={"xml"}
              style={{
                display: "flex",
                justifyContent: direction == RTL_DIRECTION ? "end" : "start",
              }}
            >
              <p
                style={{
                  fontSize: "var(--base_text_font_size)",
                  textAlign: direction === "rtl" ? "right" : "left",
                }}
              >
                XML
              </p>
            </MenuItem>
            <MenuItem
              value="xpdl"
              style={{
                display: "flex",
                justifyContent: direction == RTL_DIRECTION ? "end" : "start",
              }}
            >
              <p
                style={{
                  fontSize: "var(--base_text_font_size)",
                  textAlign: direction === "rtl" ? "right" : "left",
                }}
              >
                XPDL 2.2
              </p>
            </MenuItem>
            <MenuItem
              value="bpmn"
              style={{
                display: "flex",
                justifyContent: direction == RTL_DIRECTION ? "end" : "start",
              }}
            >
              <p
                style={{
                  fontSize: "var(--base_text_font_size)",
                  textAlign: direction === "rtl" ? "right" : "left",
                }}
              >
                BPMN 2.0
              </p>
            </MenuItem>
            <MenuItem
              value="bpel"
              style={{
                display: "flex",
                justifyContent: direction == RTL_DIRECTION ? "end" : "start",
              }}
            >
              <p
                style={{
                  fontSize: "var(--base_text_font_size)",
                  textAlign: direction === "rtl" ? "right" : "left",
                }}
              >
                BPEL
              </p>
            </MenuItem>
          </CustomizedDropdown>

          <label
            className={styles.heading}
            htmlFor="pmweb_ImportExport_fileUpload"
          >
            {t("file")} {t("name")}
          </label>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: "1vw",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "var(--line_height)",
                marginBottom: "1rem",
                background: "#F8F8F8 0% 0% no-repeat padding-box",
                border: "1px solid #CECECE",
                borderRadius: "2px",
                paddingLeft: "0.5vw",
                display: "flex",
                fontSize: "var(--base_text_font_size)",
                alignItems: "center",
              }}
            >
              <p
                id="pmweb_ImportExport_fileName"
                style={{
                  textAlign: "left",
                  fontSize: "var(--base_text_font_size)",
                  fontWeight: "400",
                }}
              >
                {selectedFile !== undefined ? selectedFile.name : ""}
              </p>
            </div>

            <form>
              <label
                style={{
                  fontSize: "var(--base_text_font_size)",
                  border: "1px solid var(--button_color)",
                  height: "var(--line_height)",
                  width: "100%",
                  whiteSpace: "nowrap",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "var(--button_color)",
                  fontWeight: "600",
                  padding: "0 0.5vw",
                  cursor: "pointer",
                }}
                tabIndex={0}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    fileInputRef.current.click();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => uploadFile(e)}
                  id="pmweb_ImportExport_fileUpload"
                  // tabIndex={0}
                  // onKeyDown={(e)=>{
                  //   if(e.keyCode === 13){
                  //     uploadFile(e);
                  //     e.stopPropagation();
                  //   }
                  // }}
                />
                {t("chooseFile")}
              </label>
            </form>
          </div>

          {errorObj?.importType !== "" ? (
            <p style={{ fontSize: "11px", color: "red" }}>
              {SPACE}
              {errorObj?.importType}
            </p>
          ) : null}
          {/* code added on 11-10-23 for bug 139274  */}
          <Grid container direction="column" style={{ paddingBottom: "1.5vh" }}>
            <Grid item>
              <label
                className={styles.heading}
                htmlFor="pmweb_ImportExport_ProcessName"
              >
                {t("Process")} {t("name")}
                <span className={styles.asterisk}>*</span>
              </label>
            </Grid>
            <Grid item>
              <input
                id="pmweb_ImportExport_ProcessName"
                style={{
                  width: "100%",
                  height: "var(--line_height)",
                  background: "#F8F8F8 0% 0% no-repeat padding-box",
                  border:
                    errorMsg != "" ? "1px solid red" : "1px solid #CECECE",
                }}
                // readOnly={props.showOverwrite ? true : false}
                disabled={props.showOverwrite ? true : false}
                value={selectedProcessName}
                onChange={(e) => {
                  processHandler(e);
                }}
                ref={selectedProcessNameRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 169, selectedProcessNameRef.current, 23)
                }
              />
            </Grid>
          </Grid>
          {/* till here bug 139274  */}
          {errorMsg != "" ? (
            <p
              style={{
                color: "red",
                fontSize: "12px",
                fontWeight: "500",
                marginTop: "-1rem",
              }}
            >
              {errorMsg}
            </p>
          ) : null}
          {errorObj?.processName !== "" && showErrorsBool ? (
            <p style={{ fontSize: "0.65rem", color: "red" }}>
              {SPACE}
              {errorObj?.processName}
            </p>
          ) : null}
          {/* code added on 11-10-23 for bug 139274  */}
          <Grid container direction="column">
            <Grid item>
              <label
                className={styles.heading}
                htmlFor="pmweb_ImportExport_projectName"
              >
                {t("ProjectName")}
                <span className={styles.asterisk}>*</span>
              </label>
            </Grid>
            <Grid item>
              <input
                id="pmweb_ImportExport_projectName"
                value={props.selectedProjectName}
                disabled={true}
                style={{
                  width: "100%",
                  height: "var(--line_height)",
                  //marginBottom: "1rem",
                  background: "#F8F8F8 0% 0% no-repeat padding-box",
                  border: "1px solid #CECECE",
                }}
                ref={sectionNameRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 150, sectionNameRef.current, 60)
                }
              />
            </Grid>
          </Grid>
          {/* till here for bug 139274  */}

          {/*  {ProjectValue?.ProjectName && props.selectedProjectId != null ? (
            <input
              id="add_sectionName"
              value={ProjectValue.ProjectName.ProjectName}
              disabled={true}
              style={{
                width: "100%",
                height: "var(--line_height)",
                marginBottom: "1rem",
                background: "#F8F8F8 0% 0% no-repeat padding-box",
                border: "1px solid #CECECE",
              }}
              ref={sectionNameRef}
              onKeyPress={(e) =>
                FieldValidations(e, 150, sectionNameRef.current, 60)
              }
            />
          ) : (
            <>
              <Select
                IconComponent={ExpandMoreIcon}
                style={{
                  width: "100%",
                  height: "var(--line_height)",
                  marginBottom: "10px",
                  direction: direction,
                }}
                variant="outlined"
                value={selectedProject}
                onChange={(e) => projectDropdownHandler(e.target.value)}
                //autoWidth
                //Bug 120662 [24-02-2023] set the MenuProps
                MenuProps={{
                  classes: { paper: customStyle.select },
                  anchorOrigin: { vertical: "bottom", horizontal: "left" },
                  transformOrigin: { vertical: "top", horizontal: "left" },
                  getContentAnchorEl: null,
                }}
              >
                <MenuItem value="none"></MenuItem>
                {ProjectValue?.ProjectList?.map((project) => (
                  <MenuItem key={project.ProjectId} value={project.ProjectId}>
                    <p
                      style={{
                        //fontSize: "0.8rem",
                        fontSize: "var(--base_text_font_size)", //code added on 13 Dec 2022 for BugId 119889
                        textAlign: direction === "rtl" ? "right" : "left",
                      }}
                    >
                      {project.ProjectName}
                    </p>
                  </MenuItem>
                ))}
                <MenuItem
                  value="addNewProject"
                  style={{
                    borderTop: "1px solid #cecece",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)", //Bug 120662 [24-02-2023] set the fontsize
                      textAlign: direction === "rtl" ? "right" : "left",
                      color: "#0072C6",
                      fontWeight: 600,
                    }}
                  >
                    + Create New Project
                  </p>
                </MenuItem>
              </Select>
              {errorObj?.projectName !== "" && showErrorsBool ? (
                <p style={{ fontSize: "0.65rem", color: "red" }}>
                  {SPACE}
                  {errorObj?.projectName}
                </p>
              ) : null}
            </>
          )} */}
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            padding: "1rem 1vw 1rem",
          }}
        >
          <p className={styles.heading} style={{ margin: "0.5rem 0" }}>
            {t("export")} {t("type")}
          </p>
          <RadioGroup
            row
            aria-label="position"
            onChange={exportTypeDropdownHandler}
            value={exportType}
          >
            <StyledLabel
              value={"xml"}
              className={classes.focusVisible}
              control={<Radio size="small" color="primary" tabIndex={-1} />}
              label={CONST_XML}
              labelPlacement="end"
              id="pmweb_ImportExport_exportType_xml"
              tabIndex={0}
              ref={xmlRef}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  xmlRef.current.click();
                  e.stopPropagation();
                }
              }}
            />
            <StyledLabel
              className={classes.focusVisible}
              value={"xpdl"}
              control={<Radio size="small" color="primary" tabIndex={-1} />}
              label={CONST_XPDL}
              labelPlacement="end"
              id="pmweb_ImportExport_exportType_xpdl"
              tabIndex={0}
              ref={xpdlRef}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  xpdlRef.current.click();
                  e.stopPropagation();
                }
              }}
            />
            <StyledLabel
              className={classes.focusVisible}
              value={"bpmn"}
              control={<Radio size="small" color="primary" tabIndex={-1} />}
              label={CONST_BPMN}
              labelPlacement="end"
              id="pmweb_ImportExport_exportType_bpmn"
              tabIndex={0}
              ref={bpmnRef}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  bpmnRef.current.click();
                  e.stopPropagation();
                }
              }}
            />
            <StyledLabel
              className={classes.focusVisible}
              value={"bpel"}
              control={<Radio size="small" color="primary" tabIndex={-1} />}
              label={CONST_BPEL}
              labelPlacement="end"
              id="pmweb_ImportExport_exportType_bpel"
              tabIndex={0}
              ref={bpelRef}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  bpelRef.current.click();
                  e.stopPropagation();
                }
              }}
            />
          </RadioGroup>
        </div>
      )}

      {/*code added on 12 Dec 2022 for BugId 115912*/}
      <div
        className="buttons_add"
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "flex-end",
          width: "100%",
          borderTop: "1px solid #c4c4c4",
          padding: direction === "rtl" ? "0.5rem 10px" : "0.5rem 0",
          backgroundColor: "#f5f5f5",
        }}
      >
        {typeImportorExport === "import" ? (
          <>
            {props.showOverwrite ? (
              <>
                <button
                  id="pmweb_ImportExport_Overwrite"
                  className={styles.buttons}
                  onClick={(e) =>
                    handleSubmit(
                      e,
                      true,
                      false,
                      false,
                      "overwriteExistingProcess"
                    )
                  }
                  disabled={disableImport() || shouldButtonsBeDisabled()}
                  style={{
                    cursor:
                      disableImport() || shouldButtonsBeDisabled()
                        ? "default"
                        : "pointer",
                  }}
                >
                  {spinner?.overwriteExistingProcess ? (
                    <>
                      <CircularProgress
                        style={{
                          width: "1rem",
                          height: "1rem",
                          color: "white",
                        }}
                      />
                      {t("overwriteExistingProcess")}
                    </>
                  ) : (
                    t("overwriteExistingProcess")
                  )}
                </button>
                {createNewVersionFlag && (
                  <button
                    id="pmweb_ImportExport_CreateNew"
                    className={styles.buttons}
                    onClick={(e) =>
                      handleSubmit(e, false, true, false, "createNewVersion")
                    }
                    disabled={disableImport() || shouldButtonsBeDisabled()}
                    style={{
                      cursor:
                        disableImport() || shouldButtonsBeDisabled()
                          ? "default"
                          : "pointer",
                    }}
                  >
                    {spinner?.createNewVersion ? (
                      <>
                        <CircularProgress
                          style={{
                            width: "1rem",
                            height: "1rem",
                            color: "white",
                          }}
                        />
                        {t("createNewVersion")}
                      </>
                    ) : (
                      t("createNewVersion")
                    )}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  id="pmweb_ImportExport_importAndopen"
                  variant="outlined"
                  className={styles.buttons}
                  style={{
                    cursor: (
                      disableImport() ||
                      shouldButtonsBeDisabled() ||
                      errorMsg != ""
                        ? true
                        : false
                    )
                      ? "default"
                      : "pointer",
                  }}
                  onClick={(e) =>
                    handleSubmit(e, false, false, true, "importAndOpen")
                  }
                  // tabIndex={0}
                  // onKeyDown={(e)=>handleImportandOpenKey(e)}
                  disabled={
                    disableImport() ||
                    shouldButtonsBeDisabled() ||
                    errorMsg != ""
                      ? true
                      : false
                  }
                >
                  {spinner?.importAndOpen ? (
                    <>
                      <CircularProgress
                        style={{
                          width: "1rem",
                          height: "1rem",
                          color: "white",
                        }}
                      />
                      {t("ImportAndOpen")}
                    </>
                  ) : (
                    t("ImportAndOpen")
                  )}
                </button>
                <button
                  id="pmweb_ImportExport_import"
                  variant="outlined"
                  className={styles.newVersionButton}
                  onClick={(e) =>
                    handleSubmit(e, false, false, false, "import")
                  }
                  disabled={disableImport() || shouldButtonsBeDisabled()}
                  style={{
                    cursor:
                      disableImport() || shouldButtonsBeDisabled()
                        ? "default"
                        : "pointer",
                  }}
                >
                  {spinner?.import ? (
                    <>
                      <CircularProgress
                        style={{
                          width: "1rem",
                          height: "1rem",
                          color: "var(--button_color)",
                        }}
                      />
                      {t("import")}
                    </>
                  ) : (
                    t("import")
                  )}
                </button>
              </>
            )}
          </>
        ) : (
          <button
            id="pmweb_ImportExport_export"
            className={styles.buttons}
            onClick={exportHandler}
            disabled={shouldButtonsBeDisabled()}
            style={{
              cursor: shouldButtonsBeDisabled() ? "default" : "pointer",
            }}
            tabIndex={0}
            onKeyUp={(e) => handleKeyExport(e)}
          >
            {spinner?.export ? (
              <>
                <CircularProgress
                  style={{
                    width: "1rem",
                    height: "1rem",
                    color: "white",
                  }}
                />
                {t("export")}
              </>
            ) : (
              t("export")
            )}
          </button>
        )}

        <button
          id="pmweb_ImportExport_cancel"
          variant="outlined"
          className={styles.cancelButton}
          onClick={closeHandler}
        >
          {t("cancel")}
        </button>
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

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    openProcessVersion: state.openProcessClick.selectedVersion,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportExportProcess);
