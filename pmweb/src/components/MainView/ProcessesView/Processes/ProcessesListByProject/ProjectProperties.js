// #BugID - 117665
// #BugDescription - Handled the checks to prevent the screen crash.
// #Date - 26 October 2022
// #BugID - 110710
// #BugDescription - Added the saved message.
// #Date - 25 Nov 2022
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SunEditor from "../../../../../UI/SunEditor/SunTextEditor";
import "./ProjectProperties.css";
import axios from "axios";
import {
  ENDPOINT_GET_PROJECT_PROPERTIES,
  ENDPOINT_PROJECT_PROPERTIES,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../../Constants/appConstants";
import arabicStyles from "./ArabicStyles.module.css";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  encode_utf8,
  decode_utf8,
} from "../../../../../utility/UTF8EncodeDecoder";
import { convertToArabicDateTime } from "../../../../../UI/DatePicker/DateInternalization";
import { useMediaQuery } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";

function ProjectProperties(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [description, setDescription] = useState("");
  const [projectName, setProjectName] = useState(null);
  const [createdBy, setCreatedBy] = useState(null);
  const [LastModifiedBy, setLastModifiedBy] = useState(null);
  const [createdOn, setCreatedOn] = useState(null);
  const [lastModifiedOn, setLastModifiedOn] = useState(null);
  const [processCount, setProcessCount] = useState(null);
  const [prevDesc, setprevDesc] = useState("");
  // modified on 20/10/23 for BugId 139684
  // const [btnDisable, setBtnDisable] = useState(
  //   props?.selectedProjectRights?.M === "N" ? true : false
  // );
  //Modified on 17/10/2023, bug_id:135623 */
  const [btnDisable, setBtnDisable] = useState(true);
  // till here BugId 139684
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    axios
      .get(
        SERVER_URL +
          ENDPOINT_GET_PROJECT_PROPERTIES +
          "/" +
          props.projectId +
          "/L"
      )
      .then((res) => {
        if (res?.data?.Status === 0) {
          setCreatedBy(res?.data?.ProjectProperty?.CreatedBy);
          // modified on 27/09/23 for BugId 136677
          // setCreatedOn(res?.data?.ProjectProperty?.CreationDateTime);
          // setLastModifiedOn(res?.data?.ProjectProperty?.LastModifiedOn);
          let createdDate = convertToArabicDateTime(
            res?.data?.ProjectProperty?.CreationDateTime
          );
          setCreatedOn(createdDate);
          let modifiedDate = convertToArabicDateTime(
            res?.data?.ProjectProperty?.LastModifiedOn
          );
          setLastModifiedOn(modifiedDate);
          // till here BugId 136677
          setprevDesc(res?.data?.ProjectProperty?.Description);
          setDescription(res?.data?.ProjectProperty?.Description);
          setLastModifiedBy(res?.data?.ProjectProperty?.LastModifiedBy);
          setProjectName(res?.data?.ProjectProperty?.ProjectName);
          setProcessCount(res?.data?.ProjectProperty?.TotalProcessCount);
          setLoader(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoader(false);
      });
  }, [props.projectId]);

  const saveHandler = () => {
    let jsonBody = {
      projectName: projectName,
      projectId: props?.projectId,
      projectOldName: projectName,
      description: encode_utf8(decode_utf8(description)),
    };
    axios
      .post(SERVER_URL + ENDPOINT_PROJECT_PROPERTIES, jsonBody)
      .then((res) => {
        if (res?.data?.Status === 0) {
          dispatch(
            setToastDataFunc({
              message: t("propertySaved"),
              severity: "success",
              open: true,
            })
          );
          setBtnDisable(true); //Modified on 17/10/2023, bug_id:135623
        } else {
          setToastDataFunc({
            message: res?.data?.message,
            severity: "error",
            open: true,
          });
        }
      });
    /* .catch((err) => {
        console.log(err);
      }); */
  };

  const descriptionHandler = (e) => {
    // code edited on 2 March 2023 for BugId 122021
    // code modified  for BugId 137345 on 25-09-2023
    setDescription(
      encode_utf8(e?.target?.innerHTML ? e?.target?.innerHTML : "")
    ); //Modified on 17/10/2023, bug_id:135623
    setBtnDisable(false); //Modified on 17/10/2023, bug_id:135623
  };

  const cancelHandler = () => {
    // code modified  for BugId 137345 on 25-09-2023
    setDescription(encode_utf8(prevDesc));
  };

  const handleKeyCancel = (e) => {
    if (e.keyCode === 13) {
      cancelHandler(e);
      e.stopPropagation();
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyCancel);
  //   return () => document.removeEventListener("keydown", handleKeyCancel);
  // },[handleKeyCancel]);

  const handleKeySave = (e) => {
    if (e.keyCode === 13) {
      saveHandler(e);
      e.stopPropagation();
    }
  };

  //Added on 28/09/2023, bug_id:135623
  const handleChange = (data) => {
    setDescription(data);
    setBtnDisable(false);
  };
  //till here for bug id:135623

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeySave);
  //   return () => document.removeEventListener("keydown", handleKeySave);
  // },[handleKeySave]);

  // added on 20/10/23 for BugId 139684
  return loader ? (
    <CircularProgress style={{ marginTop: "30vh", marginInlineStart: "40%" }} />
  ) : (
    <React.Fragment>
      <div
        style={{
          direction: direction,
          // margin: "1rem 1vw 0 ",
          padding: "1rem 1vw",
          background: "#fff",
          // Added the height to resolve the bug Id 124795
          // maxHeight: "58vh", //Changes made to solve Bug 131119
          // height: "100%",
          overflow: "auto",
        }}
        /* changes added for bug_id: 134226 */
        className="divWrapper"
      >
        {/*Bug 117963 [23-02-2023] corrected the spacing */}
        <div className="contentArea">
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.nameAndDesc
                : "nameAndDesc"
            }
          >
            {t("nameAndDesc")}
          </p>

          <div>
            <div className="row w100 margin1 flex1">
              <p className="projectPropertiesLabel">{t("ProjectName")}</p>
              <p
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.projectPropertiesValue
                    : "projectPropertiesValue"
                }
              >
                {projectName}
              </p>
            </div>
          </div>
          <div style={{ height: "25vh", width: "50vw" }}>
            <p className="projectPropertiesLabel">{t("Discription")}</p>{" "}
            {/*Code modifid on 12-09-2023 for Bug 136512 */}
            <SunEditor
              id="pmweb_sunEditor_add_description"
              customHeight="6rem"
              //   placeholder={t("customValidation")}
              value={decode_utf8(description)}
              getValue={(e) => descriptionHandler(e)}
              // modified on 20/10/23 for BugId 139684
              // disabled={props?.selectedProjectRights?.M === "N" ? true : false}
              disabled={props?.selectedProjectRights?.M !== "Y"}
              // till here BugId 139684
              handleChange={handleChange} //Modified on 27/09/2023, bug_id:135305
              callHandleChangeOnPaste={true}
            />
          </div>
          <div className="row w100 bottomSection">
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.nameAndDesc
                  : "row w100 nameAndDesc margin1 flex1"
              }
            >
              {t("projectOwnerDetail")}
            </p>

            <div className="row w100">
              <div className="row w100 margin11 flex1">
                <p className="projectPropertiesLabel">{t("createdOn")}:</p>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.projectPropertiesSubValue
                      : "projectPropertiesSubValue"
                  }
                >
                  {createdOn}
                </p>
              </div>
              <div className="row w100 margin11 flex1">
                <p className="projectPropertiesLabel">{t("createdby")}:</p>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.projectPropertiesSubValue
                      : "projectPropertiesSubValue"
                  }
                >
                  {createdBy}
                </p>
              </div>
            </div>

            <div className="row w100">
              <div className="row w100 margin11 flex1">
                <p className="projectPropertiesLabel">{t("modifiedOn")}</p>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.projectPropertiesSubValue
                      : "projectPropertiesSubValue"
                  }
                >
                  {lastModifiedOn}
                </p>
              </div>
              <div className="row w100 margin11 flex1">
                <p className="projectPropertiesLabel">{t("modifiedBy")}</p>
                <p
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.projectPropertiesSubValue
                      : "projectPropertiesSubValue"
                  }
                >
                  {LastModifiedBy}
                </p>
              </div>
            </div>

            <div className="row w100 margin11 flex1">
              <p className="projectPropertiesLabel">{t("processCount")}:</p>
              <p
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.projectPropertiesValue
                    : "projectPropertiesValue"
                }
              >
                {processCount}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.footerProjectProperties
            : "footerProjectProperties"
        }
      >
        <div style={{ position: "absolute", bottom: "0" }}>
          <button
            className={
              direction === RTL_DIRECTION ? arabicStyles.cancel : "cancel"
            }
            onClick={cancelHandler}
            onKeyDown={(e) => handleKeyCancel(e)}
            tabIndex={0}
            id="pmweb_ProjectProperties_Cancel"
          >
            {t("cancel")}
          </button>
          <button
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.createProperties
                : "createProperties"
            }
            onClick={saveHandler}
            onKeyDown={(e) => handleKeySave(e)}
            tabIndex={0}
            id="pmweb_ProjectProperties_Save"
            // modified on 20/10/23 for BugId 139684
            //disabled={props?.selectedProjectRights?.M === "N" ? true : false}
            // disabled={btnDisable}
            disabled={
              props?.selectedProjectRights?.M !== "Y" ? true : btnDisable
            }
            // till here BugId 139684
          >
            {t("save")}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ProjectProperties;
