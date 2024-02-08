// Changes made to solve Bug 113434 - Requirement Section: spaces are not allowed while adding the description
// Changes made to solve Bug 110715 (Global Requirement section: Buttons not visible while Adding section)
// Changes made to solve Bug 113580 (if the requirements are on project level not on Global level then the message should be different)
//  Changes made to solve Bug 110720, Global Requirement section: section with lengthy data was not added
// Changes made to solve Bug 120008 - Deployed version: able to requirement and attachment in deployed section with out checkout
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly
//Changes made to solve Bug 121785,121786  -Setting Page: Global Section requirements-create new section issues and Global Section requirements-import new section issues
// Changes made to solve Bug Id - 121787  (Setting Page: Global Section requirements-Export section issues)
// Changes made to solve Bug Id - 124885  (regression>>Process Requirement>>count is not getting updated issues has been fixed)
//Changes made to solve Bug 123515 -Process Designer-icons related- UX and UI bugs
import {
  Button,
  IconButton,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import styles from "./GlobalRequirementSections.module.css";
import Accordion from "@material-ui/core/Accordion";
import { useDispatch, useSelector } from "react-redux";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import NotInterestedOutlinedIcon from "@material-ui/icons/NotInterestedOutlined";
import axios from "axios";
import { store, useGlobalState } from "state-pool";
import { connect } from "react-redux";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  SERVER_URL,
  ENDPOINT_FETCHSYSTEMREQUIREMENTS,
  ENDPOINT_FETCHPROCESSREQUIREMENTS,
  ENDPOINT_ADDSYSTEMREQUIREMENTS,
  ENDPOINT_ADDPROCESSREQUIREMENTS,
  ENDPOINT_DELETESYSTEMREQUIREMENTS,
  ENDPOINT_DELETEPROCESSREQUIREMENTS,
  ENDPOINT_EDITSYSTEMREQUIREMENTS,
  ENDPOINT_EDITPROCESSREQUIREMENTS,
  ADD,
  EDIT,
  DELETE,
  LEVEL1,
  LEVEL2,
  LEVEL3,
  ENDPOINT_MOVESYSTEMREQUIREMENTS,
  ENDPOINT_MOVEPROCESSREQUIREMENTS,
  RTL_DIRECTION,
  SPACE,
  APP_HEADER_HEIGHT,
} from "../../../../../Constants/appConstants";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import EditOutlinedIcon from "@material-ui/icons/Edit";

import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import ExportImport from "./ExportImport";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { FieldValidations } from "../../../../../utility/FieldValidations/fieldValidations";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../../utility/UTF8EncodeDecoder";
import CloseIcon from "@material-ui/icons/Close";
import { EditIcon } from "../../../../../utility/AllImages/AllImages";
import Field from "../../../../../UI/InputFields/TextField/Field";
import {
  PMWEB_ARB_REGEX,
  PMWEB_REGEX,
  validateRegex,
} from "../../../../../validators/validator";
//import FocusTrap from "focus-trap-react";
import { FocusTrap } from "@mui/base";
import { checkRegex } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";

const makeInputFields = (value) => {
  return { value, error: false, helperText: "" };
};

const useStyles = makeStyles({
  hideBorder: {
    "&.MuiAccordion-root:before": {
      display: "none",
    },
  },
  multilineInput: {
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    border: "1px solid #CECECE !important",
    "& focus": {
      border: "0px solid #CECECE !important",
    },
    "& .Mui-focused": {
      borderColor: "transparent",
      borderWidth: "0px !important",
    },
  },
  errorMultilineInput: {
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    border: "1px solid red !important",
    "& focus": {
      border: "0px solid #CECECE !important",
    },
    "& .Mui-focused": {
      borderColor: "transparent",
      borderWidth: "0px !important",
    },
  },
  iconButton: {
    height: "fit-content !important",
    padding: "0px !important",
    margin: "0px !important",
  },
});

function AddNewSectionBox(props) {
  let { t } = useTranslation();
  const classes = useStyles();
  const direction = `${t("HTML_DIR")}`;
  // commented on 03/11/23 for BugId 139840
  // const [previousOrderId, setpreviousOrderId] = useState(props.previousOrderId);
  const [newSection, setnewSection] = useState({});
  const [sectionName, setsectionName] = useState(makeInputFields(""));
  const [desc, setdesc] = useState(makeInputFields(""));
  const sectionNameRef = useRef();
  const sectionDescRef = useRef();

  const cancelButtonClick = () => {
    props.cancelCallBack();
  };

  const addHandler = () => {
    if (sectionName.value !== "" && !sectionName.error && !desc.error) {
      props.mapNewSection(newSection);
      // modified on 03/11/23 for BugId 139840
      // setpreviousOrderId((prevState) => prevState + 1);
      props.setpreviousOrderId((prevState) => prevState + 1);
      setdesc(makeInputFields(""));
      setsectionName(makeInputFields(""));
    }
  };

  const addcloseHandler = () => {
    if (sectionName.value !== "" && !sectionName.error && !desc.error) {
      props.mapNewSection(newSection);
      cancelButtonClick();
    }
  };

  /* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having the text 
  limitation and special characters validations */
  const handleChangeValues = (e) => {
    const { name, value } = e.target;
    let error = "";
    switch (name) {
      case "SectionName":
        if (!value) {
          error = t("sectionEmptyError");
        } else if (value.length > 100) {
          error = t("max100CharAllowed");
        }
        // modified on 25-09-2023 for bug_id: 136970
        // else if (!validateRegex(value, PMWEB_REGEX.SectionName)) {
        //   error = t("sectionNameValidation");
        // }
        else if (
          !checkRegex(
            value,
            PMWEB_REGEX.SectionName,
            PMWEB_ARB_REGEX.SectionName
          )
        ) {
          error = t("sectionNameValidation");
        }
        //till here for bug_id: 136970
        setsectionName({
          ...sectionName,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      case "Description":
        if (value.length > 150) {
          error = t("max150CharAllowed");
        } else if (!validateRegex(value, PMWEB_REGEX.SectionDesc)) {
          error = t("sectionDescValidation");
        }
        setdesc({
          ...desc,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    // modified on 03/11/23 for BugId 139840
    // let parent = previousOrderId + 1;
    let parent = props.previousOrderId + 1;
    setnewSection({
      OrderId: parent.toString(),
      SectionName: sectionName.value,
      Description: desc.value,
    });
  }, [desc.value, props.previousOrderId, sectionName.value]);

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        cancelButtonClick();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FocusTrap open>
        <div
          style={{
            backgroundColor: "white",
            minWidth: "35vw",
            height: "auto",
            direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingInlineStart: "1vw",
              alignItems: "center",
              borderBottom: "1px solid #d7d7d7",
            }}
          >
            <p
              style={{
                fontSize: "var(--title_text_font_size)",
                fontFamily: "var(--font_family)",
                fontWeight: "600",
              }}
            >
              {props.sectionNo === "" || props.sectionNo === undefined
                ? t("addNewSection")
                : `${t("addSectionWithin")} ${props.sectionNo}`}
            </p>
            <button
              style={{
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  cancelButtonClick();
                  //e.stopPropagation();
                }
              }}
              aria-label="Close"
              aria-description="Closes the window"
            >
              <span style={{ display: "none" }}>CloseIcon</span>
              <CloseIcon
                style={{
                  cursor: props.disabled ? "not-allowed" : "pointer",
                  height: "1.25rem",
                  width: "1.25rem",
                  color: "#707070",
                }}
                onClick={() => {
                  cancelButtonClick();
                }}
                id="pmweb_GlobalReq_add_sectionCloseIcon"
              />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "column",
              width: "100%",
              padding: "1rem 1vw",
            }}
          >
            {/* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having 
          the text limitation and special characters validations */}
            <div className="w100">
              <Field
                id="pmweb_GlobalReq_add_sectionName"
                htmlFor="pmweb_GlobalReq_add_sectionName"
                name="SectionName"
                required={true}
                label={`${t("section")} ${t("name")}`}
                value={sectionName.value}
                onChange={handleChangeValues}
                error={sectionName.error}
                helperText={sectionName.helperText}
                inputRef={sectionNameRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 163, sectionNameRef.current, 100)
                }
              />
            </div>
            <label
              className={styles.sectionLabelHeading}
              htmlFor="pmweb_GlobalReq_add_sectionDesc"
            >
              {t("Discription")}
            </label>
            {/* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having 
          the text limitation and special characters validations */}
            <TextField
              id="pmweb_GlobalReq_add_sectionDesc"
              type="text"
              // tabIndex={0}
              className={styles.sectionDescInput}
              name="Description"
              onChange={handleChangeValues}
              error={desc.error}
              helperText={desc.helperText}
              FormHelperTextProps={{
                style: {
                  marginLeft: 0,
                  marginTop: 0,
                  fontSize: "10px",
                  fontWeight: 600,
                  color: desc.error ? "red" : "#606060",
                },
              }}
              InputProps={{
                className: desc.error
                  ? classes.errorMultilineInput
                  : classes.multilineInput,
              }}
              multiline={true}
              rows={4}
              value={decode_utf8(desc.value)}
              inputRef={sectionDescRef}
              onKeyPress={(e) =>
                FieldValidations(e, 163, sectionDescRef.current, 150)
              }
            />
          </div>

          <div
            className="buttons_add"
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "flex-end",
              width: "100%",
              padding: "0.25rem 0.5vw",
              borderTop: "1px solid #d7d7d7",
              backgroundColor: "#f5f5f5",
            }}
          >
            <button
              id="pmweb_GlobalReq_add_sectionClose"
              className={styles.buttons}
              onClick={addcloseHandler}
              disabled={
                sectionName.value?.trim() === "" ||
                !sectionName.value ||
                sectionName.error ||
                desc.error
              }
            >
              {t("add&Close")}
            </button>
            <button
              id="pmweb_GlobalReq_add_sectionAnother"
              className={styles.buttons}
              onClick={addHandler}
              disabled={
                sectionName.value?.trim() === "" ||
                !sectionName.value ||
                sectionName.error ||
                desc.error
              }
            >
              {t("addAnother")}
            </button>
            <button
              id="pmweb_GlobalReq_add_cancel"
              className={styles.cancelButton}
              onClick={cancelButtonClick}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}

