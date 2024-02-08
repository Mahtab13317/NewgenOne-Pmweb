// Changes made to solve Bug with ID = 114685 => Project Description is not getting saved
// #BugID - 121796
// #BugDescription - Handled the function to open and close modal of project creation while import the process.
import React, { useRef, useState } from "react";
import "./ProjectCreation.css";
import { useTranslation } from "react-i18next";
import StarRateIcon from "@material-ui/icons/StarRate";
import {
  SERVER_URL,
  ENDPOINT_ADD_PROJECT,
  SPACE,
  RTL_DIRECTION,
  ENGLISH_LOCALE,
} from "../../../../Constants/appConstants";
import axios from "axios";
import SunTextEditor from "../../../../UI/SunEditor/SunTextEditor";
import c_Names from "classnames";
import "./ProjectCreationArabic.css";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";
import { setProjectCreation } from "../../../../redux-store/slices/projectCreationSlice";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import { useMediaQuery } from "@material-ui/core";
import secureLocalStorage from "react-secure-storage";
import { isArabicLocaleSelected } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function ProjectCreation(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const { setShowModal } = props;
  const direction = `${t("HTML_DIR")}`;
  const [projectInput, setprojectInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [showDesc, setshowDesc] = useState(false);
  const projectRef = useRef();
  const [errorMsg, setErrorMsg] = useState("");
  // const locale = secureLocalStorage.getItem("locale");
  console.log("Kratika", locale);
  const smallScreen = useMediaQuery("(max-width: 699px)");
  const locale =
    secureLocalStorage.getItem("locale") ||
    navigator.language ||
    navigator.userLanguage;

  // Function that is used to close the modal.
  const cancelHandler = () => {
    setShowModal(null);
    if (props.setselectedProject) {
      props.setselectedProject(props?.selectedProject);
    }
  };

  // Function that gets called when the user clicks on create project button.
  const createHandler = () => {
    if (projectInput?.trim()?.length > 60) {
      dispatch(
        setToastDataFunc({
          message: t("projectNameLengthValidation"),
          severity: "error",
          open: true,
        })
      );
    } else if (!errorMsg) {
      axios
        .post(SERVER_URL + ENDPOINT_ADD_PROJECT, {
          projectname: projectInput.trim(),
          description: encode_utf8(descriptionInput),
        })
        .then((response) => {
          //code edited on 28 July 2022 for BugId 111769
          if (response?.data?.Status === 0) {
            dispatch(
              setToastDataFunc({
                //modified on 22-09-2023 for bug_id: 136406
                // message: response?.data?.Message,
                message: t("projects.projectCreated"),
                //till here
                severity: "success",
                open: true,
              })
            );
            dispatch(
              setProjectCreation({
                projectCreated: true,
                projectName: projectInput,
                projectDesc: descriptionInput,
              })
            );
            cancelHandler();
          } else if (response?.data?.Status === -2) {
            // code edited on 28 July 2022 for BugId 112445
            dispatch(
              setToastDataFunc({
                message: response?.data?.Message,
                severity: "error",
                open: true,
              })
            );
          }
        });
    }
  };

  // Function that shows the sun editor to add description.
  const addDescription = () => {
    setshowDesc(!showDesc);
  };

  // Function that handles description changes.
  const descriptionInputHandler = (e) => {
    setDescriptionInput(e.target.innerHTML);
  };

  //Added on 28/09/2023, bug_id:135623
  const handleChange = (data) => {
    setDescriptionInput(data);
  };
  //till here for bug id:135623

  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      var regex = new RegExp("[&*|:'\"<>?////]+");
      console.log("Arabic", locale);
      return !regex.test(str);
    } else {
      var regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
    }
    return regex.test(str);
  };

  // Changes made to solve Bug 130976
  const validateData = (e, val) => {
    if (e.target.value.length > 60) {
      setErrorMsg(`${val}${SPACE}${t("lengthShouldNotExceed60Characters")}`);
    } else if (!containsSpecialChars(e.target.value)) {
      if (isArabicLocaleSelected()) {
        setErrorMsg(
          `${val}${SPACE}${t("cannotContain")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "charactersInIt"
          )}`
        );
      } else {
        setErrorMsg(
          `${t("AllCharactersAreAllowedExcept")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "AndFirstCharacterShouldBeAlphabet"
          )}
        `
        );
      }
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };
  //  till here

  // const handleProjectCreation = (e) => {
  //   if (e.keyCode === 13 && !showDesc) { //Added on 4/9/2023 for BUG_ID: 135181
  //     createHandler();
  //     e.stopPropagation();
  //   }
  // };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleProjectCreation);
  //   return () => document.removeEventListener("keydown", handleProjectCreation);
  // }, [handleProjectCreation]);

  return (
    <div
      style={{
        direction: direction,
        width: "100%",
        height: smallScreen
          ? showDesc
            ? "100vh"
            : props.modalHeight
            ? props.modalHeight
            : "51vh"
          : showDesc
          ? "80vh"
          : props.modalHeight
          ? props.modalHeight
          : "28vh",
        padding: "0",
        background: "white",
      }}
    >
      <h2
        className={c_Names({
          projectCreationTittle: direction !== "rtl",
          projectCreationTittleArabic: direction == "rtl",
        })}
        style={{ margin: "1rem 1vw" }}
      >
        {t("projectCreation")}
      </h2>
      <p className="hrLineProjectCreation"></p>
      {/* Resolved Bug ID 121797 */}
      <div
        style={{ display: "flex", flexDirection: "column", marginLeft: "5%" }}
      >
        <label
          className={c_Names({
            Label: direction !== "rtl",
            LabelArabic: direction == "rtl",
          })}
          htmlFor="projectName_projectCreation"
        >
          {t("ProjectName")}
          <StarRateIcon
            style={{
              height: "8px",
              width: "8px",
              color: "red",
              marginBottom: "5px",
            }}
          />
        </label>
        <input
          className={c_Names({
            projectInput: direction !== "rtl",
            projectInputArabic: direction === "rtl",
          })}
          style={{ border: "1px solid red" }}
          autoFocus
          value={projectInput}
          // onChange={(event) => projectInputHandler(event)}
          onChange={(event) => {
            validateData(event, t("ProjectName"));
            setprojectInput(event.target.value);
          }}
          id="projectName_projectCreation"
          ref={projectRef}
          // onPaste={(e) => {
          //   setTimeout(() => validateData(e, "Project Name"), 200);
          // }}
          onKeyPress={(e) => {
            // modified on 16-10-2023 for bug_id: 136508
            if (locale.startsWith(ENGLISH_LOCALE)) {
              if (!isNaN(e.target.value.charAt(0)) && e.target.value != "") {
                e.preventDefault();
              } else {
                FieldValidations(e, 150, projectRef.current, 60);
              }
            } else {
              FieldValidations(e, 150, projectRef.current, 60);
            }
          }}
          tabIndex={0}
        />
        {errorMsg ? (
          <p
            style={{
              color: "red",
              fontSize: "var(--sub_text_font_size)",
              marginBottom: "0.5rem",
              display: "block",
              marginInline: direction === RTL_DIRECTION ? "5%" : null,
            }}
          >
            {errorMsg}
          </p>
        ) : (
          ""
        )}
        {!showDesc ? (
          <p
            className={c_Names({
              AddDesc: direction !== "rtl",
              AddDescArabic: direction == "rtl",
            })}
            style={{ color: "var(--button_color)" }}
            onClick={addDescription}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addDescription();
                e.stopPropagation();
              }
            }}
            id="addDescription_projectCreation"
          >
            {t("addDescription")}
          </p>
        ) : null}

        {showDesc ? (
          <div
            className={c_Names({
              descriptionToShow: direction !== "rtl",
              descriptionToShowArabic: direction == "rtl",
            })}
          >
            <p
              className={c_Names({
                Label: direction !== "rtl",
                LabelArabic: direction == "rtl",
              })}
            >
              {t("Discription")}
            </p>
            <div style={{ height: "53vh" }}>
              <SunTextEditor
                autoFocus={false}
                placeholder={null}
                // descriptionInputcallBack={descriptionInputHandler}
                width={props.width}
                customHeight={props.height}
                getValue={(e) => descriptionInputHandler(e)}
                handleChange={handleChange} //Modified on 27/09/2023, bug_id:135305
              />
            </div>
          </div>
        ) : null}
      </div>
      <div className="footerProjectCreation">
        <button
          className={c_Names({
            create: projectInput.trim().length !== 0,
            createDisable: projectInput.trim().length === 0,
          })}
          disabled={projectInput.trim().length === 0 || errorMsg} //code updated for BugId 116217
          onClick={createHandler}
          id="createBtn_projectCreation"
          tabIndex={0}
          // onKeyDown={(e) => handleProjectCreation(e)}
        >
          {t("createProject")}
        </button>
        <button
          className={c_Names({
            cancel: direction !== "rtl",
            cancelArabic: direction == "rtl",
          })}
          id="footerProjectCreation_cancel"
          onClick={cancelHandler}
          tabIndex={0}
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}

export default ProjectCreation;
