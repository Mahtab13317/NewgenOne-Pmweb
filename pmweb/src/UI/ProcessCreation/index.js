// #BugID - 111782
// #BugDescription - asterisk mark for mandatory fields added.
// #BugID - 113782
// #BugDescription - Validation for projectname and processname to prevent numeric at begining added
// #BugID - 125171
// #BugDescription -  Fixed the issue Without for assignment of pmweb menu rights the user is getting all the access for the same and able to peroform operation

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  APP_HEADER_HEIGHT,
  ENDPOINT_ADD_PROCESS,
  RTL_DIRECTION,
  SERVER_URL,
  BTN_HIDE,
  BTN_SHOW,
  ENDPOINT_GETPROJECTLIST_DRAFTS,
  userRightsMenuNames,
} from "../../Constants/appConstants";
import styles from "./index.module.css";
import arabicStyles from "./indexArabic.module.css";
import SelectWithInput from "../SelectWithInput";
import SingleTemplateCard from "../SingleTemplateCard";
import {
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import Modal from "../Modal/Modal.js";
import { useHistory } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import * as actionCreators from "../../redux-store/actions/processView/actions.js";
import * as actionCreators_template from "../../redux-store/actions/Template";
import CircularProgress from "@material-ui/core/CircularProgress";
import CreateProcessByTemplate from "../../components/MainView/Create/CreateProcessByTemplate";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import { useRef } from "react";
import { FieldValidations } from "../../utility/FieldValidations/fieldValidations";
import { UserRightsValue } from "../../redux-store/slices/UserRightsSlice";
import { getMenuNameFlag } from "../../utility/UserRightsFunctions";
import {
  isArabicLocaleSelected,
  isEnglishLocaleSelected,
} from "../../utility/CommonFunctionCall/CommonFunctionCall";
import BackIcon from "../../assets/genAI_Icons/headerBackIcon.svg";

function ProcessCreation(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const [defaultProject, setDefaultProject] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [projectName, setProjectName] = useState();
  const [isProjectNameConstant, setProjectNameConstant] = useState(false);
  const [processName, setProcessName] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [chooseTemplateModal, setChooseTemplateModal] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const [createProcessSpinner, setCreateProcessSpinner] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const history = useHistory();
  const processNameRef = useRef();
  const userRightsValue = useSelector(UserRightsValue);

  // Boolean that decides whether create project button will be visible or not.
  const createProjectRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProject
  );

  useEffect(() => {
    if (!!props.selectedProjectName) {
      setProjectName(props.selectedProjectName);
    }
  }, [props.selectedProjectName]);

  useEffect(() => {
    if (props.selectedTemplate) {
      setSelectedTemplate(props.selectedTemplate);
    }
  }, [props.selectedTemplate]);

  useEffect(() => {
    if (props.selectedProjectName && props.selectedProjectId) {
      setDefaultProject(props.selectedProjectName);
      setSpinner(false);
    } else {
      axios
        .get(SERVER_URL + ENDPOINT_GETPROJECTLIST_DRAFTS)
        .then((res) => {
          if (res.status === 200) {
            let projectWithCreateRights = res.data.Projects?.filter(
              (el) => el?.RIGHTS?.CPRC === "Y"
            );
            setProjectList(projectWithCreateRights);
            if (props.template_selected) {
              setSelectedTemplate(props.template_selected);
            }
            setProcessName(props.template_process);
            setProjectName(props.template_project);
            setProjectNameConstant(props.template_project_const);
            setFiles(props.template_files);
            setSpinner(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setSpinner(false);
        });
    }
  }, []);

  const cancelHandler = () => {
    if (props.cancelFunction) {
      props.cancelFunction();
    } else {
      props.moveBackFunction();
    }
  };

  const createHandler = () => {
    setCreateProcessSpinner(true);
    //code updated on 11 November 2022 for BugId 110122
    //code updated on 02 Dec 2022 for BugId 110147,110193,110194
    let regex = new RegExp(/^[A-Za-z][A-Za-z0-9_\_\s]*$/gm);
    if (
      !defaultProject &&
      !isProjectNameConstant &&
      (projectName == "" || projectName == null)
    ) {
      dispatch(
        setToastDataFunc({
          message: t("SelectProjectNameErr"),
          severity: "error",
          open: true,
        })
      );
      setCreateProcessSpinner(false);
      return false;
    } else if (projectName.length > 60) {
      dispatch(
        setToastDataFunc({
          message: t("ProjectNameMaxLength"),
          severity: "error",
          open: true,
        })
      );
      setCreateProcessSpinner(false);
    } else if (processName == "" || processName == null) {
      dispatch(
        setToastDataFunc({
          message: t("pleaseEnterAProcessName"),
          severity: "error",
          open: true,
        })
      );
      setCreateProcessSpinner(false);
    } else if (isEnglishLocaleSelected() && !regex.test(processName)) {
      dispatch(
        setToastDataFunc({
          message: t("processnameValidation"),
          severity: "error",
          open: true,
        })
      );
      setCreateProcessSpinner(false);
    } else if (processName.length > 22) {
      dispatch(
        setToastDataFunc({
          message: t("processNameLengthErrorMsg"),
          severity: "error",
          open: true,
        })
      );
      setCreateProcessSpinner(false);
    } else {
      let jsonBody = {
        processName: processName.trim(),
        openProcess: "Y",
        projectId: defaultProject
          ? props.selectedProjectId
          : isProjectNameConstant
          ? -1
          : projectName.ProjectId,
        projectName: isProjectNameConstant ? projectName : "",
        templateId: selectedTemplate ? selectedTemplate.Id : -1,
      };
      axios.post(SERVER_URL + ENDPOINT_ADD_PROCESS, jsonBody).then((res) => {
        if (res?.data?.Status === 0) {
          props.openProcessClick(
            res.data.OpenProcess.ProcessDefId,
            res.data.OpenProcess.ProjectName,
            res.data.OpenProcess.ProcessType,
            res.data.OpenProcess.VersionNo,
            res.data.OpenProcess.ProcessName
          );
          props.openTemplate(null, null, false);
          if (props.setShowTemplateModal) {
            props.setShowTemplateModal(false);
          }
          history.push("/process");
          props.CreateProcessClickFlag(null);
          props.setTemplatePage(null);
        } else if (res?.data?.Status === -2) {
          dispatch(
            setToastDataFunc({
              message: res.data.Message,
              severity: "error",
              open: true,
            })
          );
          setCreateProcessSpinner(false);
        } else {
          setCreateProcessSpinner(false);
        }
      });
    }
  };

  useEffect(() => {
    props.setTemplateDetails(
      props.category,
      props.view,
      true,
      selectedTemplate,
      projectName,
      isProjectNameConstant,
      processName,
      files
    );
  });

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
  const changeProcessName = (e) => {
    // if (!isNaN(e.target.value.charAt(0)) && e.target.value != "") {
    //   if (e.target.value.length > 22) {
    //     setErrorMsg(t("processNameMsg"));
    //   } else {
    //     setErrorMsg("");
    //   }
    // } else {
    validateData(e, t("NameofProcess"));
    setProcessName(e.target.value);
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
    <React.Fragment>
      <Grid
        container
        justifyContent="space-between"
        className={styles.header}
        xs={12}
        alignItems="center"
      >
        <Grid
          container
          item
          alignItems="center"
          style={{ width: "fit-content" }}
        >
          <IconButton
            id="pmweb_backBtn_processCreation"
            onClick={props?.noBackBtn ? "" : props.moveBackFunction}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !props?.noBackBtn) {
                props.moveBackFunction();
              }
            }}
            className={styles.backIconContainer}
            disableFocusRipple
            disableTouchRipple
            disableRipple
          >
            {direction === RTL_DIRECTION ? (
              <img src={BackIcon} alt="back" className={styles.backRevIcon} />
            ) : (
              <img src={BackIcon} alt="back" className={styles.backIcon} />
            )}
          </IconButton>

          <Typography
            className={styles.topBarHeading}
            style={{ direction: direction }}
          >
            {t("back")}
          </Typography>
        </Grid>

        {props?.showCreateProcessByAI && (
          <Grid item>
            <Button
              className={styles.regenerateBtn}
              onClick={props.moveBackFunction}
            >
              <div
                className={styles.regenerateTextDiv}
                style={{
                  width: `calc(100% - 4px)`,
                  height: `calc(100% - 4px)`,
                }}
              >
                <div className={styles.regenerateText}>
                  {t("createUsingNewgenAI")}
                </div>
              </div>
            </Button>
          </Grid>
        )}
      </Grid>
      <div className="flex w100" style={{ height: "100%" }}>
        <div className={styles.formArea}>
          <div
            className={
              direction === RTL_DIRECTION ? arabicStyles.form : styles.form
            }
          >
            <label
              className={
                direction === RTL_DIRECTION ? arabicStyles.label : styles.label
              }
              htmlFor="pmweb_projectNameSelect_processCreation"
            >
              {t("nameOfProject")}
              <span className={styles.starIcon}>*</span>
            </label>
            <label
              style={{ display: "none" }}
              htmlFor="pmweb_projectNameInput_processCreation"
            >
              INPUT
            </label>
            {defaultProject ? (
              <input
                type="text"
                className={styles.disabledField}
                value={defaultProject}
                disabled
                id="pmweb_projectNameInput_processCreation"
              />
            ) : (
              <SelectWithInput
                dropdownOptions={projectList}
                id="pmweb_projectNameSelect_processCreation"
                value={projectName}
                setValue={(val) => {
                  setProjectName(val);
                }}
                showEmptyString={false}
                showConstValue={createProjectRightsFlag ? true : false}
                inputClass={
                  direction === RTL_DIRECTION
                    ? arabicStyles.selectWithInputTextField
                    : styles.selectWithInputTextField
                }
                constantInputClass={
                  direction === RTL_DIRECTION
                    ? arabicStyles.multiSelectConstInput
                    : styles.multiSelectConstInput
                }
                setIsConstant={
                  createProjectRightsFlag ? setProjectNameConstant : false
                }
                isConstant={
                  createProjectRightsFlag ? isProjectNameConstant : false
                }
                constantStatement="project"
                constantOptionStatement="+addProject"
                optionStyles={{ color: "darkBlue" }}
                isConstantIcon={createProjectRightsFlag ? true : false}
                optionKey="ProjectName"
                selectWithInput={
                  direction === RTL_DIRECTION
                    ? arabicStyles.selectWithInput
                    : styles.selectWithInput
                }
              />
            )}
            <label
              className={
                direction === RTL_DIRECTION ? arabicStyles.label : styles.label
              }
              htmlFor="pmweb_processName_processCreation"
            >
              {t("NameofProcess")}
              <span className={styles.starIcon}>*</span>
            </label>
            <input
              type="text"
              className={styles.inputField}
              value={processName}
              onChange={changeProcessName}
              id="pmweb_processName_processCreation"
              ref={processNameRef}
              onKeyPress={(e) => {
                FieldValidations(e, 169, processNameRef.current, 23);
              }}
              //code added on 18 October 2022 for BugId 115644
              //code added on 27 JAN 2023 for BugId 122388
              // onPaste={(e) => {
              //   FieldValidations(e, 169, processNameRef.current, 23);
              // }}
            />
            {/* Changes made to solve Bug 110494 */}
            {/* <p
              className={
                direction === RTL_DIRECTION ? arabicStyles.label : styles.label
              }
            >
              {t("attachments")}
            </p>
            <FileUpload
              setFiles={setFiles}
              typesOfFilesToAccept={[
                FILETYPE_DOC,
                FILETYPE_XLS,
                FILETYPE_DOCX,
                FILETYPE_ZIP,
                FILETYPE_PNG,
                FILETYPE_JPEG,
                FILETYPE_PDF,
              ]}
              files={files}
            /> */}
            {errorMsg != "" ? (
              <p
                style={{
                  color: "red",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {errorMsg}
              </p>
            ) : null}
          </div>
        </div>
        <div className={styles.templateArea}>
          <div className={styles.selectedTemplateDiv}>
            <p
              className={
                direction === RTL_DIRECTION ? arabicStyles.label : styles.label
              }
            >
              {" "}
              {t("selectedTemplate")}
            </p>
            {selectedTemplate ? (
              <SingleTemplateCard
                item={selectedTemplate}
                style={{
                  marginTop: 0,
                  marginRight: 0,
                  boxShadow: "none",
                }}
                templateComboStyle={{
                  minWidth: "13vw",
                }}
                cardWidth="100%"
                cardActivityMaxWidth="25%"
                bRemoveBtn={true}
                bReplaceBtn={true}
                replaceFunction={() => {
                  setChooseTemplateModal(true);
                  if (props.createProcessFlag) {
                    props.setTemplatePage(null);
                  }
                }}
                bPreviewBtn={true}
                previewFunc={() => {
                  props.setTemplatePage(props.templatePage);
                }}
                removeFunction={() => setSelectedTemplate(null)}
                templateName={selectedTemplate.Name}
                templateId={selectedTemplate.Id}
                noBackBtn={props?.noBackBtn ? true : false}
              />
            ) : (
              <Card variant="outlined" className={styles.card}>
                <CardContent className={styles.cardContent}>
                  <p>{t("noTemplateSelected")}</p>
                  <div className={styles.templateFooter}>
                    <button
                      className={styles.previewButton}
                      onClick={() => setChooseTemplateModal(true)}
                      id="pmweb_chooseTemp_processCreation"
                    >
                      {t("chooseTemplate")}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <button
          className={styles.cancelBtn}
          onClick={cancelHandler}
          disabled={createProcessSpinner}
          id="pmweb_cancelBtn_processCreation"
        >
          {t("cancel")}
        </button>
        <button
          className={styles.createBtn}
          onClick={createHandler}
          disabled={
            createProcessSpinner ||
            (isProjectNameConstant && projectName?.trim() === "") ||
            errorMsg != ""
          }
          id="pmweb_createBtn_processCreation"
          style={{
            cursor:
              createProcessSpinner ||
              (isProjectNameConstant && projectName?.trim() === "")
                ? "default"
                : "pointer",
          }}
        >
          {createProcessSpinner ? (
            <>
              <CircularProgress
                style={{
                  width: "1rem",
                  height: "1rem",
                  color: "white",
                  marginRight: "6px",
                }}
              />
              {t("Create")}
            </>
          ) : (
            t("Create")
          )}
        </button>
      </div>
      {chooseTemplateModal ? (
        <Modal
          show={chooseTemplateModal}
          style={{
            top: "2%",
            height: "94%",
            left: "2%",
            width: "96%",
            padding: "0",
          }}
          backDropStyle={{
            top: `-${APP_HEADER_HEIGHT}`,
            height: `calc(100% + ${APP_HEADER_HEIGHT})`,
          }}
          modalClosed={() => setChooseTemplateModal(false)}
          children={
            <CreateProcessByTemplate
              bCancel={true}
              cancelFunction={() => {
                setChooseTemplateModal(false);
                if (props.createProcessFlag) {
                  props.setTemplatePage(null);
                }
              }}
              containerWidth="79.5vw"
              cardWidth="37vw"
              cardActivityMaxWidth="9.25vw"
              bSelectBtn={BTN_SHOW}
              selectFunction={(template) => {
                setSelectedTemplate(template);
                setChooseTemplateModal(false);
                if (props.createProcessFlag) {
                  props.setTemplatePage(props.templatePage);
                }
              }}
              bSelectTemplateBtn={BTN_HIDE}
              bPreviewBtn={BTN_HIDE}
              selectedTemplate={selectedTemplate}
            />
          }
        />
      ) : null}
    </React.Fragment>
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
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
    setTemplateDetails: (
      category,
      view,
      createBtnClick,
      template,
      projectName,
      isProjectNameConstant,
      processName,
      files
    ) =>
      dispatch(
        actionCreators_template.setTemplateDetails(
          category,
          view,
          createBtnClick,
          template,
          projectName,
          isProjectNameConstant,
          processName,
          files
        )
      ),
    CreateProcessClickFlag: (flag) =>
      dispatch(actionCreators.createProcessFlag(flag)),
  };
};

const mapStateToProps = (state) => {
  return {
    selectedProjectId: state.selectedProjectReducer.selectedProjectId,
    selectedProjectName: state.selectedProjectReducer.selectedProjectName,
    template_selected: state.templateReducer.template_selected,
    template_project: state.templateReducer.template_project,
    template_project_const: state.templateReducer.template_project_const,
    template_process: state.templateReducer.template_process,
    template_files: state.templateReducer.template_files,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProcessCreation);