function EditSectionBox(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles();
  const [newSection, setnewSection] = useState({});
  const [sectionName, setsectionName] = useState(makeInputFields(""));
  const [desc, setdesc] = useState(makeInputFields(""));
  const sectionNameRef = useRef();
  const sectionDescRef = useRef();

  const cancelButtonClick = () => {
    props.cancelCallBack();
  };

  /* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having the text 
  limitation and special characters validations */
  const handleChangeValues = (e) => {
    const { name, value } = e.target;
    let error = "";
    switch (name) {
      case "SectionName":
        if (!value) {
          error = t("sectionEmptyError");
        } else if (value.length > 100) {
          error = t("max100CharAllowed");
        } else if (!validateRegex(value, PMWEB_REGEX.SectionName)) {
          error = t("sectionNameValidation");
        }
        setsectionName({
          ...sectionName,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      case "Description":
        if (value.length > 150) {
          error = t("max150CharAllowed");
        } else if (!validateRegex(value, PMWEB_REGEX.SectionDesc)) {
          error = t("sectionDescValidation");
        }
        setdesc({
          ...desc,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      default:
        return;
    }
  };

  const editSave = () => {
    console.log("###", "SECTION", sectionName, "DEC", desc);
    if (!sectionName.error && !desc.error) {
      props.editMapToData(newSection);
      cancelButtonClick();
    }
  };

  useEffect(() => {
    setnewSection({
      OrderId: props.sectionToEdit.OrderId,
      SectionName: sectionName.value || props.sectionToEdit.SectionName,
      Description:
        desc.value !== null ? desc.value : props.sectionToEdit.Description,
    });
  }, [
    desc.value,
    props.OrderId,
    props.sectionToEdit.Description,
    props.sectionToEdit.OrderId,
    props.sectionToEdit.SectionName,
    sectionName.value,
  ]);

  useEffect(() => {
    setsectionName({ ...sectionName, value: props.sectionToEdit.SectionName });
    setdesc({ ...desc, value: props.sectionToEdit.Description });
  }, [props.sectionToEdit.Description, props.sectionToEdit.SectionName]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FocusTrap>
        <div
          style={{
            backgroundColor: "white",
            width: "35vw",
            height: "auto",
            direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingInlineStart: "1vw",
              alignItems: "center",
              borderBottom: "1px solid #d7d7d7",
            }}
          >
            <p
              style={{
                fontSize: "var(--title_text_font_size)",
                fontFamily: "var(--font_family)",
                fontWeight: "600",
              }}
            >
              {t("edit")} {t("section")}
            </p>

            <button
              style={{
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  cancelButtonClick();
                  e.stopPropagation();
                }
              }}
            >
              <span style={{ display: "none" }}>Button</span>
              <CloseIcon
                style={{
                  cursor: props.disabled ? "not-allowed" : "pointer",
                  height: "1.25rem",
                  width: "1.25rem",
                  color: "#707070",
                }}
                onClick={() => {
                  cancelButtonClick();
                }}
                id="pmweb_GlobalReq_edit_SectionClose"
              />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "column",
              width: "100%",
              padding: "1rem 1vw",
            }}
          >
            {/* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having 
            the text limitation and special characters validations */}
            <div className="w100">
              <Field
                id="pmweb_GlobalReq_edit_sectionName"
                htmlFor="pmweb_GlobalReq_edit_sectionName"
                name="SectionName"
                required={true}
                label={`${t("section")} ${t("name")}`}
                value={sectionName.value}
                onChange={handleChangeValues}
                error={sectionName.error}
                helperText={sectionName.helperText}
                inputRef={sectionNameRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 163, sectionNameRef.current, 100)
                }
              />
            </div>
            <label
              className={styles.sectionLabelHeading}
              htmlFor="pmweb_GlobalReq_edit_sectionDesc"
            >
              {t("Discription")}
            </label>
            {/* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having 
            the text limitation and special characters validations */}
            <TextField
              id="pmweb_GlobalReq_edit_sectionDesc"
              type="text"
              //tabIndex={0}
              className={styles.sectionDescInput}
              name="Description"
              onChange={handleChangeValues}
              error={desc.error}
              helperText={desc.helperText}
              FormHelperTextProps={{
                style: {
                  marginLeft: 0,
                  marginTop: 0,
                  fontSize: "10px",
                  fontWeight: 600,
                  color: desc.error ? "red" : "#606060",
                },
              }}
              InputProps={{
                className: desc.error
                  ? classes.errorMultilineInput
                  : classes.multilineInput,
              }}
              multiline={true}
              rows={4}
              value={decode_utf8(desc.value)}
              inputRef={sectionDescRef}
              onKeyPress={(e) =>
                FieldValidations(e, 163, sectionDescRef.current, 150)
              }
            />
          </div>
          <div
            className="buttons_add"
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "flex-end",
              width: "100%",
              padding: "0.25rem 0.5vw",
              borderTop: "1px solid #d7d7d7",
              backgroundColor: "#f5f5f5",
            }}
          >
            {/* changes on 03-10-2023 to resolve the bug Id 137953 */}
            <button
              id="pmweb_GlobalReq_edit_save"
              className={styles.buttons}
              onClick={editSave}
              disabled={
                sectionName.value?.trim() === "" ||
                (sectionName.value === props.sectionToEdit.SectionName &&
                  desc.value === props.sectionToEdit.Description) ||
                // desc.value?.trim() === "" ||
                sectionName.error ||
                desc.error
              }
            >
              {t("save")}
            </button>
            <button
              id="pmweb_GlobalReq_edit_SectionClose"
              className={styles.cancelButton}
              onClick={cancelButtonClick}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}

