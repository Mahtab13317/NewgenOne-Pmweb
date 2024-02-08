// Changes made to solve Bug with ID = 114685 => Project Description is not getting saved
// #BugID - 120616
// #BugDescription - added functionality to Create project option from drafts and deployed
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly

// #BugID - 125171
// #BugDescription -  Fixed the issue Without for assignment of pmweb menu rights the user is getting all the access for the same and able to peroform operation

import React, { useEffect, useState } from "react";
import "../../Projects/projects.css";
import { useTranslation } from "react-i18next";
import CreateProcessButton from "../../../../../UI/Buttons/CreateProcessButton";
import styles from "../../../Templates/template.module.css";
import arabicStyles from "../../../Templates/templateArabicStyles.module.css";
import MortVertModal from "../../../../../UI/ActivityModal/Modal";
import { MoreVertOutlined } from "@material-ui/icons";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import { tileProcess } from "../../../../../utility/HomeProcessView/tileProcess.js";
import * as actionCreators from "../../../../../redux-store/actions/processView/actions";
import * as actionCreators_template from "../../../../../redux-store/actions/Template";
import { connect, useDispatch, useSelector } from "react-redux";
import { shortenRuleStatement } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import {
  CREATE_PROCESS_FLAG_FROM_PROCESSES,
  PREVIOUS_PAGE_PROCESS,
  PROCESSTYPE_LOCAL,
  RTL_DIRECTION,
  userRightsMenuNames,
} from "../../../../../Constants/appConstants";
import Modal from "../../../../../UI/Modal/Modal";
import DeleteModal from "../../../Templates/DeleteModal";
import RenameModal from "../../../Templates/RenameModal";
import ImportIcon from "../../../../../assets/ProcessView/PT_Import.svg";
import { ImportExportSliceValue } from "../../../../../redux-store/slices/ImportExportSlice";
import ImportExportProcess from "../../../ImportExportProcess/ImportExportProcess";
import { UserRightsValue } from "../../../../../redux-store/slices/UserRightsSlice";
import {
  getLocalProjectRights,
  getMenuNameFlag,
} from "../../../../../utility/UserRightsFunctions";
import { setPreviousProcessPage } from "../../../../../redux-store/slices/storeProcessPage";
import { IconButton, useMediaQuery } from "@material-ui/core";

