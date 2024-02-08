// #BugID - 123513
// #BugDescription - Fixed issue for the view is not coming in list structure that was given in UX. Checkboxes not working properly.
// #BugID - 126429
// #BugDescription - Fixed issue for screen distortation while creating the new form.
//Bug 130071 - fixed issue Jboss EAP+Oracle: Created by & Last edited details are showing as null for imported iform

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { store, useGlobalState } from "state-pool";
import {
  ARABIC_LOCALE,
  ARABIC_SA_LOCALE,
  BASE_URL,
  ENDPOINT_PROCESS_ASSOCIATION,
  SERVER_URL,
  SPACE,
} from "../../../Constants/appConstants";
import "./FormsListWithWorkstep.css";
import { VisibilityOutlined, VisibilityOffOutlined } from "@material-ui/icons";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import {
  Button,
  Checkbox,
  Popover,
  Radio,
  Tab,
  Tabs,
  Tooltip,
  withStyles,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
  Grid,
  Typography,
} from "@material-ui/core";
import editIcon from "../../../assets/icons/edit.svg";
import deleteIcon from "../../../assets/icons/reddelete.svg";
import styles from "./FormsListWithWorkstep.module.css";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Templates from "../Templates/Templates";
import FormsOtherProcesses from "../FormsOtherProcesses/FormsOtherProcesses";
import { LaunchpadTokenSliceValue } from "../../../redux-store/slices/LaunchpadTokenSlice";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import { CloseIcon } from "../../../utility/AllImages/AllImages";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import Modal from "../../../UI/Modal/Modal";
import ViewChangeModal from "../ViewChangeModal";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import secureLocalStorage from "react-secure-storage";
import { validateEntity } from "../../../utility/abstarctView/addWorkstepAbstractView";
import {
  // checkRegex,
  getLocale,
  isArabicLocaleSelected,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import { PMWEB_ARB_REGEX, PMWEB_REGEX } from "../../../validators/validator";
import ObjectDependencies from "../../../UI/ObjectDependencyModal";

const singleStyles = makeStyles({
  container1: {
    width: "100%",
    height: "100%",
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    background: "white",
  },
  container2: {
    width: "40%",
    //height: "40%",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    zIndex: "9999",
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgb(0,0,0,0.4)",
    background: "white",
  },
});

const useStyles = makeStyles({
  input: {
    height: "var(--line_height)",
    textAlign: "start",
  },
});

const replaceSpaceToUnderScore = (str) => {
  return str.replaceAll(" ", "_");
};

function FormsListWithWorkstep(props) {
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const { formAssociationType, setformAssociationType } = props;
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const formsList = store.getState("allFormsList");
  const [allFormsList, setallFormsList] = useGlobalState(formsList);
  const [selectedFormRadio, setselectedFormRadio] = useState(-1);
  const [tabValue, settabValue] = useState(0);
  const [showViewFormMF, setshowViewFormMF] = useState(false);
  const [mfFormId, setmfFormId] = useState();
  const [allActivities, setallActivities] = useState([]);
  const [hoverForm, sethoverForm] = useState();
  const [formAssociationData, setformAssociationData] = useGlobalState(
    "allFormAssociationData"
  );
  const [formAssocDataBeforeModify, setformAssocDataBeforeModify] = useState();
  const viewMap = {
    single: "multiple",
    multiple: "single",
  };
  const [openCreateFormPopover, setopenCreateFormPopover] = useState(false);
  const [openDeleteFormPopover, setopenDeleteFormPopover] = useState(false);
  const tokenValue = useSelector(LaunchpadTokenSliceValue);
  const [isFormAssociated, setisFormAssociated] = useState(false);
  const [formObjToBeDelete, setformObjToBeDelete] = useState(null);
  const [openCustomiseForm, setopenCustomiseForm] = useState(false);
  const [open, setopen] = useState(false);
  const [selectedPopoverForm, setselectedPopoverForm] = useState("");
  const [anchorElMF, setAnchorElMF] = React.useState(null);
  const [viewChangeConfirmationBoolean, setviewChangeConfirmationBoolean] =
    useState(false);
  const [openMultiple, setopenMultiple] = useState(false);
  const [anchorElMFMultiple, setAnchorElMFMultiple] = React.useState(null);
  const [selectedPopoverFormMultiple, setselectedPopoverFormMultiple] =
    useState("");
  const [
    viewChangeConfirmationBooleanMultiple,
    setviewChangeConfirmationBooleanMultiple,
  ] = useState(false);
  const formInput = useRef();
  const formDesign = singleStyles();
  const inputFileRef = useRef();

  const theme = useTheme();
  const matchesTab = useMediaQuery(theme.breakpoints.down("md"));
  const matchesLaptop = useMediaQuery(theme.breakpoints.up("md"));

  const matchesDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [processAssociation, setProcessAssociation] = useState(null); //Added on 28/10/2023, bug_id:140234

  useEffect(() => {
    setformAssocDataBeforeModify(formAssociationData);
  }, []);

  useEffect(() => {
    let arr = [];
    formAssociationData?.forEach((assocData) => {
      arr.push(+assocData.formId);
    });
    const result = arr.every((element) => {
      if (element === arr[0]) {
        return true;
      }
    });
    if (result) setselectedFormRadio(arr[0]);
  }, [formAssociationData?.length]);

  const CustomRadio = withStyles({
    root: {
      "&$checked": {
        color: "var(--radio_color)",
      },
    },
    checked: {},
  })((props) => <Radio type="radio" color="default" {...props} />);

  const classes = useStyles();

  const AntTabs = withStyles({
    root: {
      // borderBottom: "1px solid #e8e8e8",
      width: "70%",
      maxHeight: 40,
      minHeight: 10,
      fontSize: "var(--title_text_font_size)",
    },
    indicator: {
      backgroundColor: "var(--nav_primary_color)",
    },
  })(Tabs);

  const AntTab = withStyles((theme) => ({
    root: {
      minWidth: 50,
      minHeight: 10,
      maxHeight: 40,
      fontWeight: theme.typography.fontWeightRegular,
      //marginRight: theme.spacing(4),
      whiteSpace: "nowrap",
      fontSize: "var(--title_text_font_size)",

      "&$selected": {
        color: "var(--selected_tab_color)",
        fontWeight: theme.typography.fontWeightMedium,
        fontSize: "var(--title_text_font_size)",
      },
    },
    selected: {},
  }))((props) => <Tab disableRipple {...props} />);

  const handleChange = (event, newValue) => {
    settabValue(newValue);
  };

  useEffect(() => {
    props.settemplateData({});
    props.setformsOtherProcessObj({});
    setshowViewFormMF(false);
    setmfFormId(undefined);
  }, [tabValue]);

  useEffect(() => {
    moment.locale("en");
  }, []);

  const handleViewForm = ({ formId }) => {
    setshowViewFormMF(true);
    setmfFormId(formId);
  };

  const handleDeleteForm = async (form) => {
    // code edited on 24 Jan 2023 for BugId 122659
    let payload = {
      processId: localLoadedProcessData.ProcessDefId,
      processType: localLoadedProcessData.ProcessType,
      objectName: form?.formName,
      objectId: form?.formId,
      wsType: "FR",
      deviceType: "A",
    };
    const res = await axios.post(
      SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION,
      payload
    );

    /*  const res = await axios.get(
      SERVER_URL +
        "/validateObject/" +
        localLoadedProcessData.ProcessDefId +
        "/" +
        localLoadedProcessData.ProcessType +
        "/" +
        form.formName +
        "/" +
        form.formId +
        "/FR/A"
    );*/
    if (res?.status === 200) {
      if (res?.data?.Validations?.length > 0) {
        setisFormAssociated(true);
        setProcessAssociation(res?.data?.Validations); //Modified on 28/10/2023, bug_id:140234
      } else {
        setisFormAssociated(false);
        setProcessAssociation([]); //Modified on 28/10/2023, bug_id:140234
      }

      setopenMultiple(false);
      setopen(false);
      setformObjToBeDelete(form);
      setopenDeleteFormPopover(true);
    }
  };

  useEffect(() => {
    showFormPreview(mfFormId);
  }, [mfFormId]);

  const showFormPreview = (mfFormId) => {
    if (formAssociationData?.length > 0) {
      let passedData = {
        // applicationId: activeId,

        component: "preview",

        containerId: "mf_forms_show",

        formDefId: +mfFormId,

        processId: +localLoadedProcessData.ProcessDefId,

        // formName: obj.value.formName,

        // formType: props.formType,

        formPageType: "Processes",

        statusType: localLoadedProcessData.ProcessType,
      };
      window.loadFormBuilderPreview(passedData, "mf_forms_show");
    }
  };

  useEffect(() => {
    localLoadedProcessData.MileStones.forEach((mileStone) => {
      mileStone.Activities.forEach((activity, index) => {
        if (
          activity.ActivityType === 1 ||
          activity.ActivityType === 2 ||
          activity.ActivityType === 32 ||
          activity.ActivityType === 4 ||
          (activity.ActivityType === 10 &&
            (activity.ActivitySubType === 3 ||
              activity.ActivitySubType === 10 ||
              activity.ActivitySubType === 7 ||
              activity.ActivitySubType === 6)) ||
          (activity.ActivityType === 11 && activity.ActivitySubType === 1)
        )
          setallActivities((prevState) => [...prevState, activity]);
      });
    });
  }, []);

  const handleNewFormCreate = () => {
    setopenCreateFormPopover(true);
  };

  const handleFile = async (event) => {
    const file = event.target.files[0];

    if (event.target.files[0].size / 1024 / 1024 > 10) {
      dispatch(
        setToastDataFunc({
          message: t("fileSizeLarger10MB"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let errMsg = validateFormName(
        file?.name.split(".").slice(0, -1).join("")
      );
      // let regex = new RegExp(/^[\w\-\s]+$/);
      // let fileNameWithExtensionArr = file?.name.split(".");
      // fileNameWithExtensionArr.pop();
      // let fileName = fileNameWithExtensionArr.join(".");
      if (errMsg === null) {
        let formData = new FormData();
        formData.append("file", file);
        formData.append(
          "formName",
          file?.name.split(".").slice(0, -1).join(".")
        );
        formData.append("processDefId", +localLoadedProcessData.ProcessDefId);

        try {
          const res = await axios.post(
            BASE_URL + `/process/local/form`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                //Authorization: tokenValue,
              },
            }
          );
          if (res.status === 200 && res?.data?.statusCodeValue === 200) {
            let temp = JSON.parse(JSON.stringify(allFormsList));
            temp.push(res?.data?.body);
            setallFormsList(temp);
            dispatch(
              setToastDataFunc({
                message: t("formImported"),
                severity: "success",
                open: true,
              })
            );
          } else {
            dispatch(
              setToastDataFunc({
                message: res?.data?.errorMsg,
                severity: "error",
                open: true,
              })
            );
          }
        } catch (error) {
          //code added for bug id 138998 on 27-10
          dispatch(
            setToastDataFunc({
              message: error?.response?.data?.errorMsg,
              severity: "error",
              open: true,
            })
          );
        }
      } else {
        dispatch(
          setToastDataFunc({
            message: errMsg,
            severity: "error",
            open: true,
          })
        );
      }
    }
  };

  const dropHandler = async (ev) => {
    ev.preventDefault();

    if (ev.dataTransfer.items) {
      let file;
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          file = item.getAsFile();
          console.log(`… file[${i}].name = ${file.name}`);
        }
      });

      //code changes for bug id 130879
      if (file?.size / 1024 / 1024 > 10) {
        dispatch(
          setToastDataFunc({
            message: t("fileSizeLarger10MB"),
            severity: "error",
            open: true,
          })
        );
      } else {
        let regex = new RegExp(/^[\w\-\s]+$/);

        if (regex.test(file?.name.split(".").slice(0, -1).join(""))) {
          let formData = new FormData();
          formData.append("file", file);
          formData.append(
            "formName",
            file?.name.split(".").slice(0, -1).join(".")
          );
          formData.append("processDefId", +localLoadedProcessData.ProcessDefId);

          try {
            const res = await axios.post(
              BASE_URL + `/process/local/form`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  // Authorization: tokenValue,
                },
              }
            );
            if (res.status === 200 && res?.data?.statusCodeValue === 200) {
              let temp = JSON.parse(JSON.stringify(allFormsList));
              temp.push(res?.data?.body);
              setallFormsList(temp);
              dispatch(
                setToastDataFunc({
                  message: t("formImported"),
                  severity: "success",
                  open: true,
                })
              );
            } else {
              dispatch(
                setToastDataFunc({
                  message: res?.data?.errorMsg,
                  severity: "error",
                  open: true,
                })
              );
            }
          } catch (error) {
            dispatch(
              setToastDataFunc({
                message: error?.response?.data?.errorMsg,
                severity: "error",
                open: true,
              })
            );
          }
        } else {
          dispatch(
            setToastDataFunc({
              message: t("onlyAlphanumericAllowed"),
              severity: "error",
              open: true,
            })
          );
        }
      }
    }
  };

  const dragOverHandler = (ev) => {
    ev.preventDefault();
  };

  const checkRegex = (str, engRegex, arbRegex) => {
    //code modified for bug id 138524 on 14-10-23
    /* if (isArabicLocaleSelected()) {
      const regex = new RegExp(arbRegex);
      return regex.test(str);
    } else {
      const regex = new RegExp(engRegex);
      return regex.test(str);
    }*/
    return /^[a-zA-Z\u0621-\u064A][a-zA-Z0-9\u0621-\u064A\s]*$/u.test(str);
  };
  const validateFormName = (value) => {
    let tmpNameErrors = null;
    if (value?.trim() === "") {
      tmpNameErrors = t("formNameEmptyError");
    } else {
      if (
        !checkRegex(value, PMWEB_REGEX.Form_Name, PMWEB_ARB_REGEX.Form_Name)
      ) {
        if (isArabicLocaleSelected()) {
          tmpNameErrors =
            t("formName") +
            SPACE +
            t("cannotContain") +
            SPACE +
            "~ ` ! @ # $ % ^ & * ( ) + = { } | [ ] \\ : \" ; ' < > ? , . /" +
            SPACE +
            t("charactersInIt");
        } else {
          tmpNameErrors =
            t("AllCharactersAreAllowedExcept") +
            SPACE +
            "~ ` ! @ # $ % ^ & * ( ) + = { } | [ ] \\ : \" ; ' < > ? , . /" +
            SPACE +
            t("in") +
            SPACE +
            t("formName") +
            ".";
        }
      } else if (value.length > 50) {
        tmpNameErrors = t("messages.minMaxChar", {
          maxChar: 50,
          entityName: t("formName"),
        });
      }
    }
    return tmpNameErrors;
  };

  const NewFormPopover = (props) => {
    const [newFormName, setnewFormName] = useState("");
    const [errMsg, setErrMsg] = useState(null);

    const handleCreateNewForm = async () => {
      let processType =
        localLoadedProcessData.ProcessType === "L" ? "local" : "registered";
      try {
        const res = await axios.post(
          BASE_URL + `/process/${processType}/form`,
          {
            formBuffer: "",
            formName: newFormName,
            processDefId: +localLoadedProcessData.ProcessDefId,
          }
        );
        if (res?.status === 200) {
          let temp = JSON.parse(JSON.stringify(allFormsList));
          temp.push(res?.data);
          setallFormsList(temp);
          setopenCreateFormPopover(false);
        } else if (res?.data?.errorMsg) {
          dispatch(
            setToastDataFunc({
              message: res?.data?.errorMsg,
              severity: "error",
              open: true,
            })
          );
        }
      } catch (error) {
        dispatch(
          setToastDataFunc({
            message: error?.response?.data?.errorMsg,
            severity: "error",
            open: true,
          })
        );
      }
    };

    return (
      <div
        className={
          formAssociationType === "multiple"
            ? formDesign.container2
            : formDesign.container1
        }
      >
        <div
          style={{
            width: "100%",
            borderBottom: "1px solid rgb(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: "1vw",
            fontSize: "var(--title_text_font_size)",
            fontWeight: "600",
          }}
        >
          {t("newForm")}
          <IconButton
            aria-label="Close"
            onClick={() => {
              formAssociationType == "single"
                ? props.onClose()
                : setopenCreateFormPopover(false);
            }}
            id="pmweb_FormList_CloseIcon"
            /*  tabindex={0}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                if (formAssociationType == "single") {
                  props.onClose();
                } else {
                  setopenCreateFormPopover(false);
                }
              }
            }}
            
            */
          >
            <CloseIcon
              style={{
                width: "1rem",
                height: "1rem",
                cursor: "pointer",
              }}
            />
          </IconButton>
        </div>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            paddingInline: "1vw",
            fontWeight: "500",
            paddingBlock: "3%",
            color: "#606060",
            gap: "0.25rem",
          }}
        >
          <div>
            <label
              htmlFor="pmweb_FormList_formName"
              style={{
                fontWeight: "500",
                fontSize: "var(--base_text_font_size)",
              }}
            >
              {t("formName")}
            </label>
            <span
              style={{
                color: "rgb(181,42,42)",
                marginInlineStart: "0.25vw",
                fontSize: "1rem",
              }}
            >
              *
            </span>
          </div>
          <input
            value={newFormName}
            id="pmweb_FormList_formName"
            onChange={(e) => {
              let msg = validateFormName(e.target.value);
              setErrMsg(msg);
              setnewFormName(e.target.value);
            }}
            className={classes.input}
            style={{
              fontSize: "var(--base_text_font_size)",
              border: errMsg ? "1px solid #b52a2a" : "1px solid #d3caca",
            }}
            ref={formInput}
            onKeyPress={(e) => FieldValidations(e, 183, formInput.current, 50)}
            maxRows={3}
            size="small"
            autoFocus={true}
            variant="outlined"
          />
          <p
            style={{
              color: "#b52a2a",
              font: "normal normal 600 11px/16px Open Sans",
            }}
          >
            {errMsg}
          </p>
        </div>
        <div
          style={{
            width: "100%",
            height: "25%",

            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            // paddingInline: "10px",
            fontSize: "var(--base_text_font_size)",
            fontWeight: "bold",
            paddingInlineEnd: "1rem",
          }}
        >
          <button
            disabled={newFormName?.trim() === "" || errMsg ? true : false}
            style={{
              marginInline: "5px",
              width: "50px",
              height: "25px",
              background:
                newFormName?.trim() === "" || errMsg
                  ? "rgb(0, 114, 198, 0.5)"
                  : "var(--button_color)",
              border: "none",
              color: "white",
              cursor:
                newFormName?.trim() === "" || errMsg ? "default" : "pointer",
            }}
            onClick={() => handleCreateNewForm()}
            id="pmweb_formList_create"
          >
            {t("create")}
          </button>
          <button
            style={{
              width: "50px",
              height: "25px",
              background: "white",
              border: "1px solid #C4C4C4",
              color: "#606060",
              cursor: "pointer",
            }}
            onClick={() => setopenCreateFormPopover(false)}
            id="pmweb_FormList_CancelIcon"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    );
  };

  const CustomiseFormPopover = ({
    formId,
    setopenCustomiseForm,
    showFormPreview,
  }) => {
    useEffect(() => {
      customiseFormFunction();
    }, [formId]);

    const customiseFormFunction = () => {
      if (formAssociationData?.length > 0) {
        let passedData = {
          // applicationId: activeId,
          component: "app",
          // containerId: "mf_formPreview",
          formDefId: +formId,
          processId: +localLoadedProcessData.ProcessDefId,
          //formName: obj.value.formName,
          //formType: props.formType,
          //formPageType: formType,
          processName: localLoadedProcessData.ProcessName,
          statusType: localLoadedProcessData.ProcessType,
          token: JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token,
        };

        window.loadFormBuilderPMWEB("mf_forms_customise", passedData);
      }
    };

    return (
      <div
        style={{
          width: "98vw",
          height: "98vh",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: "9999",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgb(0,0,0,0.4)",
          background: "white",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "8%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: "1.5rem",
          }}
        >
          <p style={{ fontSize: "var(--title_text_font_size)" }}>
            {t("formBuilder")}
          </p>
          <IconButton
            onClick={() => {
              setopenCustomiseForm(false);
              customiseFormFunction();
              showFormPreview(formId);
            }}
            id="pmweb_formBuilder_Close"
            //code added for bug id 136310

            aria-label="Close"
          >
            <CloseIcon
              style={{
                width: "1.3rem",
                height: "1.3rem",
                cursor: "pointer",
              }}
            />
          </IconButton>
        </div>
        <div style={{ width: "100%", height: "92%", overflow: "hidden" }}>
          <div id="mf_forms_customise" style={{ height: "inherit" }}></div>
        </div>
      </div>
    );
  };

  const getFormDetailsById = (id) => {
    let temp = {};
    allFormsList.some((form) => {
      if (form.formId + "" === id + "") {
        temp = form;
        return true;
      }
    });
    return temp;
  };

  const handleRadioClickForm = (val) => {
    let id = val;
    if (showViewFormMF) {
      handleViewForm({ formId: val });
    }
    const otherActData = [];
    setselectedFormRadio(id);
    let temp = JSON.parse(JSON.stringify(formAssociationData));
    temp?.forEach((assocData) => {
      assocData.formId = id + "";
    });
    allActivities.forEach((act) => {
      otherActData.push({
        activity: {
          actId: act.ActivityId + "",
          actName: act.ActivityName,
        },
        formId: id + "",
      });
    });
    let newArr = [...temp, ...otherActData];
    const unique = [
      ...new Map(newArr.map((item) => [item.activity.actId, item])).values(),
    ];

    setformAssociationData(unique);
  };

  const handleClose = () => {
    setAnchorElMF(null);
    setopen(false);
  };

  const handleTypeChangeMF = (event, form) => {
    event.stopPropagation();
    setopen(true);
    setAnchorElMF(event?.currentTarget);
    setselectedPopoverForm(form);
  };

  const viewChangeHandler = () => {
    let prevArr = formAssocDataBeforeModify?.map(
      (assocData) => assocData.formId + ""
    );
    let currentArr = formAssociationData?.map(
      (assocData) => assocData.formId + ""
    );
    if (prevArr.length === currentArr.length) {
      let flag = true;
      for (let x in prevArr) {
        if (prevArr[x] !== currentArr[x]) {
          flag = false;
          break;
        }
      }
      if (!flag) setviewChangeConfirmationBoolean(true);
      else props.setformAssociationType((prev) => viewMap[prev]);
    } else setviewChangeConfirmationBoolean(true);
  };

  const deleteFormConfirmationHandler = async () => {
    const res = await axios.post(
      BASE_URL +
        `/process/local/${localLoadedProcessData.ProcessDefId}/${formObjToBeDelete.formId}`,
      {
        withCredentials: true,
      }
    );
    if (res.status === 200) {
      let temp = global.structuredClone(formAssociationData);

      temp.forEach((assocData) => {
        if (assocData.formId == formObjToBeDelete.formId) {
          assocData.formId = "-1";
        }
      });

      setformAssociationData(temp);
      let formsList = global.structuredClone(allFormsList);
      formsList = formsList.filter(
        (form) => form.formId != formObjToBeDelete.formId
      );
      setallFormsList(formsList);
      if (formsList.length === 1) {
        //only form left is html form which has form id as -1
        handleRadioClickForm(-1);
      } else if (
        formsList.length > 1 &&
        selectedFormRadio === formObjToBeDelete.formId
      ) {
        //in case of deleting the selected form while having  other forms
        const deletedFormIndex = allFormsList.findIndex(
          (form) => form.formId === formObjToBeDelete.formId
        );
        if (deletedFormIndex !== -1) {
          const newSelectedFormId = formsList[deletedFormIndex - 1]?.formId;
          handleRadioClickForm(newSelectedFormId);
        }
      }
      setopenDeleteFormPopover(false);
    }
  };

  const DeleteFormPopover = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "20%",
          borderBottom: "1px solid rgb(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          paddingInline: "15px",
          fontSize: "var(--base_text_font_size)",
          fontWeight: "bold",
        }}
      >
        {t("deleteForm")}
      </div>
      <div
        style={{
          width: "100%",
          height: "55%",

          display: "flex",
          flexDirection: "column",

          paddingInline: "15px",

          fontWeight: "500",
          paddingTop: "3%",
          color: "#606060",
          fontSize: "var(--base_text_font_size)",
        }}
      >
        <p
          style={{
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          {`${t("surePermanentlyDelete")} ${formObjToBeDelete?.formName}?`}
        </p>
        {isFormAssociated ? (
          <p>{t("deleteFormWillDeassociate")}</p>
        ) : (
          <p>{t("notAbleToUndoAction")}</p>
        )}
      </div>
      <div
        style={{
          width: "100%",
          height: "25%",

          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          // paddingInline: "10px",
          fontSize: "var(--base_text_font_size)",
          fontWeight: "bold",
          paddingInlineEnd: "1rem",
        }}
      >
        <button
          style={{
            marginInline: "5px",

            height: "25px",
            background: "#D53D3D",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => deleteFormConfirmationHandler()}
          id="pmweb_formList_deleteForm_deleteConfirm"
          aria-label={isFormAssociated ? t("yes,continue") : t("delete")}
        >
          {isFormAssociated ? t("yes,continue") : t("delete")}
        </button>
        <button
          style={{
            width: "50px",
            height: "25px",
            background: "white",
            border: "1px solid #C4C4C4",
            color: "#606060",
            cursor: "pointer",
          }}
          onClick={() => setopenDeleteFormPopover(false)}
          id="pmweb_formList_deleteForm_Cancel"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );

  const handleCustomizeFormInNewTab = (formId) => {
    // if(url?.origin !== "" && window.location.href.indexOf("pmWebDesigner") > -1 ){

    // 👇️ setting target to _blank with window.open

    const url1 = `${window.origin}/appformBuilder/pmWebDesigner`;
    let passedData = {
      component: "app",

      formDefId: +formId,
      processId: +localLoadedProcessData.ProcessDefId,
      formPageType: "Processes", //added on 03-07-2023, bug id:131574
      processName: localLoadedProcessData.ProcessName,
      statusType: localLoadedProcessData.ProcessType,
      token: JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token,
    };
    window.newMicroFrontendData = { ...passedData, url1 };

    //var newPreviewVar = window.open(`${url.origin}/appformBuilder/pmWebPreview`, '_blank', 'noopener,noreferrer');

    var newPreviewVar = window.open(
      `${window.origin}/appformBuilder/pmWebDesigner`
    );

    newPreviewVar.newMicroFrontendData = { ...passedData, url1 };
  };

  const SingleFormView = (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {openDeleteFormPopover && (
          <Modal
            style={{
              height: isFormAssociated ? "none:" : "30%", //Modified on 28/10/2023, bug_id:140234
              // height: "30"
              position: "fixed",
              display: "flex",
              flexDirection: "column",
              background: "white",
              top: "50%",
              left: "50%",
              width: "450px",
              padding: "0",
              zIndex: "1500",
              transform: "translate(-50%,-50%)",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
            }}
            show={openDeleteFormPopover}
            // backDropStyle={{ backgroundColor: "transparent" }}
            modalClosed={() => setopenDeleteFormPopover(false)}
            //children={<>{DeleteFormPopover}</>}
            //Modified on 28/10/2023, bug_id:140234

            children={
              isFormAssociated ? (
                <ObjectDependencies
                  {...props}
                  processAssociation={processAssociation}
                  cancelFunc={() => setopenDeleteFormPopover(false)}
                />
              ) : (
                <>{DeleteFormPopover}</>
              )
            }
            //till here for bug_id:140234
          />
        )}
        <Popover
          open={open}
          anchorEl={anchorElMF}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <div
            style={{
              width: "10rem",
              height: "5rem",
              display: "flex",
              flexDirection: "column",
              padding: "0.5rem",
              fontSize: "var(--base_text_font_size)",
              border: "1px solid #70707075",
              cursor: "pointer",
            }}
          >
            <div
              style={{ marginBlock: "4px" }}
              /* onClick={() => {
                // code edited on 10 March 2023 for BugId 124827
                setopen(false);
                // code edited on 10 March 2023 for BugId 124826
                setmfFormId(selectedPopoverForm?.formId);
                setopenCustomiseForm(true);
              }}*/
              onClick={() =>
                handleCustomizeFormInNewTab(selectedPopoverForm?.formId)
              }
              id="pmweb_formList_formInNewTab"
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleCustomizeFormInNewTab(selectedPopoverForm?.formId);
                }
              }}
            >
              <img src={editIcon} alt={t("edit")} />
              <span style={{ marginInline: "10px" }}>{t("edit")}</span>
            </div>
            <div
              onClick={() => handleDeleteForm(selectedPopoverForm)}
              id="pmweb_formList_handleDelete"
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleDeleteForm(selectedPopoverForm);
                }
              }}
            >
              <img src={deleteIcon} alt={t("delete")} />
              <span style={{ color: "red", marginInline: "10px" }}>
                {t("delete")}
              </span>
            </div>
          </div>
        </Popover>
        {openCustomiseForm && (
          <CustomiseFormPopover
            formId={mfFormId}
            showFormPreview={showFormPreview}
            setopenCustomiseForm={setopenCustomiseForm}
          />
        )}
        {openCreateFormPopover && (
          <Modal
            show={openCreateFormPopover}
            // backDropStyle={{ backgroundColor: "transparent" }}
            style={{
              top: "50%",
              left: "50%",
              width: "35vw",
              padding: "0",
              height: "31vh",
              zIndex: "1900",
              transform: "translate(-50%,-50%)",
              boxShadow: "0px 3px 6px #00000029",
              borderRadius: "3px",
            }}
            modalClosed={() => setopenCreateFormPopover(false)}
            children={
              <NewFormPopover onClose={() => setopenCreateFormPopover(false)} />
            }
          />
        )}
        <AntTabs
          value={tabValue}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <AntTab
            label={t("FormsCreatedForThisProcess")}
            id={`pmweb_formList_antTab_${replaceSpaceToUnderScore(
              t("FormsCreatedForThisProcess")
            )}`}
            tabindex={0}
          />
          <AntTab
            label={t("FormsInOtherProcesses")}
            id={`pmweb_formList_antTab_${replaceSpaceToUnderScore(
              t("FormsInOtherProcesses")
            )}`}
            tabindex={0}
          />
          <AntTab
            label={t("templates")}
            id={`pmweb_formList_antTab_${replaceSpaceToUnderScore(
              t("templates")
            )}`}
            tabindex={0}
          />
        </AntTabs>
        {/* Change on 07-09-2023 to resolve the bug Id cgi id=131191 */}
        <div>
          <p
            style={{
              fontSize: "var(--subtitle_text_font_size)",
              fontWeight: "600",
              color: "var(--link_color)",
              cursor: "pointer",
              textOverflow: "ellipsis",
              // marginLeft: matchesTab ? "3rem" : "40rem",
            }}
            onClick={() => viewChangeHandler()}
            id={`pmweb_formList_${replaceSpaceToUnderScore(
              t("Workstepwiseformassociation")
            )}`}
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                viewChangeHandler();
              }
            }}
          >
            {/**code chnages for bug id 136732 */}
            {t("Workstepwiseformassociation")}
          </p>
        </div>
      </div>
      <Divider></Divider>
      {viewChangeConfirmationBoolean ? (
        <Modal
          show={viewChangeConfirmationBoolean}
          // backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            top: "50%",
            left: "50%",
            width: "450px",
            padding: "0",
            zIndex: "1500",
            transform: "translate(-50%,-50%)",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          modalClosed={() => setviewChangeConfirmationBoolean(false)}
          children={
            <ViewChangeModal
              setformAssociationType={setformAssociationType}
              setviewChangeConfirmationBoolean={
                setviewChangeConfirmationBoolean
              }
              formAssociationData={formAssociationData}
              setformAssociationData={setformAssociationData}
            />
          }
        />
      ) : null}
      {tabValue === 0 ? (
        <Grid
          container
          style={{
            paddingInlineStart: "2rem",
            marginTop: "0.6rem",
            marginBlockEnd: "0.6rem",
            width: showViewFormMF ? "50%" : "100%",
          }}
        >
          <Grid item xs={!showViewFormMF ? 5 : 10}>
            <p className={styles.heading}>{t("formName")}</p>
          </Grid>
          {!showViewFormMF && (
            <Grid item xs={3}>
              <p className={styles.heading}>{t("createdBy")}</p>
            </Grid>
          )}

          {!showViewFormMF && (
            <Grid item xs={3}>
              <p className={styles.heading}>{t("lastEditedOn")}</p>
            </Grid>
          )}
          <Grid item xs={!showViewFormMF ? 1 : 2}></Grid>
        </Grid>
      ) : null}
      <Grid container style={{ height: "70%", flexGrow: "1" }}>
        <Grid
          item
          container
          style={{
            display: "flex",
            width: showViewFormMF ? "50%" : "100%",
            flexDirection: "column",
            height: "100%",
            flexWrap: "nowrap",
          }}
          justifyContent="space-between"
        >
          <Grid
            item
            container
            style={{
              paddingInlineStart: "2rem",
              marginTop: "0.6rem",
              marginBlockEnd: "0.6rem",
              //height: "fit-content",
              overflow: "auto",
            }}
          >
            {tabValue === 0
              ? allFormsList.map((form, index) => (
                  <Grid
                    container
                    style={{
                      width: "100%",
                      height: "40px",
                      //Modified  on 17/08/2023, bug_id:131753
                      // border:
                      //   selectedFormRadio === form.formId
                      //     ? "1px solid #0172C6"
                      //     : "1px solid transparent",
                      border:
                        mfFormId === form.formId && showViewFormMF
                          ? "1px solid #0172C6"
                          : "1px solid transparent",
                      //marginBlock: "2px",
                      // color: "var(--button_color)",
                      //fontWeight: "600",
                      background: "#FFFFFF 0% 0% no-repeat padding-box",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      cursor: "pointer",
                      alignItems: "center",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRadioClickForm(+form.formId);
                    }}
                    id={`pmweb_formList_SingleForm_radio_${index}`}
                    key={+form.formId}
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        handleRadioClickForm(+form.formId);
                      }
                    }}
                  >
                    {/* Changes made to solve Bug 135679 */}

                    <Grid item xs={!showViewFormMF ? 5 : 10}>
                      <Grid
                        container
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          flexWrap: "nowrap",
                        }}
                      >
                        <CustomRadio
                          tabIndex={-1}
                          type="radio"
                          // size="small"
                          checked={selectedFormRadio === form.formId}
                          onChange={(e) =>
                            handleRadioClickForm(+e.target.value)
                          }
                          id={`pmweb_formList_SingleForm_radioBtn_${index}`}
                          value={form.formId}
                          name="radio-button-demo"
                        />
                        <Typography
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            fontWeight: "bold",
                          }}
                        >
                          {form.deviceType}
                        </Typography>
                        <Typography
                          htmlFor={`pmweb_formList_SingleForm_radioBtn_${index}`}
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            fontWeight: "500",
                            marginInline: "0.6rem",
                            wordBreak: "break-word",
                          }}
                        >
                          {form.formName}
                        </Typography>
                      </Grid>
                    </Grid>
                    {!showViewFormMF && (
                      <Grid item xs={3}>
                        {form.formId !== -1 ? (
                          <Grid
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "var(--base_text_font_size)",
                                fontWeight: "500",
                              }}
                            >
                              {form.createdby}
                            </p>
                            <p
                              style={{
                                fontSize: "var(--base_text_font_size)",
                                fontWeight: "500",
                                opacity: "0.7",
                              }}
                            >
                              {moment(form.createddatetime).diff(
                                new Date(),
                                "days"
                              )
                                ? t("on")
                                : t("at")}{" "}
                              {new Date().getFullYear() -
                                form.createddatetime.split("-")[0] !=
                              "0" ? (
                                moment(form.createddatetime).format(
                                  "MMM DD YYYY"
                                )
                              ) : (
                                <>
                                  {" "}
                                  {!moment(form.createddatetime).diff(
                                    new Date(),
                                    "days"
                                  )
                                    ? moment(form.createddatetime).format(
                                        "h:mm A"
                                      )
                                    : moment(form.createddatetime).format(
                                        "MMM DD"
                                      )}
                                </>
                              )}
                            </p>
                          </Grid>
                        ) : null}
                      </Grid>
                    )}

                    {!showViewFormMF && (
                      <Grid item xs={3}>
                        {form.formId !== -1 ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "var(--base_text_font_size)",
                                fontWeight: "500",
                              }}
                            >
                              {new Date().getFullYear() -
                                form.createddatetime.split("-")[0] !=
                              "0"
                                ? moment(form.lastModifiedOn).format(
                                    "MMM DD YYYY"
                                  )
                                : moment(form.lastModifiedOn).format("MMM DD")}
                            </p>
                            <p
                              style={{
                                fontSize: "var(--base_text_font_size)",
                                fontWeight: "500",
                                opacity: "0.7",
                              }}
                            >
                              {t("processesTable.editedBy")}{" "}
                              {form.lastModifiedby} {t("processesTable.at")}{" "}
                              {moment(form.lastModifiedOn).format("h:mm A")}
                            </p>
                          </div>
                        ) : null}
                      </Grid>
                    )}
                    <Grid item xs={!showViewFormMF ? 1 : 2}>
                      {form.formId !== -1 ? (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            padding: "5px",
                            justifyContent: "flex-end",
                          }}
                        >
                          {mfFormId === form.formId ? (
                            <VisibilityOffOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                setshowViewFormMF(false);
                                setmfFormId(null);
                              }}
                              id="pmweb_formList_VisibilityOff"
                              fontSize="medium"
                              style={{
                                color: "black",
                                opacity: "0.5",
                                width: "1.6rem",
                                height: "1.6rem",
                              }}
                              tabindex={0}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  setshowViewFormMF(false);
                                  setmfFormId(null);
                                }
                              }}
                              aria-label={`${t("Show Form")}`}
                            />
                          ) : (
                            <>
                              <VisibilityOutlined
                                aria-label={`${t("Hide Form")}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewForm(form);
                                }}
                                id="pmweb_formList_VisibilityOn"
                                fontSize="medium"
                                style={{
                                  color: "black",
                                  opacity: "0.5",
                                  width: "1.6rem",
                                  height: "1.6rem",
                                }}
                                tabindex={0}
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleViewForm(form);
                                  }
                                }}
                              />
                              <MoreVertIcon
                                onClick={(e) => handleTypeChangeMF(e, form)}
                                id="pmweb_formList_VisibilityChange"
                                className={styles.moreVertIcon}
                                tabindex={0}
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    handleTypeChangeMF(e, form);
                                  }
                                }}
                              />
                            </>
                          )}
                        </div>
                      ) : null}
                    </Grid>
                  </Grid>
                ))
              : null}
            {tabValue === 1 ? (
              <FormsOtherProcesses
                handleRadioClickForm={handleRadioClickForm}
                formAssociationData={formAssociationData}
                setformsOtherProcessObj={props.setformsOtherProcessObj}
              />
            ) : null}
            {tabValue === 2 ? (
              <Templates
                formAssociationData={formAssociationData}
                settemplateData={props.settemplateData}
              />
            ) : null}
          </Grid>
          <Grid
            item
            style={{
              width: "100%",
              border: "1px dashed #606060",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingInline: "5%",
              minHeight: "100px",

              //code removed for bug  id 130818 on 10-10-23
              // position: "absolute",
              // bottom: "-2rem",
              //  marginBottom: ".5rem",
            }}
            id="drop_zone"
            onDrop={(e) => dropHandler(e)}
            onDragOver={(e) => dragOverHandler(e)}
          >
            <p
              style={{
                fontSize: "var(--title_text_font_size)",
                color: "#606060",
                fontWeight: "600",
              }}
            >
              {t("dropFormsHere")}
            </p>
            <p
              style={{
                fontSize: " var(--title_text_font_size)",
                color: "#606060",
                fontWeight: "600",
              }}
            >
              {t("or")}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: showViewFormMF && matchesTab ? "column" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "24rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "11rem",
                  whiteSpace: "nowrap",
                  height: "2.3rem",
                  fontSize: "var(--base_text_font_size)",
                  border: "1px solid var(--button_color)",
                  color: "var(--button_color)",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginRight: "11px",
                }}
                tabIndex={0}
                onKeyUp={(e) => {
                  if (e.key == "Enter") {
                    inputFileRef.current.click();
                  }
                }}
              >
                <input
                  ref={inputFileRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => handleFile(e)}
                  accept="application/x-zip-compressed"
                />
                {t("Import From Pc")}
              </label>

              <Button
                // style={{ marginInline: "0.8rem" }}
                className={styles.button}
                variant="outlined"
                onClick={handleNewFormCreate}
              >
                {t("createNewForm")}
              </Button>
            </div>
          </Grid>
        </Grid>
        {showViewFormMF ? (
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "var(--title_text_font_size)",
              background: "#0172C61A",
              alignItems: "center",
              height: "100%",
              flexWrap: "nowrap",
              justifyContent: "center",
            }}
            item
            xs={6}
          >
            <Grid
              item
              container
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                //height: "15%",
                justifyContent: "space-between",
                paddingInline: "2%",
                flexWrap: "nowrap",
              }}
            >
              <Grid item xs={6}>
                <p style={{ fontWeight: "600", wordWrap: "break-word" }}>
                  {getFormDetailsById(mfFormId).formName}
                </p>
              </Grid>
              <Grid item>
                <button
                  style={{
                    width: "150px",
                    height: "1.75rem",
                    marginInline: "10px",
                    color: "var(--button_color)",
                    border: "1px solid var(--button_color)",
                    borderRadius: "0.125rem",
                    //code added for bug id 136310
                    backgroundColor: "transparent",
                  }}
                  //onClick={() => setopenCustomiseForm(true)}
                  onClick={() => handleCustomizeFormInNewTab(mfFormId)}
                >
                  {t("customiseThisForm")}
                </button>
                <IconButton
                  onClick={() => {
                    setshowViewFormMF(false);
                    setmfFormId(null);
                  }}
                  tabindex={0}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      setshowViewFormMF(false);
                      setmfFormId(null);
                    }
                  }}
                  //code added for bug id 136310

                  aria-label="Close"
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Grid
              item
              id="mf_forms_show"
              style={{
                width: "96%",
                height: "85%",
                overflow: "hidden",
                display: showViewFormMF ? "" : "none",
              }}
            ></Grid>
          </Grid>
        ) : null}
      </Grid>

      {/* </div> */}
    </>
  );

  function sameMembers(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    return (
      arr1.every((item) => set2.has(item)) &&
      arr2.every((item) => set1.has(item))
    );
  }

  const checkAllFormEnabled = (formId) => {
    if (!formId) {
      let actArr = [];
      let assocArr = [];
      allActivities.forEach((act) => {
        actArr.push(+act.ActivityId);
      });
      formAssociationData?.forEach((assocData) => {
        if (assocData.activity?.operationType !== "D")
          assocArr.push(+assocData?.activity?.actId);
      });
      return sameMembers(actArr, assocArr);
    } else {
      let flag = true;
      let temp = global.structuredClone(formAssociationData);
      temp?.forEach((assocData) => {
        // code edited on 11 March 2023 for BugId 119752
        if (
          +assocData.formId !== +formId ||
          (+assocData.formId === +formId &&
            assocData.activity?.operationType === "D")
        ) {
          flag = false;
        }
      });
      return flag;
    }
  };

  const getCheckBoolFormAssoc = (formId, actId) => {
    let temp = false;
    formAssociationData?.some((assocData) => {
      if (assocData.activity.actId == actId) {
        if (assocData.formId == formId) temp = true;
        return true;
      }
    });

    return temp;
  };

  const handleFormAssocChange = (e, actId, actName, formName) => {
    let temp = JSON.parse(JSON.stringify(formAssociationData));
    temp?.some((assocData) => {
      if (assocData.activity.actId == actId) {
        assocData.formId = e.target.value + "";

        return true;
      }
    });

    let newAssoc = {
      activity: { actId: actId + "", actName },
      formId: e.target.value + "",
    };
    temp.push(newAssoc);
    const unique = [
      ...new Map(temp.map((item) => [item.activity.actId, item])).values(),
    ];
    setformAssociationData(unique);
    props.modifiedAssociationJson(unique);
  };

  const extraHeaders = [
    { formName: "Form Enabled" },
    { formName: "Workstep Name" },
  ];

  const checkFormEnabled = (actId) => {
    let temp = false;
    formAssociationData?.forEach((assocData) => {
      // code edited on 11 March 2023 for BugId 119752
      if (
        +assocData.activity.actId === +actId &&
        assocData.activity?.operationType !== "D"
      ) {
        temp = true;
      }
    });
    return temp;
  };

  const formEnabledHandler = (e, act) => {
    let temp = global.structuredClone(formAssociationData);
    if (!e.target.checked) {
      temp.forEach((assocData, index) => {
        if (assocData.activity.actId == act.ActivityId) {
          assocData.activity.operationType = "D";
        }
      });
    } else {
      temp.push({
        formId: "-1",
        activity: {
          actId: act.ActivityId,
          actName: act.ActivityName,
        },
      });
    }
    setformAssociationData(temp);
  };

  const formCheckHandler = (e, formId) => {
    let temp = global.structuredClone(formAssociationData);

    if (e.target.checked) {
      temp = [];
      allActivities.forEach((act) => {
        temp.push({
          formId: !!formId ? formId : "-1",
          activity: {
            actId: act.ActivityId,
            actName: act.ActivityName,
          },
        });
      });
    } else {
      temp = [];
      allActivities.forEach((act) => {
        temp.push({
          formId: !!formId ? formId : "",
          activity: {
            actId: act.ActivityId,
            actName: act.ActivityName,
            operationType: "D",
          },
        });
      });
    }

    setformAssociationData(temp);
  };

  const handleCloseMultiple = () => {
    setAnchorElMFMultiple(null);
    setopenMultiple(false);
  };

  const handleTypeChangeMFMultiple = (event, form) => {
    event.stopPropagation();
    setopenMultiple(true);
    setAnchorElMFMultiple(event?.currentTarget);
    setselectedPopoverFormMultiple(form);
  };

  const viewChangeHandlerMultiple = () => {
    let prevArr = formAssocDataBeforeModify?.map(
      (assocData) => assocData.formId + ""
    );
    let currentArr = formAssociationData?.map(
      (assocData) => assocData.formId + ""
    );
    if (prevArr.length === currentArr.length) {
      let flag = true;
      for (let x in prevArr) {
        if (prevArr[x] !== currentArr[x]) {
          flag = false;
          break;
        }
      }
      if (!flag) setviewChangeConfirmationBooleanMultiple(true);
      else props.setformAssociationType((prev) => viewMap[prev]);
    } else setviewChangeConfirmationBooleanMultiple(true);
  };

  const MultipleFormsView = (
    <div
      style={{
        display: showViewFormMF ? "flex" : "",
        flexDirection: showViewFormMF ? "row" : "",
        width: "100%",
        height: "100%",
      }}
    >
      {openDeleteFormPopover && (
        <Modal
          show={openDeleteFormPopover}
          style={{
            height: isFormAssociated ? "none:" : "30%", //Modified on 28/10/2023, bug_id:140234
            // height:  "30%",
            position: "fixed",
            display: "flex",
            flexDirection: "column",
            background: "white",
            top: "50%",
            left: "50%",
            width: "450px",
            padding: "0",
            zIndex: "1500",
            transform: "translate(-50%,-50%)",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          // backDropStyle={{ backgroundColor: "transparent" }}

          modalClosed={() => setopenDeleteFormPopover(false)}
          //children={<>{DeleteFormPopover}</>}
          //Modified on 28/10/2023, bug_id:140234
          children={
            isFormAssociated ? (
              <ObjectDependencies
                {...props}
                processAssociation={processAssociation}
                cancelFunc={() => setopenDeleteFormPopover(false)}
              />
            ) : (
              <>{DeleteFormPopover}</>
            )
          }
          //till here for bug_id:140234
        />
      )}
      {viewChangeConfirmationBooleanMultiple ? (
        <Modal
          show={viewChangeConfirmationBooleanMultiple}
          // backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            top: "50%",
            left: "50%",
            width: "450px",
            padding: "0",
            zIndex: "1500",
            transform: "translate(-50%,-50%)",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          // modalClosed={() => setviewChangeConfirmationBooleanMultiple(false)}
          children={
            <ViewChangeModal
              setformAssociationType={setformAssociationType}
              setviewChangeConfirmationBoolean={
                setviewChangeConfirmationBooleanMultiple
              }
              formAssociationData={formAssociationData}
              setformAssociationData={setformAssociationData}
            />
          }
        />
      ) : null}
      <Popover
        open={openMultiple}
        anchorEl={anchorElMFMultiple}
        onClose={handleCloseMultiple}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div
          style={{
            width: "10rem",
            height: "5rem",
            display: "flex",
            flexDirection: "column",
            padding: "0.5rem",
            fontSize: "var(--base_text_font_size)",
            border: "1px solid #70707075",
            cursor: "pointer",
          }}
        >
          <div
            style={{ marginBlock: "4px" }}
            /* onClick={() => {
              // code edited on 10 March 2023 for BugId 124827
              setopenMultiple(false);
              // code edited on 10 March 2023 for BugId 124826
              setmfFormId(selectedPopoverFormMultiple?.formId);
              setopenCustomiseForm(true);
            }}*/
            onClick={() =>
              handleCustomizeFormInNewTab(selectedPopoverFormMultiple?.formId)
            }
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key == "Enter") {
                handleCustomizeFormInNewTab(
                  selectedPopoverFormMultiple?.formId
                );
              }
            }}
          >
            <img src={editIcon} alt={t("edit")} />
            <span style={{ marginInline: "10px" }}>{t("edit")}</span>
          </div>
          <div
            onClick={() => handleDeleteForm(selectedPopoverFormMultiple)}
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key == "Enter") {
                handleDeleteForm(selectedPopoverFormMultiple);
              }
            }}
          >
            <img src={deleteIcon} alt={t("delete")} />
            <span style={{ color: "red", marginInline: "10px" }}>
              {t("delete")}
            </span>
          </div>
        </div>
      </Popover>
      {openCreateFormPopover && <NewFormPopover />}
      <div
        style={{
          display: "flex",
          width: !showViewFormMF ? "100%" : "50%",

          height: "100%",
          flexDirection: "column",
        }}
      >
        {props.showswappingHeader ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              width: "100%",
              height: "10%",
            }}
          >
            <p
              style={{
                fontSize: "var(--subtitle_text_font_size)",
                fontWeight: "600",
                color: "#0172C6",
                cursor: "pointer",
              }}
              onClick={() => viewChangeHandlerMultiple()}
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  viewChangeHandlerMultiple();
                }
              }}
            >
              {t("singleFormCompleteProcess")}
            </p>
          </div>
        ) : null}
        <div className={styles.multipleFormDiv}>
          {/* Changes added on 30-10-2023 to esolve the bug Id 140215  */}

          <div style={{ width: "fit-content" }}>
            <div className={styles.multipleTableDiv}>
              {[...extraHeaders, ...allFormsList].map((form) => (
                <div
                  className={styles.multipleTableContainer}
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                  onMouseEnter={() => sethoverForm(form)}
                  onMouseLeave={() => sethoverForm(null)}
                  key={form.formName}
                >
                  {" "}
                  {form.formName !== "Workstep Name" ? (
                    <Checkbox
                      // code edited on 11 March 2023 for BugId 119752
                      checked={
                        !checkAllFormEnabled(false)
                          ? false
                          : checkAllFormEnabled(form.formId)
                      }
                      onChange={(e) => formCheckHandler(e, form.formId)}
                      className="formListCheckBox"
                      inputProps={{ id: form.formName }}
                    />
                  ) : null}
                  <Tooltip title={form.formName} placement="bottom-start">
                    {form.formName !== "Workstep Name" ? (
                      <label
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          fontWeight: "bold",
                          marginBottom: "0",
                          // marginInline: "10px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "auto",
                          cursor: "pointer",
                          textAlign: "start",
                        }}
                        htmlFor={form.formName}
                      >
                        {form.formName == "Workstep Name" ||
                        form.formName == "Form Enabled"
                          ? t(form.formName)
                          : form.formName}
                      </label>
                    ) : (
                      <p
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          fontWeight: "bold",
                          marginBottom: "0",
                          // marginInline: "10px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "auto",
                          cursor: "pointer",
                        }}
                      >
                        {form.formName == "Workstep Name" ||
                        form.formName == "Form Enabled"
                          ? t(form.formName)
                          : form.formName}
                      </p>
                    )}
                  </Tooltip>
                  {/* {form.formId === hoverForm?.formId &&
                  form.formName !== "Workstep Name" &&
                  form.formName !== "Form Enabled" &&
                  form.formId !== -1 ? (
                    <VisibilityOutlined
                      onClick={() => handleViewForm(form)}
                      fontSize="medium"
                      style={{ color: "black", opacity: "0.3" }}
                    />
                  ) : null} */}
                  {form.formName !== "Workstep Name" &&
                  form.formName !== "Form Enabled" &&
                  form.formName !== "HTML" ? (
                    <IconButton
                      onClick={(e) => handleTypeChangeMFMultiple(e, form)}
                      tabindex={0}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          handleTypeChangeMFMultiple(e, form);
                        }
                      }}
                      aria-label={`FormOptions form ${form.formName}`}
                    >
                      <MoreVertIcon className={styles.moreVertIcon} />
                    </IconButton>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          {/* Chaages on 26-09-2023 to esolve the bug Id 132780  */}
          <div style={{ width: "fit-content", height: "90%" }}>
            {allActivities.map((act) => (
              <div
                className={`${styles.multipleTableDiv} activityTable`}
                // onMouseEnter={() => sethoverForm(null)}
                key={act.ActivityName}
              >
                <div
                  className={`${styles.multipleTableContainer} inputAlign`}
                  // style={{ textAlign: "left" }}
                >
                  <Checkbox
                    checked={checkFormEnabled(act.ActivityId)}
                    onChange={(e) => formEnabledHandler(e, act)}
                    aria-label={`Form enabled for ${act.ActivityName}`}
                    inputProps={{ id: act.ActivityName }}
                  />
                </div>

                <div
                  className={`${styles.multipleTableContainer} activityListContainer`}
                  // style={{ textAlign: "left" }}
                >
                  <Tooltip title={act.ActivityName} placement="bottom-start">
                    <label
                      htmlFor={act.ActivityName}
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        fontWeight: "bold",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        // width: "100%",
                        cursor: "pointer",
                      }}
                      className="activityList"
                    >
                      {act.ActivityName}
                    </label>
                  </Tooltip>
                </div>
                {/* <div
                    className={styles.multipleTableContainer}
                    style={{ textAlign: "left" }}
                  > */}
                {allFormsList.map((form) => (
                  <div
                    className={`${styles.multipleTableContainer} radioAlign radioBtnContainer`}
                    key={form.formId + ""}
                  >
                    <label
                      htmlFor={form.formName + act.ActivityName}
                      className="pmweb_sr_only"
                    >{`Selected ${form.formName} for ${act.ActivityName}`}</label>
                    <p className="radioBtn">
                      <Radio
                        value={form.formId + ""}
                        // code edited on 11 March 2023 for BugId 119752
                        checked={
                          !checkFormEnabled(act.ActivityId)
                            ? false
                            : getCheckBoolFormAssoc(form.formId, act.ActivityId)
                        }
                        disabled={!checkFormEnabled(act.ActivityId)}
                        onChange={(e) =>
                          handleFormAssocChange(
                            e,
                            act.ActivityId,
                            act.ActivityName,
                            form.formName
                          )
                        }
                        size="medium"
                        inputProps={{ id: form.formName + act.ActivityName }}
                      />
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {props.showOtherOptions ? (
          <div
            style={{
              width: "100%",
              height: "20%",
              border: "1px dashed #606060",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingInline: "5%",
            }}
            id="drop_zone"
            onDrop={(e) => dropHandler(e)}
            onDragOver={(e) => dragOverHandler(e)}
          >
            <p
              style={{
                fontSize: "var(--title_text_font_size)",
                color: "#606060",
                fontWeight: "600",
              }}
            >
              {t("dropFormsHere")}
            </p>
            <p
              style={{
                fontSize: " var(--title_text_font_size)",
                color: "#606060",
                fontWeight: "600",
              }}
            >
              {t("or")}
            </p>
            <div
              style={{
                display: "flex",

                flexDirection: !showViewFormMF ? "row" : "column",
                alignItems: "center",
                justifyContent: "space-between",
                width: "24rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "11rem",
                  whiteSpace: "nowrap",
                  height: "2.3rem",
                  fontSize: "var(--base_text_font_size)",
                  border: "1px solid var(--button_color)",
                  color: "var(--button_color)",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => handleFile(e)}
                  accept="application/x-zip-compressed"
                />
                {t("Import From Pc")}
              </label>

              <Button
                // style={{ marginInline: "0.8rem" }}
                className={styles.button}
                variant="outlined"
                onClick={handleNewFormCreate}
              >
                {t("createNewForm")}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      {showViewFormMF ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            height: "100%",
            fontSize: "var(--title_text_font_size)",
            background: "#0172C61A",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              height: "15%",
              justifyContent: "space-between",
              paddingInline: "2%",
            }}
          >
            <p style={{ fontWeight: "600" }}>
              {getFormDetailsById(mfFormId).formName}
            </p>
            <div>
              {" "}
              <button
                style={{
                  width: "150px",
                  height: "1.75rem",
                  marginInline: "10px",
                  color: "var(--button_color)",
                  border: "1px solid var(--button_color)",
                  borderRadius: "0.125rem",
                }}
                // onClick={() => window.loa(true)}
              >
                {t("customiseThisForm")}
              </button>
              <CloseIcon onClick={() => setshowViewFormMF(false)} />
            </div>
          </div>
          <div
            id="mf_forms_show"
            style={{
              width: "96%",
              height: "85%",
              overflow: "hidden",
              display: showViewFormMF ? "" : "none",
            }}
          ></div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "flex-start",
        flexDirection: "column",
        padding: "0.8rem",
      }}
    >
      {formAssociationType === "single" ? (
        <>{SingleFormView}</>
      ) : (
        <>{MultipleFormsView}</>
      )}
    </div>
  );
}

export default FormsListWithWorkstep;