function GlobalRequirementSections(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const classes = useStyles();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [reqData, setreqData] = useState([]);
  const [showEditBox, setshowEditBox] = useState(false);
  const [spinner, setspinner] = useState(true);
  const [firstLevelTextFieldShow, setfirstLevelTextFieldShow] = useState(false);
  const [sectionToEdit, setsectionToEdit] = useState({});
  const [showExportImportModal, setshowExportImportModal] = useState(false);
  const [exportOrImportToShow, setexportOrImportToShow] = useState("");
  const [levelToMap, setlevelToMap] = useState();
  const [levelToEdit, setlevelToEdit] = useState();
  const [previousOrderId, setpreviousOrderId] = useState(0);
  const [level1DataOrderId, setlevel1DataOrderId] = useState(0);
  const [level2DataOrderId, setlevel2DataOrderId] = useState(0);
  const { isReadOnly } = props;
  const smallScreen3 = useMediaQuery("(max-width: 999px");
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const cancelAddNewSection = () => {
    setshowEditBox(false);
    setfirstLevelTextFieldShow(false);
  };

  function sortByKey(array, key) {
    return array.sort(function (a, b) {
      var x = a[key];
      var y = b[key];
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  async function getSections() {
    // code edited on 13 April 2023 for BugId 126814
    const res = await axios.get(
      SERVER_URL +
        `${
          props.callLocation === "ProcessLevel"
            ? ENDPOINT_FETCHPROCESSREQUIREMENTS +
              `/${localLoadedProcessData?.ProcessDefId}/${localLoadedProcessData?.ProcessType}`
            : ENDPOINT_FETCHSYSTEMREQUIREMENTS
        }`
    );
    if (res?.status === 200) {
      const data = await res?.data?.Section;
      setspinner(false);
      data?.forEach((item) => {
        if (item.hasOwnProperty("SectionInner")) {
          item.SectionInner = sortByKey(item.SectionInner, "OrderId");
          if (item.SectionInner.hasOwnProperty("SectionInner2")) {
            item.SectionInner.SectionInner2 = sortByKey(
              item.SectionInner.SectionInner2,
              "OrderId"
            );
          }
        }
      });
      setreqData(sortByKey(data, "OrderId"));
    }
  }

  useEffect(() => {
    getSections();
  }, []);

  const closeExportImportModal = () => {
    setshowExportImportModal(false);
  };

  const addSection = (e, levelToAdd, level1Data, level2Data) => {
    e.stopPropagation();
    setfirstLevelTextFieldShow(true);
    setlevelToMap(levelToAdd);
    if (levelToAdd === LEVEL1) {
      setpreviousOrderId(reqData.length);
    } else if (levelToAdd === LEVEL2) {
      if (level1Data.hasOwnProperty("SectionInner"))
        setpreviousOrderId(level1Data.SectionInner.length);
      else setpreviousOrderId(0);

      setlevel1DataOrderId(level1Data.OrderId);
    } else {
      if (level2Data.hasOwnProperty("SectionInner2"))
        setpreviousOrderId(level2Data.SectionInner2.length);
      else setpreviousOrderId(0);

      setlevel1DataOrderId(level1Data.OrderId);
      setlevel2DataOrderId(level2Data.OrderId);
    }
  };

  const deleteClicked = async (
    e,
    levelToDelete,
    level1Data,
    level2Data,
    level3Data
  ) => {
    e.stopPropagation();
    let temp = JSON.parse(JSON.stringify(reqData));
    let toDeleteSection;
    if (levelToDelete === LEVEL2) {
      temp.forEach((item) => {
        if (item.OrderId === level1Data.OrderId) {
          toDeleteSection = item;
          temp.splice(temp.indexOf(item), 1);
        }
      });
    } else if (levelToDelete === LEVEL3) {
      temp[level1Data.OrderId - 1].SectionInner.forEach((item) => {
        if (item.OrderId === level2Data.OrderId) {
          toDeleteSection = item;
          temp[level1Data.OrderId - 1].SectionInner.splice(
            temp[level1Data.OrderId - 1].SectionInner.indexOf(item),
            1
          );
        }
      });
    } else {
      temp[level1Data.OrderId - 1].SectionInner[
        level2Data.OrderId - 1
      ].SectionInner2.forEach((item) => {
        if (item.OrderId === level3Data.OrderId) {
          toDeleteSection = item;
          temp[level1Data.OrderId - 1].SectionInner[
            level2Data.OrderId - 1
          ].SectionInner2.splice(
            temp[level1Data.OrderId - 1].SectionInner[
              level2Data.OrderId - 1
            ].SectionInner2.indexOf(item),
            1
          );
        }
      });
    }

    const flagForApi = await commonApiCalls(DELETE, toDeleteSection);
    if (flagForApi) setreqData(arrangeData(temp));
    else return;
  };

  const editClicked = (e, levelToEdit, level1Data, level2Data, level3Data) => {
    e.stopPropagation();
    setshowEditBox(true);
    setlevelToEdit(levelToEdit);

    if (levelToEdit === LEVEL2) {
      setpreviousOrderId(level1Data.OrderId);
      setsectionToEdit(level1Data);
    } else if (levelToEdit === LEVEL3) {
      setsectionToEdit(level2Data);
      setpreviousOrderId(level2Data.OrderId);

      setlevel1DataOrderId(level1Data.OrderId);
    } else {
      setsectionToEdit(level3Data);
      setpreviousOrderId(level3Data.OrderId);

      setlevel1DataOrderId(level1Data.OrderId);
      setlevel2DataOrderId(level2Data.OrderId);
    }
  };

  const editMapToData = async (data) => {
    let temp = JSON.parse(JSON.stringify(reqData));
    let toEditSection,
      isNameEdited = false;
    if (levelToEdit === LEVEL2) {
      temp.forEach((item) => {
        if (item.OrderId === previousOrderId) {
          toEditSection = item;
          item.OrderId = data.OrderId;

          if (item.SectionName !== data.SectionName) {
            isNameEdited = true;
          }
          item.SectionName = data.SectionName;
          item.Description = data.Description;
        }
      });
    } else if (levelToEdit === LEVEL3) {
      temp[level1DataOrderId - 1].SectionInner.forEach((item) => {
        if (item.OrderId === previousOrderId) {
          toEditSection = item;
          item.OrderId = data.OrderId;
          if (item.SectionName !== data.SectionName) {
            isNameEdited = true;
          }
          item.SectionName = data.SectionName;
          item.Description = data.Description;
        }
      });
    } else {
      temp[level1DataOrderId - 1].SectionInner[
        level2DataOrderId - 1
      ].SectionInner2.forEach((item) => {
        if (item.OrderId === previousOrderId) {
          toEditSection = item;
          item.OrderId = data.OrderId;
          if (item.SectionName !== data.SectionName) {
            isNameEdited = true;
          }
          item.SectionName = data.SectionName;
          item.Description = data.Description;
        }
      });
    }
    // const flagForApi = await commonApiCalls(EDIT, toEditSection);
    //Modified on 18/10/2023, bug_id:139841
    const flagForApi = await commonApiCalls(
      EDIT,
      toEditSection,
      null,
      isNameEdited
    );
    //till here for  bug_id:139841
    if (flagForApi) setreqData(temp);
    else return;
  };

  const mapNewSection = async (data) => {
    let temp = JSON.parse(JSON.stringify(reqData));
    if (levelToMap === LEVEL1) {
      const flagForApi = await commonApiCalls(ADD, data, "0");
      if (flagForApi) {
        temp.push({ ...data, SectionId: flagForApi?.SectionId });
        setreqData(temp);
      } else return;
    } else if (levelToMap === LEVEL2) {
      const flagForApi = await commonApiCalls(
        ADD,
        data,
        temp[level1DataOrderId - 1].SectionId
      );
      if (flagForApi) {
        let dataToPush = { ...data, SectionId: flagForApi?.SectionId };
        if (temp[level1DataOrderId - 1].hasOwnProperty("SectionInner")) {
          temp[level1DataOrderId - 1].SectionInner.push(dataToPush);
        } else temp[level1DataOrderId - 1].SectionInner = [dataToPush];

        setreqData(temp);
      } else return;
    } else {
      const flagForApi = await commonApiCalls(
        ADD,
        data,
        temp[level1DataOrderId - 1].SectionInner[level2DataOrderId - 1]
          .SectionId
      );
      if (flagForApi) {
        let dataToPush = { ...data, SectionId: flagForApi?.SectionId };
        if (
          temp[level1DataOrderId - 1].SectionInner[
            level2DataOrderId - 1
          ].hasOwnProperty("SectionInner2")
        )
          temp[level1DataOrderId - 1].SectionInner[
            level2DataOrderId - 1
          ].SectionInner2.push(dataToPush);
        else
          temp[level1DataOrderId - 1].SectionInner[
            level2DataOrderId - 1
          ].SectionInner2 = [dataToPush];

        setreqData(temp);
      } else return;
    }
  };

  const arrangeData = (data) => {
    data.forEach((item, index) => {
      item.OrderId = (++index).toString();
      if (item.hasOwnProperty("SectionInner")) {
        item.SectionInner.forEach((item2, index) => {
          item2.OrderId = (++index).toString();
          if (item2.hasOwnProperty("SectionInner2")) {
            item2.SectionInner2.forEach((item3, index) => {
              item3.OrderId = (++index).toString();
            });
          }
        });
      }
    });

    return data;
  };

  const dragEndHandler = async (result) => {
    if (!result.destination) {
      return;
    }

    let temp = JSON.parse(JSON.stringify(reqData));
    let reqDataCopy = JSON.parse(JSON.stringify(reqData));
    let payload;
    if (result.type === LEVEL1) {
      payload = {
        oldOrderId: temp[result.source.index].OrderId,
        sectionOrderId: temp[result.destination.index].OrderId,
        sectionId: temp[result.source.index]?.SectionId,
        parentId: "0",
      };
      const [removed] = temp.splice(result.source.index, 1);
      temp.splice(result.destination.index, 0, removed);
      temp.forEach((section, index) => {
        section.OrderId = ++index + "";
      });
    } else if (result.type === LEVEL2) {
      let nest = result.draggableId.split(" ");

      payload = {
        oldOrderId: temp[nest[0] - 1].SectionInner[result.source.index].OrderId,
        sectionOrderId:
          temp[nest[0] - 1].SectionInner[result.destination.index].OrderId,
        sectionId:
          temp[nest[0] - 1].SectionInner[result.source.index]?.SectionId,
        parentId: nest[2],
      };

      const [removed] = temp[nest[0] - 1].SectionInner.splice(
        result.source.index,
        1
      );
      temp[nest[0] - 1].SectionInner.splice(
        result.destination.index,
        0,
        removed
      );
      temp[nest[0] - 1].SectionInner.forEach((secInner, index) => {
        secInner.OrderId = ++index + "";
      });
    } else {
      let nest = result.draggableId.split(" ");

      payload = {
        oldOrderId:
          temp[nest[0] - 1].SectionInner[nest[1] - 1]?.SectionInner2[
            result.source.index
          ]?.OrderId,
        sectionOrderId:
          temp[nest[0] - 1].SectionInner[nest[1] - 1]?.SectionInner2[
            result.destination.index
          ]?.OrderId,
        sectionId:
          temp[nest[0] - 1].SectionInner[nest[1] - 1]?.SectionInner2[
            result.source.index
          ]?.SectionId,
        parentId: nest[3],
      };

      const [removed] = temp[nest[0] - 1].SectionInner[
        nest[1] - 1
      ].SectionInner2.splice(result.source.index, 1);
      temp[nest[0] - 1].SectionInner[nest[1] - 1].SectionInner2.splice(
        result.destination.index,
        0,
        removed
      );
      temp[nest[0] - 1].SectionInner[nest[1] - 1].SectionInner2.forEach(
        (secInner2, index) => {
          secInner2.OrderId = ++index + "";
        }
      );
    }

    setreqData(temp);

    const res = await axios.post(
      SERVER_URL +
        `${
          props.callLocation == "ProcessLevel"
            ? ENDPOINT_MOVEPROCESSREQUIREMENTS
            : ENDPOINT_MOVESYSTEMREQUIREMENTS
        }`,
      payload
    );

    if (!res.status === 200) {
      setreqData(reqDataCopy);
    } else {
      return;
    }
  };

  //Modified on 18/10/2023, bug_id:139841

  const commonApiCalls = async (method, data, parentId, isNameEdited) => {
    if (method === ADD || method === EDIT) {
      if (!data.SectionName || data.SectionName?.trim() === "") {
        dispatch(
          setToastDataFunc({
            message: t("SectionNameCanNotBeEmpty"),
            severity: "error",
            open: true,
          })
        );
      } else {
        let sameNameExists = false;
        reqData.forEach((el) => {
          /* if (el.SectionName === data.SectionName) {
            sameNameExists = true;
          } */
          if (method === ADD) {
            if (el.SectionName === data.SectionName) {
              sameNameExists = true;
            }
          } else if (method === EDIT) {
            if (isNameEdited && el.SectionName === data.SectionName) {
              sameNameExists = true;
            }
          }
        });

        const payload =
          props.callLocation === "ProcessLevel"
            ? {
                processDefId: props.openProcessID,
                projectId: localLoadedProcessData?.ProjectId,
                pMSectionInfo: {
                  sectionName: data.SectionName,
                  sectionDesc: encode_utf8(data.Description),
                  sectionOrderId: data.OrderId,
                  m_bExclude: false,
                  parentId: parentId,
                },
              }
            : {
                sectionName: data.SectionName,
                sectionDesc: encode_utf8(data.Description),
                sectionOrderId: data.OrderId,
                parentId: parentId,
              };

        if (!sameNameExists) {
          if (method === ADD) {
            const res = await axios.post(
              SERVER_URL +
                `${
                  props.callLocation === "ProcessLevel"
                    ? ENDPOINT_ADDPROCESSREQUIREMENTS
                    : ENDPOINT_ADDSYSTEMREQUIREMENTS
                }`,
              payload
            );
            const resData = await res.data;
            if (resData.Status === 0) {
              dispatch(
                setToastDataFunc({
                  message: t("SectionAddedSuccessfully"),
                  severity: "success",
                  open: true,
                })
              );
              return resData;
            } else return false;
          } else if (method === EDIT) {
            const payload =
              props.callLocation === "ProcessLevel"
                ? {
                    processDefId: props.openProcessID,
                    projectId: localLoadedProcessData?.ProjectId,
                    pMSectionInfo: {
                      sectionName: data.SectionName,
                      sectionDesc: encode_utf8(data.Description),
                      sectionOrderId: data.OrderId,
                      m_bExclude: false,
                      sectionId: data?.SectionId,
                    },
                  }
                : {
                    sectionName: data.SectionName,
                    sectionDesc: encode_utf8(data.Description),
                    sectionOrderId: data.OrderId,
                    sectionId: data?.SectionId,
                  };
            const res = await axios.post(
              SERVER_URL +
                `${
                  props.callLocation === "ProcessLevel"
                    ? ENDPOINT_EDITPROCESSREQUIREMENTS
                    : ENDPOINT_EDITSYSTEMREQUIREMENTS
                }`,
              payload
            );
            const resData = await res.data;
            if (resData.Status === 0) {
              dispatch(
                setToastDataFunc({
                  message: t("SectionModifiedSuccessfully"),
                  severity: "success",
                  open: true,
                })
              );
              return true;
            } else return false;
          }
        } else {
          dispatch(
            setToastDataFunc({
              message: t("SectionWithThisNameAlreadyExists"),
              severity: "error",
              open: true,
            })
          );
        }
      }
    } else if (method === DELETE) {
      const payload =
        props.callLocation === "ProcessLevel"
          ? {
              processDefId: props.openProcessID,
              projectId: localLoadedProcessData.ProjectId,
              pMSectionInfo: {
                sectionName: data.SectionName,
                sectionId: data?.SectionId,
              },
            }
          : {
              sectionName: data.SectionName,
              sectionId: data?.SectionId,
            };
      const res = await axios.post(
        SERVER_URL +
          `${
            props.callLocation === "ProcessLevel"
              ? ENDPOINT_DELETEPROCESSREQUIREMENTS
              : ENDPOINT_DELETESYSTEMREQUIREMENTS
          }`,
        payload
      );
      const resData = await res.data;
      if (resData.Status === 0) {
        dispatch(
          setToastDataFunc({
            message: t("SectionDeletedSuccessfully"),
            severity: "success",
            open: true,
          })
        );
        return true;
      } else return false;
    }
  };
  //till here for bug_id:139841

  // code edited on 30 March 2023 for BugId 126041
  /* const commonApiCalls = async (method, data, parentId) => {
    if (method === ADD || method === EDIT) {
      if (!data.SectionName || data.SectionName?.trim() === "") {
        dispatch(
          setToastDataFunc({
            message: t("SectionNameCanNotBeEmpty"),
            severity: "error",
            open: true,
          })
        );
      } else {
        let sameNameExists = false;
        reqData.forEach((el) => {
          if (el.SectionName === data.SectionName) {
            sameNameExists = true;
          }
        });

        const payload =
          props.callLocation === "ProcessLevel"
            ? {
                processDefId: props.openProcessID,
                projectId: localLoadedProcessData?.ProjectId,
                pMSectionInfo: {
                  sectionName: data.SectionName,
                  sectionDesc: encode_utf8(data.Description),
                  sectionOrderId: data.OrderId,
                  m_bExclude: false,
                  parentId: parentId,
                },
              }
            : {
                sectionName: data.SectionName,
                sectionDesc: encode_utf8(data.Description),
                sectionOrderId: data.OrderId,
                parentId: parentId,
              };

        if (!sameNameExists) {
          if (method === ADD) {
            const res = await axios.post(
              SERVER_URL +
                `${
                  props.callLocation === "ProcessLevel"
                    ? ENDPOINT_ADDPROCESSREQUIREMENTS
                    : ENDPOINT_ADDSYSTEMREQUIREMENTS
                }`,
              payload
            );
            const resData = await res.data;
            if (resData.Status === 0) {
              dispatch(
                setToastDataFunc({
                  message: t("SectionAddedSuccessfully"),
                  severity: "success",
                  open: true,
                })
              );
              return resData;
            } else return false;
          } else if (method === EDIT) {
            const payload =
              props.callLocation === "ProcessLevel"
                ? {
                    processDefId: props.openProcessID,
                    projectId: localLoadedProcessData?.ProjectId,
                    pMSectionInfo: {
                      sectionName: data.SectionName,
                      sectionDesc: encode_utf8(data.Description),
                      sectionOrderId: data.OrderId,
                      m_bExclude: false,
                      sectionId: data?.SectionId,
                    },
                  }
                : {
                    sectionName: data.SectionName,
                    sectionDesc: encode_utf8(data.Description),
                    sectionOrderId: data.OrderId,
                    sectionId: data?.SectionId,
                  };
            const res = await axios.post(
              SERVER_URL +
                `${
                  props.callLocation === "ProcessLevel"
                    ? ENDPOINT_EDITPROCESSREQUIREMENTS
                    : ENDPOINT_EDITSYSTEMREQUIREMENTS
                }`,
              payload
            );
            const resData = await res.data;
            if (resData.Status === 0) {
              dispatch(
                setToastDataFunc({
                  message: t("SectionModifiedSuccessfully"),
                  severity: "success",
                  open: true,
                })
              );
              return true;
            } else return false;
          }
        } else {
          dispatch(
            setToastDataFunc({
              message: t("SectionWithThisNameAlreadyExists"),
              severity: "error",
              open: true,
            })
          );
        }
      }
    } else if (method === DELETE) {
      const payload =
        props.callLocation === "ProcessLevel"
          ? {
              processDefId: props.openProcessID,
              projectId: localLoadedProcessData.ProjectId,
              pMSectionInfo: {
                sectionName: data.SectionName,
                sectionId: data?.SectionId,
              },
            }
          : {
              sectionName: data.SectionName,
              sectionId: data?.SectionId,
            };
      const res = await axios.post(
        SERVER_URL +
          `${
            props.callLocation === "ProcessLevel"
              ? ENDPOINT_DELETEPROCESSREQUIREMENTS
              : ENDPOINT_DELETESYSTEMREQUIREMENTS
          }`,
        payload
      );
      const resData = await res.data;
      if (resData.Status === 0) {
        dispatch(
          setToastDataFunc({
            message: t("SectionDeletedSuccessfully"),
            severity: "success",
            open: true,
          })
        );
        return true;
      } else return false;
    }
  }; */

  const updateSections = ({ sections }) => {
    sections?.forEach((item) => {
      if (item.hasOwnProperty("SectionInner")) {
        item.SectionInner = sortByKey(item.SectionInner, "OrderId");
        if (item.SectionInner.hasOwnProperty("SectionInner2")) {
          item.SectionInner.SectionInner2 = sortByKey(
            item.SectionInner.SectionInner2,
            "OrderId"
          );
        }
      }
    });
    setreqData(sortByKey(sections, "OrderId"));
  };

  return (
    <>
      <div
        className={styles.page}
        style={{
          height: props.callLocation === "ProcessLevel" ? "73vh" : "90vh",
        }}
      >
        <div className={styles.heading}>
          <div className={styles.headingBox}>
            <p className={styles.headingText}>
              {props.callLocation === "ProcessLevel"
                ? t("processPascalCase") + SPACE + t("requirementsSection")
                : t("globalRequirementSections")}
            </p>
            <p className={styles.headingInfo}>
              {props.callLocation === "ProcessLevel"
                ? t("requirementSectionSubHeading") + SPACE + t("subHeading1")
                : t("gloablRequirementSectionsHeadingInfo")}
            </p>
          </div>
          <div>
            {props.callLocation === "ProcessLevel" || isReadOnly ? null : (
              <Button
                variant="contained"
                size="medium"
                className={styles.addSectionButton}
                onClick={() => {
                  setshowExportImportModal(true);
                  setexportOrImportToShow("import");
                }}
                id="pmweb_GlobalReq_importBtn"
              >
                {/*Bug 123670 [21-02-2023] Changed the Button title as per the wireframe */}
                <p className={styles.buttonText}>{t("importSection")}</p>
              </Button>
            )}
            {reqData.length !== 0 &&
            props.callLocation !== "ProcessLevel" &&
            !isReadOnly ? (
              <Button
                variant="contained"
                size="medium"
                className={styles.addSectionButton}
                onClick={() => {
                  setshowExportImportModal(true);
                  setexportOrImportToShow("export");
                }}
                id="pmweb_GlobalReq_exportBtn"
              >
                {/*Bug 123670 [21-02-2023] Changed the Button title as per the wireframe */}
                <p className={styles.buttonText}>{t("exportSection")}</p>
              </Button>
            ) : null}
            {props.openProcessType === "R" || isReadOnly ? null : (
              <Button
                variant="contained"
                size="medium"
                className={styles.addSectionButton}
                styles={{ width: "7rem" }}
                onClick={(e) => addSection(e, LEVEL1)}
                // id="add_section"
                id="pmweb_GlobalReq_addSectionBtn"
              >
                <p className={styles.buttonText}>
                  {t("add")} {t("section")}
                </p>
              </Button>
            )}
          </div>
        </div>
        {spinner ? (
          <CircularProgress style={{ marginTop: "30vh", marginLeft: "40%" }} />
        ) : (
          <>
            {reqData.length !== 0 ? (
              <div
                className={styles.body}
                style={{
                  // changes added for bug_id: 134226
                  // height:
                  //   props.callLocation === "ProcessLevel" ? "62vh" : "76vh",
                  height:
                    props.callLocation === "ProcessLevel"
                      ? "62vh"
                      : smallScreen3
                      ? `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 14rem)`
                      : `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 10rem)`,
                  width: "89vw",
                }}
              >
                <DragDropContext onDragEnd={dragEndHandler}>
                  <Droppable droppableId="droppable" type={LEVEL1}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          zIndex: 0,
                        }}
                        tabIndex={-1}
                      >
                        {reqData &&
                          reqData.map((data, index) => {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "flex-start",
                                }}
                                className={styles.section}
                              >
                                <Draggable
                                  key={data.OrderId}
                                  draggableId={data.OrderId}
                                  index={index}
                                  demo={++index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={styles.accordContainer}
                                      tabIndex={-1}
                                    >
                                      <Accordion className={classes.hideBorder}>
                                        <AccordionSummary
                                          className={styles.accordianOuter}
                                          style={{
                                            flexDirection: "row-reverse",
                                            alignItems: "start",
                                          }}
                                          expandIcon={
                                            <ExpandMoreIcon
                                              id="pmweb_GlobalReq_expand_1"
                                              style={{ color: "#0072C6" }}
                                              className={styles.expand_1}
                                            />
                                          }
                                          aria-controls="pmweb_GlobalReq_panel1a-headerpanel1a-content"
                                          id="pmweb_GlobalReq_panel1a-header"
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                              // backgroundColor: "#ebeced",
                                              width: "100%",
                                            }}
                                          >
                                            <div
                                              className={`${styles.iconsandtextBox} ${styles.outerLayer}`}
                                              style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  display: "flex",
                                                  flexDirection: "row",
                                                }}
                                              >
                                                <p
                                                  // id="orderId_1"
                                                  id={`pmweb_GlobalReq_orderId_1_${index}`}
                                                  style={{
                                                    padding: "0px 0 0 2px",
                                                    color: "#0072C6",
                                                    fontSize:
                                                      "var(--subtitle_text_font_size)",
                                                    fontWeight: "600",
                                                    fontFamily: "Open Sans",
                                                    width: "1.7rem",
                                                    height: "1.3rem",

                                                    borderRight: "none",
                                                  }}
                                                >
                                                  {
                                                    //data.OrderId + "."
                                                    index + "."
                                                  }
                                                </p>
                                                <p
                                                  // id="sectionName_1"
                                                  id={`pmweb_GlobalReq_sectionName_1_${index}`}
                                                  spellCheck="false"
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                  onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                      e.stopPropagation();
                                                    }
                                                  }}
                                                  style={{
                                                    fontWeight: "600",
                                                    fontSize:
                                                      "var(--subtitle_text_font_size)",
                                                    fontFamily: "Open Sans",
                                                    color: "#0072C6",
                                                    marginLeft: "0px",
                                                    marginTop: "0px",
                                                    borderLeft: "none",
                                                    wordBreak: "break-word",
                                                  }}
                                                >
                                                  {data.SectionName}
                                                </p>
                                              </div>
                                              {!isReadOnly && (
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    justifyContent: "end",
                                                    minWidth: "15%",
                                                  }}
                                                >
                                                  <IconButton
                                                    id="pmweb_GlobalReq_addIcon_1"
                                                    onClick={(e) =>
                                                      addSection(
                                                        e,
                                                        LEVEL2,
                                                        data
                                                      )
                                                    }
                                                    tabIndex={0}
                                                    aria-label="Add"
                                                    aria-description="Add new section"
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        addSection(
                                                          e,
                                                          LEVEL2,
                                                          data
                                                        );
                                                        e.stopPropagation();
                                                      }
                                                    }}
                                                    className={
                                                      classes.iconButton
                                                    }
                                                    disableFocusRipple
                                                    disableTouchRipple
                                                  >
                                                    <Tooltip
                                                      title={t("add")}
                                                      arrow
                                                    >
                                                      <AddIcon
                                                        // id="addIcon_1"

                                                        style={{
                                                          color: "grey",
                                                          height: "1.9rem",
                                                          width: "1.9rem",
                                                          cursor: "pointer",
                                                        }}
                                                        className="icon"
                                                      />
                                                    </Tooltip>
                                                  </IconButton>
                                                  {/* <EditOutlinedIcon
                                                    id="editIcon_1"
                                                    style={{
                                                      color: "grey",
                                                      height: "1.7rem",
                                                      width: "1.7rem",
                                                      cursor: "pointer",
                                                    }}
                                                    onClick={(e) =>
                                                      editClicked(
                                                        e,
                                                        LEVEL2,
                                                        data
                                                      )
                                                    }
                                                  /> */}
                                                  <IconButton
                                                    id="pmweb_GlobalReq_editIcon_1"
                                                    onClick={(e) =>
                                                      editClicked(
                                                        e,
                                                        LEVEL2,
                                                        data
                                                      )
                                                    }
                                                    tabIndex={0}
                                                    title="Edit"
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        editClicked(
                                                          e,
                                                          LEVEL2,
                                                          data
                                                        );
                                                        e.stopPropagation();
                                                      }
                                                    }}
                                                    className={
                                                      classes.iconButton
                                                    }
                                                    disableFocusRipple
                                                    disableTouchRipple
                                                  >
                                                    <Tooltip
                                                      title={t("edit")}
                                                      arrow
                                                    >
                                                      <EditIcon
                                                        // id="editIcon_1"

                                                        className="icon"
                                                        style={{
                                                          color: "grey",
                                                          height: "1.7rem",
                                                          width: "1.7rem",
                                                          cursor: "pointer",
                                                          width: "80%",
                                                        }}
                                                      />
                                                    </Tooltip>
                                                  </IconButton>
                                                  <IconButton
                                                    id="pmweb_GlobalReq_deleteIcon_1"
                                                    onClick={(e) =>
                                                      deleteClicked(
                                                        e,
                                                        LEVEL2,
                                                        data
                                                      )
                                                    }
                                                    tabIndex={0}
                                                    aria-label="Delete"
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        deleteClicked(
                                                          e,
                                                          LEVEL2,
                                                          data
                                                        );
                                                        e.stopPropagation();
                                                      }
                                                    }}
                                                    className={
                                                      classes.iconButton
                                                    }
                                                    disableFocusRipple
                                                    disableTouchRipple
                                                  >
                                                    <Tooltip
                                                      title={t("delete")}
                                                      arrow
                                                    >
                                                      <DeleteOutlineIcon
                                                        style={{
                                                          color: "grey",
                                                          height: "1.7rem",
                                                          width: "1.7rem",
                                                          cursor: "pointer",
                                                        }}
                                                        className="icon"
                                                      />
                                                    </Tooltip>
                                                  </IconButton>
                                                </div>
                                              )}
                                            </div>
                                            <div style={{ background: "#fff" }}>
                                              <p
                                                id="pmweb_GlobalReq_description_1"
                                                className={
                                                  styles.settings_desc_list
                                                }
                                                style={{
                                                  wordBreak: "break-word",
                                                }}
                                              >
                                                {decode_utf8(data?.Description)}
                                              </p>
                                            </div>
                                          </div>
                                        </AccordionSummary>
                                        <Droppable
                                          droppableId={
                                            "droppable1 " +
                                            data.SectionId +
                                            " " +
                                            data.OrderId
                                          }
                                          type={LEVEL2}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              {...provided.droppableProps}
                                              ref={provided.innerRef}
                                              style={{
                                                zIndex: 1000,
                                              }}
                                            >
                                              {data.hasOwnProperty(
                                                "SectionInner"
                                              ) &&
                                                data.SectionInner.map(
                                                  (subsection, index) => (
                                                    <Draggable
                                                      key={subsection.OrderId}
                                                      draggableId={
                                                        data.OrderId +
                                                        " " +
                                                        subsection.OrderId +
                                                        " " +
                                                        data.SectionId
                                                      }
                                                      index={index}
                                                    >
                                                      {(provided, snapshot) => (
                                                        <div
                                                          ref={
                                                            provided.innerRef
                                                          }
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                          tabIndex={0}
                                                        >
                                                          <Accordion
                                                            className={
                                                              classes.hideBorder
                                                            }
                                                            defaultExpanded={
                                                              false
                                                            }
                                                            /* style={{
                                                              marginInlineStart:
                                                                "2.5rem",
                                                            }}*/
                                                          >
                                                            <AccordionSummary
                                                              className={
                                                                styles.accordianInner
                                                              }
                                                              style={{
                                                                flexDirection:
                                                                  "row-reverse",
                                                                alignItems:
                                                                  "start",
                                                              }}
                                                              expandIcon={
                                                                <ExpandMoreIcon
                                                                  id="pmweb_GlobalReq_expandIcon_2"
                                                                  style={{
                                                                    color:
                                                                      "black",
                                                                  }}
                                                                />
                                                              }
                                                              aria-controls="pmweb_GlobalReq_panel1a-headerpanel1a-content"
                                                              id="pmweb_GlobalReq_panel1a-header pmweb_GlobalReq_panel1a-headerSecond"
                                                            >
                                                              <div
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  flexDirection:
                                                                    "column",
                                                                  height:
                                                                    "auto",
                                                                  backgroundColor:
                                                                    "#ebeced",
                                                                  width: "100%",
                                                                }}
                                                              >
                                                                <div
                                                                  className={
                                                                    styles.iconsandtextBox
                                                                  }
                                                                >
                                                                  <div
                                                                    style={{
                                                                      display:
                                                                        "flex",
                                                                      flexDirection:
                                                                        "row",
                                                                    }}
                                                                  >
                                                                    <p
                                                                      id="pmweb_GlobalReq_orderId_2"
                                                                      style={{
                                                                        padding:
                                                                          "0px 0 0 2px",
                                                                        color:
                                                                          "black",
                                                                        fontSize:
                                                                          "var(--subtitle_text_font_size)",
                                                                        fontWeight:
                                                                          "600",
                                                                        fontFamily:
                                                                          "Open Sans",
                                                                        width:
                                                                          "1.7rem",
                                                                        height:
                                                                          "1.5rem",
                                                                        marginTop:
                                                                          "0px",
                                                                        borderRight:
                                                                          "none",
                                                                      }}
                                                                    >
                                                                      {data.OrderId +
                                                                        "." +
                                                                        subsection.OrderId +
                                                                        "."}
                                                                    </p>

                                                                    <p
                                                                      id="pmweb_GlobalReq_sectionName_2"
                                                                      style={{
                                                                        fontSize:
                                                                          "var(--subtitle_text_font_size)",
                                                                        fontWeight:
                                                                          "600",
                                                                        fontFamily:
                                                                          "Open Sans",
                                                                        margin:
                                                                          "0px 0 0 10px",

                                                                        borderLeft:
                                                                          "none",
                                                                        wordBreak:
                                                                          "break-word",
                                                                      }}
                                                                    >
                                                                      {
                                                                        subsection.SectionName
                                                                      }
                                                                    </p>
                                                                  </div>
                                                                  {!isReadOnly && (
                                                                    <div
                                                                      style={{
                                                                        display:
                                                                          "flex",
                                                                        justifyContent:
                                                                          "end",
                                                                        minWidth:
                                                                          "15%",
                                                                      }}
                                                                    >
                                                                      <IconButton
                                                                        id="pmweb_GlobalReq_addIcon_2"
                                                                        onClick={(
                                                                          e
                                                                        ) =>
                                                                          addSection(
                                                                            e,
                                                                            LEVEL3,
                                                                            data,
                                                                            subsection
                                                                          )
                                                                        }
                                                                        tabIndex={
                                                                          0
                                                                        }
                                                                        aria-label="Add"
                                                                        onKeyDown={(
                                                                          e
                                                                        ) => {
                                                                          if (
                                                                            e.key ===
                                                                            "Enter"
                                                                          ) {
                                                                            addSection(
                                                                              e,
                                                                              LEVEL3,
                                                                              data,
                                                                              subsection
                                                                            );
                                                                            e.stopPropagation();
                                                                          }
                                                                        }}
                                                                        className={
                                                                          classes.iconButton
                                                                        }
                                                                        disableTouchRipple
                                                                        disableFocusRipple
                                                                      >
                                                                        <Tooltip
                                                                          title={t(
                                                                            "add"
                                                                          )}
                                                                          arrow
                                                                        >
                                                                          <AddIcon
                                                                            className="icon"
                                                                            style={{
                                                                              color:
                                                                                "grey",
                                                                              height:
                                                                                "1.9rem",
                                                                              width:
                                                                                "1.9rem",
                                                                              cursor:
                                                                                "pointer",
                                                                            }}
                                                                          />
                                                                        </Tooltip>
                                                                      </IconButton>
                                                                      <IconButton
                                                                        id="pmweb_GlobalReq_editIcon_2"
                                                                        className={
                                                                          classes.iconButton
                                                                        }
                                                                        onClick={(
                                                                          e
                                                                        ) =>
                                                                          editClicked(
                                                                            e,
                                                                            LEVEL3,
                                                                            data,
                                                                            subsection
                                                                          )
                                                                        }
                                                                        tabIndex={
                                                                          0
                                                                        }
                                                                        title="Edit"
                                                                        onKeyDown={(
                                                                          e
                                                                        ) => {
                                                                          if (
                                                                            e.key ===
                                                                            "Enter"
                                                                          ) {
                                                                            editClicked(
                                                                              e,
                                                                              LEVEL3,
                                                                              data,
                                                                              subsection
                                                                            );
                                                                            e.stopPropagation();
                                                                          }
                                                                        }}
                                                                        disableFocusRipple
                                                                        disableTouchRipple
                                                                      >
                                                                        <Tooltip
                                                                          title={t(
                                                                            "edit"
                                                                          )}
                                                                          arrow
                                                                        >
                                                                          <EditOutlinedIcon
                                                                            className="icon"
                                                                            style={{
                                                                              color:
                                                                                "grey",
                                                                              height:
                                                                                "1.7rem",
                                                                              width:
                                                                                "1.7rem",
                                                                              cursor:
                                                                                "pointer",
                                                                            }}
                                                                          />
                                                                        </Tooltip>
                                                                      </IconButton>
                                                                      <IconButton
                                                                        id="pmweb_GlobalReq_deleteIcon_2"
                                                                        className={
                                                                          classes.iconButton
                                                                        }
                                                                        onClick={(
                                                                          e
                                                                        ) =>
                                                                          deleteClicked(
                                                                            e,
                                                                            LEVEL3,
                                                                            data,
                                                                            subsection
                                                                          )
                                                                        }
                                                                        tabIndex={
                                                                          0
                                                                        }
                                                                        aria-label="Delete"
                                                                        onKeyDown={(
                                                                          e
                                                                        ) => {
                                                                          if (
                                                                            e.key ===
                                                                            "Enter"
                                                                          ) {
                                                                            deleteClicked(
                                                                              e,
                                                                              LEVEL3,
                                                                              data,
                                                                              subsection
                                                                            );
                                                                            e.stopPropagation();
                                                                          }
                                                                        }}
                                                                      >
                                                                        <Tooltip
                                                                          title={t(
                                                                            "delete"
                                                                          )}
                                                                          arrow
                                                                        >
                                                                          <DeleteOutlineIcon
                                                                            className="icon"
                                                                            style={{
                                                                              color:
                                                                                "grey",
                                                                              height:
                                                                                "1.7rem",
                                                                              width:
                                                                                "1.7rem",
                                                                              cursor:
                                                                                "pointer",
                                                                            }}
                                                                          />
                                                                        </Tooltip>
                                                                      </IconButton>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                                <div>
                                                                  <p
                                                                    id="pmweb_GlobalReq_description_2"
                                                                    style={{
                                                                      font: "var(--base_text_font_size) Open Sans",
                                                                      margin:
                                                                        "-5px 0 0 2px",
                                                                      padding:
                                                                        "5px 10px",
                                                                      wordBreak:
                                                                        "break-word",
                                                                    }}
                                                                  >
                                                                    {decode_utf8(
                                                                      subsection.Description
                                                                    )}
                                                                  </p>
                                                                </div>
                                                              </div>
                                                            </AccordionSummary>

                                                            <Droppable
                                                              droppableId={
                                                                "droppable2 " +
                                                                subsection.SectionId +
                                                                " " +
                                                                subsection.OrderId
                                                              }
                                                              type={LEVEL3}
                                                            >
                                                              {(
                                                                provided,
                                                                snapshot
                                                              ) => (
                                                                <div
                                                                  {...provided.droppableProps}
                                                                  ref={
                                                                    provided.innerRef
                                                                  }
                                                                  style={{
                                                                    zIndex: 2000,
                                                                  }}
                                                                  tabIndex={0}
                                                                >
                                                                  {/* subsections2 */}
                                                                  {subsection.hasOwnProperty(
                                                                    "SectionInner2"
                                                                  ) &&
                                                                    subsection
                                                                      .SectionInner2
                                                                      .length !==
                                                                      0 &&
                                                                    subsection.SectionInner2.map(
                                                                      (
                                                                        subsections2,
                                                                        index
                                                                      ) => (
                                                                        <Draggable
                                                                          key={
                                                                            subsections2.OrderId
                                                                          }
                                                                          draggableId={
                                                                            data.OrderId +
                                                                            " " +
                                                                            subsection.OrderId +
                                                                            " " +
                                                                            subsections2.OrderId +
                                                                            " " +
                                                                            subsection.SectionId
                                                                          }
                                                                          index={
                                                                            index
                                                                          }
                                                                        >
                                                                          {(
                                                                            provided,
                                                                            snapshot
                                                                          ) => (
                                                                            <div
                                                                              ref={
                                                                                provided.innerRef
                                                                              }
                                                                              {...provided.draggableProps}
                                                                              {...provided.dragHandleProps}
                                                                            >
                                                                              <Accordion
                                                                                className={
                                                                                  classes.hideBorder
                                                                                }
                                                                                defaultExpanded={
                                                                                  false
                                                                                }
                                                                                /* style={{
                                                                                  marginLeft:
                                                                                    "55px",
                                                                                }}*/
                                                                              >
                                                                                <AccordionSummary
                                                                                  className={
                                                                                    styles.accordianInner2
                                                                                  }
                                                                                  style={{
                                                                                    flexDirection:
                                                                                      "row-reverse",
                                                                                    alignItems:
                                                                                      "start",
                                                                                    marginInlineStart:
                                                                                      "4rem",
                                                                                  }}
                                                                                  aria-controls="pmweb_GlobalReq_panel1a-headerpanel1a-content"
                                                                                  id="pmweb_GlobalReq_panel1a-header"
                                                                                >
                                                                                  <div
                                                                                    style={{
                                                                                      display:
                                                                                        "flex",
                                                                                      flexDirection:
                                                                                        "column",
                                                                                      backgroundColor:
                                                                                        "#ebeced",
                                                                                      width:
                                                                                        "100%",
                                                                                    }}
                                                                                  >
                                                                                    <div
                                                                                      className={
                                                                                        styles.iconsandtextBox
                                                                                      }
                                                                                      /* style={{
                                                                                        width:
                                                                                          "65vw",
                                                                                      }}*/
                                                                                    >
                                                                                      <div
                                                                                        style={{
                                                                                          display:
                                                                                            "flex",
                                                                                          flexDirection:
                                                                                            "row",
                                                                                        }}
                                                                                      >
                                                                                        <p
                                                                                          id="pmweb_GlobalReq_orderId_3"
                                                                                          style={{
                                                                                            padding:
                                                                                              "0px 0 0 2px",
                                                                                            color:
                                                                                              "black",
                                                                                            fontSize:
                                                                                              "var(--subtitle_text_font_size)",
                                                                                            fontWeight:
                                                                                              "600",
                                                                                            fontFamily:
                                                                                              "Open Sans",
                                                                                            width:
                                                                                              "2.5rem",
                                                                                            height:
                                                                                              "1.5rem",
                                                                                            marginTop:
                                                                                              "0px",
                                                                                            borderRight:
                                                                                              "none",
                                                                                          }}
                                                                                        >
                                                                                          {data.OrderId +
                                                                                            "." +
                                                                                            subsection.OrderId +
                                                                                            "." +
                                                                                            subsections2.OrderId +
                                                                                            "."}
                                                                                        </p>
                                                                                        <p
                                                                                          id="pmweb_GlobalReq_sectionName_3"
                                                                                          onClick={(
                                                                                            e
                                                                                          ) =>
                                                                                            e.stopPropagation()
                                                                                          }
                                                                                          onKeyDown={(
                                                                                            e
                                                                                          ) => {
                                                                                            if (
                                                                                              e.key ===
                                                                                              "Enter"
                                                                                            ) {
                                                                                              e.stopPropagation();
                                                                                            }
                                                                                          }}
                                                                                          style={{
                                                                                            fontSize:
                                                                                              "var(--subtitle_text_font_size)",
                                                                                            fontWeight:
                                                                                              "600",
                                                                                            fontFamily:
                                                                                              "Open Sans",

                                                                                            marginLeft:
                                                                                              "10px",
                                                                                            borderLeft:
                                                                                              "none",
                                                                                            wordBreak:
                                                                                              "break-word",
                                                                                          }}
                                                                                        >
                                                                                          {
                                                                                            subsections2.SectionName
                                                                                          }
                                                                                        </p>
                                                                                      </div>
                                                                                      {!isReadOnly && (
                                                                                        <div
                                                                                          style={{
                                                                                            /* marginLeft:
                                                                                              "-10px",*/
                                                                                            display:
                                                                                              "flex",
                                                                                            justifyContent:
                                                                                              "end",
                                                                                            minWidth:
                                                                                              "15%",
                                                                                          }}
                                                                                        >
                                                                                          <IconButton
                                                                                            id="pmweb_GlobalReq_editIcon_3"
                                                                                            className={
                                                                                              classes.iconButton
                                                                                            }
                                                                                            onClick={(
                                                                                              e
                                                                                            ) =>
                                                                                              editClicked(
                                                                                                e,
                                                                                                "3rd",
                                                                                                data,
                                                                                                subsection,
                                                                                                subsections2
                                                                                              )
                                                                                            }
                                                                                            tabIndex={
                                                                                              0
                                                                                            }
                                                                                            aria-label="Edit"
                                                                                            onKeyDown={(
                                                                                              e
                                                                                            ) => {
                                                                                              if (
                                                                                                e.key ===
                                                                                                "Enter"
                                                                                              ) {
                                                                                                editClicked(
                                                                                                  e,
                                                                                                  "3rd",
                                                                                                  data,
                                                                                                  subsection,
                                                                                                  subsections2
                                                                                                );
                                                                                                e.stopPropagation();
                                                                                              }
                                                                                            }}
                                                                                            disableFocusRipple
                                                                                            disableTouchRipple
                                                                                          >
                                                                                            <Tooltip
                                                                                              title={t(
                                                                                                "edit"
                                                                                              )}
                                                                                              arrow
                                                                                            >
                                                                                              <EditOutlinedIcon
                                                                                                className="icon"
                                                                                                style={{
                                                                                                  color:
                                                                                                    "grey",
                                                                                                  height:
                                                                                                    "1.7rem",
                                                                                                  width:
                                                                                                    "1.7rem",
                                                                                                  cursor:
                                                                                                    "pointer",
                                                                                                }}
                                                                                              />
                                                                                            </Tooltip>
                                                                                          </IconButton>
                                                                                          <IconButton
                                                                                            id="pmweb_GlobalReq_deleteIcon_3"
                                                                                            onClick={(
                                                                                              e
                                                                                            ) =>
                                                                                              deleteClicked(
                                                                                                e,
                                                                                                "3rd",
                                                                                                data,
                                                                                                subsection,
                                                                                                subsections2
                                                                                              )
                                                                                            }
                                                                                            tabIndex={
                                                                                              0
                                                                                            }
                                                                                            aria-label="Delete"
                                                                                            onKeyDown={(
                                                                                              e
                                                                                            ) => {
                                                                                              if (
                                                                                                e.key ===
                                                                                                "Enter"
                                                                                              ) {
                                                                                                deleteClicked(
                                                                                                  e,
                                                                                                  "3rd",
                                                                                                  data,
                                                                                                  subsection,
                                                                                                  subsections2
                                                                                                );
                                                                                                e.stopPropagation();
                                                                                              }
                                                                                            }}
                                                                                            className={
                                                                                              classes.iconButton
                                                                                            }
                                                                                            disableFocusRipple
                                                                                            disableTouchRipple
                                                                                          >
                                                                                            <Tooltip
                                                                                              title={t(
                                                                                                "delete"
                                                                                              )}
                                                                                              arrow
                                                                                            >
                                                                                              <DeleteOutlineIcon
                                                                                                className="icon"
                                                                                                style={{
                                                                                                  color:
                                                                                                    "grey",
                                                                                                  height:
                                                                                                    "1.7rem",
                                                                                                  width:
                                                                                                    "1.7rem",
                                                                                                  cursor:
                                                                                                    "pointer",
                                                                                                }}
                                                                                              />
                                                                                            </Tooltip>
                                                                                          </IconButton>
                                                                                        </div>
                                                                                      )}
                                                                                    </div>
                                                                                    <div>
                                                                                      <p
                                                                                        style={{
                                                                                          font: "var(--base_text_font_size) Open Sans",
                                                                                          margin:
                                                                                            "-5px 0 0 2px",
                                                                                          padding:
                                                                                            "5px 10px",
                                                                                          wordBreak:
                                                                                            "break-word",
                                                                                        }}
                                                                                      >
                                                                                        {decode_utf8(
                                                                                          subsections2.Description
                                                                                        )}
                                                                                      </p>
                                                                                    </div>
                                                                                  </div>
                                                                                </AccordionSummary>
                                                                              </Accordion>
                                                                            </div>
                                                                          )}
                                                                        </Draggable>
                                                                      )
                                                                    )}
                                                                  {
                                                                    provided.placeholder
                                                                  }
                                                                </div>
                                                              )}
                                                            </Droppable>
                                                          </Accordion>
                                                        </div>
                                                      )}
                                                    </Draggable>
                                                  )
                                                )}
                                              {provided.placeholder}
                                            </div>
                                          )}
                                        </Droppable>
                                      </Accordion>
                                    </div>
                                  )}
                                </Draggable>
                              </div>
                            );
                          })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {firstLevelTextFieldShow === true ? (
                  <Modal open={firstLevelTextFieldShow}>
                    <AddNewSectionBox
                      mapNewSection={(data) => mapNewSection(data)}
                      levelToMap={levelToMap}
                      cancelCallBack={cancelAddNewSection}
                      previousOrderId={previousOrderId}
                      // added on 03/11/23 for BugId 139840
                      setpreviousOrderId={setpreviousOrderId}
                    />
                  </Modal>
                ) : null}
                {showEditBox === true ? (
                  <Modal open={showEditBox}>
                    <EditSectionBox
                      editMapToData={(data) => editMapToData(data)}
                      sectionToEdit={sectionToEdit}
                      cancelCallBack={cancelAddNewSection}
                    />
                  </Modal>
                ) : null}
                {showExportImportModal === true ? (
                  <Modal open={showExportImportModal}>
                    <ExportImport
                      exportOrImportToShow={exportOrImportToShow}
                      closeExportImportModal={closeExportImportModal}
                      sections={reqData}
                      updateSections={updateSections}
                    />
                  </Modal>
                ) : null}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  /*Bug 117797 [09-02-2023] Changed the width from 80% to 100% */
                  width: "100%",
                  height: "80%",
                }}
              >
                <NotInterestedOutlinedIcon />
                <p className={styles.headingInfo}>
                  {t("noRequirementDefined")}, {t("pleaseUseAddSection")}
                </p>
                {firstLevelTextFieldShow === true ? (
                  <Modal open={firstLevelTextFieldShow}>
                    <AddNewSectionBox
                      mapNewSection={(data) => mapNewSection(data)}
                      cancelCallBack={cancelAddNewSection}
                      levelToMap={levelToMap}
                      // modified on 03/11/23 for BugId 139840
                      // previousOrderId={0}
                      previousOrderId={previousOrderId}
                      // added on 03/11/23 for BugId 139840
                      setpreviousOrderId={setpreviousOrderId}
                    />
                  </Modal>
                ) : null}
                {showExportImportModal === true ? (
                  <Modal open={showExportImportModal}>
                    <ExportImport
                      exportOrImportToShow={exportOrImportToShow}
                      closeExportImportModal={closeExportImportModal}
                      sections={reqData}
                      updateSections={updateSections}
                    />
                  </Modal>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    templateId: state.openTemplateReducer.templateId,
    templateName: state.openTemplateReducer.templateName,
    openTemplateFlag: state.openTemplateReducer.openFlag,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
  };
};

export default connect(mapStateToProps)(GlobalRequirementSections);