function ProcessesHeader(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [action, setAction] = useState(null);
  const dispatch = useDispatch();
  const userRightsValue = useSelector(UserRightsValue);
  const ProjectValue = useSelector(ImportExportSliceValue);

  const smallScreen = useMediaQuery("(max-width:699px)");
  const [openFilterModal, setOpenFilterModal] = useState(false);

  const createProcessHandler = () => {
    props.CreateProcessClickFlag(CREATE_PROCESS_FLAG_FROM_PROCESSES);
    props.setTemplatePage(PREVIOUS_PAGE_PROCESS);
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
    //props.selectedProject is selected project name
    props.setSelectedProject(props.selectedProjectId, props.selectedProject);
  };

  const [moreOptionsArr, setMoreOptionsArr] = useState([]);
  const arr = [t("Rename"), t("delete")];
  const [selectedProject, setSelectedProject] = useState(null);
  const getActionName = (actionName) => {
    setAction(actionName);
  };

  /* let deleteProcess = props?.selectedProjectRights?.CPRC;
  deleteProcess = "N"; */

  // Boolean that decides whether import process button will be visible or not.
  const importProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.importProcess
  )
    ? getLocalProjectRights(props?.selectedProjectRights?.IMPPRC)
    : getLocalProjectRights(props?.selectedProjectRights?.IMPPRC);

  // Boolean that decides whether create process button will be visible or not.
  let createProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProcess
  )
    ? getLocalProjectRights(props?.selectedProjectRights?.CPRC)
    : getLocalProjectRights(props?.selectedProjectRights?.CPRC);

  let deleteKey =
    props.tabValue === 0
      ? props?.selectedProjectRights?.D
      : props?.selectedProjectRights?.U;

  // Boolean that decides whether delete project option will be visible or not.
  const deleteProjectRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.deleteProject
  )
    ? getLocalProjectRights(deleteKey)
    : getLocalProjectRights(deleteKey);

  // Boolean that decides whether rename project option will be visible or not.
  const renameProjectRightsFlag = getLocalProjectRights(
    props?.selectedProjectRights?.M
  );

  const importProcessHandler = () => {
    setAction("importExportModal");
  };

  useEffect(() => {
    setSelectedProject(props.selectedProject);
    let tempArr = [...arr];
    if (!deleteProjectRightsFlag) {
      let deleteProjectIndex;
      tempArr.forEach((element, index) => {
        if (element === t("delete")) {
          deleteProjectIndex = index;
        }
      });
      tempArr.splice(deleteProjectIndex, 1);
    }
    if (!renameProjectRightsFlag) {
      let renameIndex;
      tempArr.forEach((element, index) => {
        if (element === t("rename")) {
          renameIndex = index;
        }
      });
      tempArr.splice(renameIndex, 1);
    }
    setMoreOptionsArr(tempArr);
  }, [props.selectedProject, deleteProjectRightsFlag, renameProjectRightsFlag]);

  const handleKeyImport = (e) => {
    if (e.keyCode === 13) {
      importProcessHandler();
      e.stopPropagation();
    }
  };

  return (
    <div className="newProcessHeader" style={{ direction: `${t("HTML_DIR")}` }}>
      <div className="processName">
        {props.selectedProject ? (
          // Changes made to solve Bug 136196
          <LightTooltip
            id="pmweb_projectname_Tooltip"
            arrow={true}
            enterDelay={500}
            placement="bottom-start"
            title={selectedProject}
          >
            <h3 style={{ color: "black", fontWeight: "600" }}>
              {/* {selectedProject} */}
              {/* changes for fixing UI distortion in tablet */}
              {/* {shortenRuleStatement(selectedProject, 33)} */}
              {shortenRuleStatement(selectedProject, 10)}
            </h3>
          </LightTooltip>
        ) : (
          <h3 style={{ color: "black", fontWeight: "600" }}>
            {t(tileProcess(props.selectedProcessCode)[1])}{" "}
            {t(tileProcess(props.selectedProcessCode)[2])}{" "}
            {t("processList.processes")}
          </h3>
        )}
        <div className="importOrCreateProcessButtons">
          {/* <div
            style={{
              width: "28px",
              marginRight: "10px",
              height: "28px",
              border: "1px solid #C4C4C4",
              display: "inline-block",
              textAlign: "center",
            }}
          >
            <img
              src={ShareIcon}
              style={{
                height: "18px",
                width: "16px",
                paddingTop: "3px",
                color: "#C4C4C4",
              }}
              alt=""
            />
          </div>*/}
          {importProcessRightsFlag &&
            props.projectType === PROCESSTYPE_LOCAL && (
              <CreateProcessButton
                onClick={importProcessHandler}
                id="pmweb_import_Process"
                onKeyDown={(e) => handleKeyImport(e)}
                tabIndex={0}
                buttonContent={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25vw",
                    }}
                  >
                    <span>{t("ImportProcess")}</span>
                    <img
                      src={ImportIcon}
                      style={{
                        height: "1.25rem",
                        width: "1.25rem",
                        marginBottom: "2px",
                      }}
                      // Changes on 07-09-2023 to resolve the bug Id 135240
                      alt="clickable"
                    />
                  </div>
                }
                buttonStyle={{
                  backgroundColor: "white",
                  textTransform: "none",
                  color: "#606060",
                  border: "1px solid #C4C4C4",
                  minWidth: "9vw",
                }}
              ></CreateProcessButton>
            )}
          {createProcessRightsFlag &&
            props.projectType === PROCESSTYPE_LOCAL && (
              <CreateProcessButton
                variant="contained"
                onClick={() => createProcessHandler()}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    createProcessHandler();
                    e.stopPropagation();
                  }
                }}
                id="pmweb_create_Process"
                buttonContent={`${t("CreateProcess")}`}
                buttonStyle={{
                  backgroundColor: "var(--button_color)",
                  textTransform: "none",
                  color: "white",
                  minWidth: "8vw",
                }}
                disableElevation
              ></CreateProcessButton>
            )}

          {
            //code updated on 15 Dec 2022 for BugId 112900
            props.selectedProject && moreOptionsArr?.length > 0 ? (
              // code changes on 05-09-2023 for bug Id 135241
              <>
                <IconButton
                  style={{
                    width: "var(--line_height)",
                    height: "var(--line_height)",
                    // marginRight: "var(--spacing_h)",
                    border: "1px solid #C4C4C4",
                    display: "inline-block",
                    textAlign: "center",
                    padding: "0.25rem",
                    borderRadius: "2px",
                  }}
                  // tabIndex={0}
                  role="Modal"
                  aria-label="ActvityModalPopop"
                  aria-description="Actvity Modal popup for Rename and delete"
                  onClick={() => setOpenFilterModal(true)}
                >
                  <MoreVertOutlined className={styles.moreVertIcon} />
                </IconButton>
                <MortVertModal
                  open={openFilterModal}
                  handleClose={() => setOpenFilterModal(false)}
                  backDrop={false}
                  getActionName={(actionName) => getActionName(actionName)}
                  modalPaper={
                    direction === RTL_DIRECTION
                      ? arabicStyles.moreVertProcessHeaderModal
                      : styles.moreVertProcessHeaderModal
                  }
                  sortByDiv={styles.moreVertModalDiv}
                  modalDiv={styles.moreVertDiv}
                  sortByDiv_arabic="sortByDiv_arabicActivity"
                  oneSortOption={styles.moreVertModalOption}
                  showTickIcon={false}
                  sortSectionOne={moreOptionsArr}
                  dividerLine="dividerLineActivity"
                  hideRelative={true}
                />

                {action === t("delete") ? (
                  <Modal
                    show={action === t("delete")}
                    style={{
                      // width: "30vw",
                      //   left: "37%",
                      top: "25%",
                      padding: "0",
                    }}
                    modalClosed={() => setAction(null)}
                    children={
                      <DeleteModal
                        projectList={props.projectList}
                        setProjectList={props.setProjectList}
                        setModalClosed={() => setAction(null)}
                        projectToDelete={props.selectedProject}
                        deleteProject={true}
                        allProcessesPerProject={props.allProcessesPerProject}
                      />
                    }
                  />
                ) : null}

                {action === t("Rename") ? (
                  <Modal
                    show={action === t("Rename")}
                    style={{
                      // width: "30vw",
                      height: "11.5rem",
                      // left: "37%",
                      top: "25%",
                      padding: "0",
                    }}
                    modalClosed={() => setAction(null)}
                    children={
                      <RenameModal
                        projectList={props.projectList}
                        setProjectList={props.setProjectList}
                        setModalClosed={() => setAction(null)}
                        processToDelete={props.selectedProject}
                        projectID={props.selectedProjectId}
                        projectDesc={props.selectedProjectDesc}
                      />
                    }
                  />
                ) : null}
              </>
            ) : null
          }
          <div>
            {action === "importExportModal" ? (
              <Modal
                show={action === "importExportModal"}
                style={{
                  // width: "400px",
                  // left: "35%",
                  top: smallScreen ? "0%" : "20%",
                  padding: "0",
                  position: "absolute",
                  // transform: "translate(-50%, -50%)",
                  boxShadow: "none",
                  //Chnages to resolve the bug ID 124898
                  border: "none",
                }}
                children={
                  <ImportExportProcess
                    ProjectValue={ProjectValue}
                    setAction={() => setAction(null)}
                    typeImportorExport="import"
                    selectedProcessTile={props.selectedProcessTile}
                    selectedProcessCount={props.selectedProcessCount}
                    tabValue={props.tabValue}
                    selectedProjectId={props.selectedProjectId}
                    selectedProcessCode={props.selectedProcessCode}
                    selectedProjectName={props.selectedProject}
                    projectAfterImport={props?.projectAfterImport} //Modified on 11/10/2023, bug_id:126848
                  />
                }
              />
            ) : null}
          </div>
        </div>
      </div>
      {props.selectedProject ? (
        <p className="selectedProjectInfo">{props.selectedProjectDesc}</p>
      ) : (
        <p className="selectedProjectInfo">
          {t("ThisSectionContainsAllThe")}{" "}
          {t(tileProcess(props.selectedProcessCode)[1])}{" "}
          {t("ProcessCreatedByYou")}
        </p>
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    CreateProcessClickFlag: (flag) =>
      dispatch(actionCreators.createProcessFlag(flag)),
    setSelectedProject: (id, name) => {
      dispatch(actionCreators.selectedProject(id, name));
    },
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
  };
};

const mapStateToProps = (state) => {
  return {
    getTemplatePage: state.templateReducer.template_page,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProcessesHeader);
