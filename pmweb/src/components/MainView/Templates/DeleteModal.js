// #BugID - 110835
// #BugDescription - Delete category functionality issue resolved
import React from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import styles from "./template.module.css";
import axios from "axios";
import arabicStyles from "./templateArabicStyles.module.css";
import {
  SERVER_URL,
  ENDPOINT_DELETE_CATEGORY,
  RTL_DIRECTION,
  ENDPOINT_DELETE_TEMPLATE,
  ENDPOINT_DELETE_PROJECT,
} from "../../../Constants/appConstants";
import { connect, useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import * as actionCreators from "../../../redux-store/actions/processView/actions";
import { CloseIcon } from "../../../utility/AllImages/AllImages";
import { setProjectCreation } from "../../../redux-store/slices/projectCreationSlice";

function DeleteModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();

  const deleteFunc = () => {
    if (props.category) {
      let json = {
        categoryName: props.elemToBeDeleted.CategoryName,
        categoryId: props.elemToBeDeleted.CategoryId,
      };
      axios
        .post(SERVER_URL + ENDPOINT_DELETE_CATEGORY, json)
        .then((response) => {
          if (response.data.Status === 0) {
            let indexVal;
            let tempList = [...props.categoryList];
            tempList?.forEach((el, index) => {
              if (el.CategoryId === props.elemToBeDeleted.CategoryId) {
                indexVal = index;
              }
            });
            tempList.splice(indexVal, 1);
            props.setCategoryList(tempList);
            props.setModalClosed();
          }
        });
    } else if (props?.deleteProject) {
      let projectId, projectType;

      props.projectList.forEach((project) => {
        if (project.ProjectName === props.projectToDelete) {
          projectId = project.ProjectId;
          projectType = project.ProjectType;
        }
      });
      let checkedOutProcessPresent = false;
      props.allProcessesPerProject.forEach((proc) => {
        if (proc.CheckedOut === "Y") {
          checkedOutProcessPresent = true;
        }
      });
      if (!checkedOutProcessPresent) {
        if (projectType === "R" && props.allProcessesPerProject.length > 0) {
          dispatch(
            setToastDataFunc({
              message: t("deleteAllProcessError"),
              severity: "error",
              open: true,
            })
          );
        } else {
          axios
            .delete(
              SERVER_URL +
                ENDPOINT_DELETE_PROJECT +
                "/" +
                projectId +
                "/" +
                projectType
            )
            .then((res) => {
              if (res?.data?.Status === 0) {
                let processCount = 0;
                props.setProjectList((prev) => {
                  let temp = global.structuredClone(prev);
                  temp.Projects.forEach((proj, index) => {
                    if (proj.ProjectId === projectId) {
                      processCount = proj.TotalProcessCount;
                      temp.Projects.splice(index, 1); //added on 1/31/2024 for bug_id: 143111
                    }
                  });
                  return temp;
                });
                // code edited on 3 April 2023 for BugId 126057
                let tempProcessTileList = [...props.processTypeList];
                tempProcessTileList?.forEach((el, index) => {
                  if (el.ProcessType === projectType) {
                    tempProcessTileList[index] = {
                      ...tempProcessTileList[index],
                      Count: el.Count - +processCount,
                    };
                  }
                });
                props.setProcessTileList(tempProcessTileList);
                dispatch(
                  setProjectCreation({
                    projectCreated: true,
                    projectName: null,
                    projectDesc: null,
                  })
                );
                dispatch(
                  setToastDataFunc({
                    message: res?.data?.Message,
                    severity: "success",
                    open: true,
                  })
                );
                props.setModalClosed();
              }
            });
        }
      } else {
        dispatch(
          setToastDataFunc({
            message: t("oneProcessCheckedOutError"),
            severity: "error",
            open: true,
          })
        );
      }
    } else {
      let json = {
        templateName: props.elemToBeDeleted.Name,
        categoryId: props.parentElem.CategoryId,
        templateId: props.elemToBeDeleted.Id,
      };
      axios
        .post(SERVER_URL + ENDPOINT_DELETE_TEMPLATE, json)
        .then((response) => {
          if (response.data.Status === 0) {
            let indexVal;
            let parentIndex;
            let tempList = [...props.categoryList];
            tempList?.forEach((category, p_index) => {
              if (category.CategoryId === props.parentElem.CategoryId) {
                category.Templates?.forEach((el, index) => {
                  if (el.Id === props.elemToBeDeleted.Id) {
                    parentIndex = p_index;
                    indexVal = index;
                  }
                });
              }
            });
            // modified on 31/01/24 for BugId 143049
            // tempList[parentIndex].Templates.splice(indexVal, 1);
            let templateList = JSON.parse(
              JSON.stringify(tempList[parentIndex]?.Templates)
            )
            templateList.splice(indexVal, 1);
            tempList[parentIndex].Templates = [...templateList]
            // till here BugId 143049
            props.setCategoryList(tempList);
            props.setModalClosed();
          }
        });
    }
  };

  const deleteModalHeading = () => {
    if (props.category) {
      return t("category");
    } else if (props.projectList) {
      return t("project");
    } else return t("s_template");
  };

  const deleteModalSubHeading = () => {
    if (props.category) {
      return t("Category");
    } else if (props.projectList) {
      return t("project");
    } else return t("Template");
  };

  const elementToBeDeleted = () => {
    if (props.category) {
      return props.elemToBeDeleted.CategoryName;
    } else if (props.deleteProject) {
      return props.projectToDelete;
    } else return props.elemToBeDeleted.Name;
  };

  // const handleKeyCancel = (e) => {
  //   if (e.keyCode === 13 ) {
  //     {props.setModalClosed}
  //     e.stopPropagation();
  //   }
  // };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyCancel);
  //   return () => document.removeEventListener("keydown", handleKeyCancel);
  // },[handleKeyCancel]);

  const handleKeyDelete = (e) => {
    if (e.keyCode === 13) {
      deleteFunc();
      e.stopPropagation();
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyDelete);
  //   return () => document.removeEventListener("keydown", handleKeyDelete);
  // },[handleKeyDelete]);

  return (
    <div className={styles.mainDiv}>
      <div className={styles.headingDiv}>
        <p className={styles.deleteModalHeadingTitle}>
          {" "}
          {t("delete")} {deleteModalHeading()}
        </p>
        <div className={styles.closeIconDiv}>
          <CloseIcon
            className={styles.closeIcon}
            onClick={props.setModalClosed}
            id="pmweb_DeleteModal_Cancel"
            onKeyUp={props.onKeyUp}
            tabIndex={0}
          ></CloseIcon>
        </div>
      </div>
      <p className={styles.deleteModalHeading}>
        {" "}
        {t("AreYouSureThatYouWantToDeleteThis")} {deleteModalHeading()} ?
      </p>
      <p className={styles.deleteModalSubHeading}>
        {deleteModalSubHeading()} :{" "}
        <span className={styles.deleteModalName}>{elementToBeDeleted()}</span>
      </p>
      <div
        className={
          direction === RTL_DIRECTION ? arabicStyles.noteDiv : styles.noteDiv
        }
      >
        {t("NOTE")} :{" "}
        {props.category ? (
          t("categories") + " " + t("categoryDeletedMessage")
        ) : (
          <>
            {props.deleteProject
              ? t("projects.projects") + " " + t("onceDeletedCannotBeRecovered")
              : t("templates") + " " + t("onceDeletedCannotBeRecovered")}
          </>
        )}
      </div>
      <div className={styles.deleteModalButtonDiv}>
        <Button
          className={styles.cancelCategoryButton}
          onClick={props.setModalClosed}
          id="pmweb_DeleteModal_Cancel"
          tabIndex={0}
          // onKeyDown={(e)=>handleKeyCancel(e)}
        >
          {t("cancel")}
        </Button>
        <Button
          className={styles.deleteCategoryButton}
          onClick={() => {
            deleteFunc();
          }}
          tabIndex={0}
          onKeyDown={(e) => handleKeyDelete(e)}
          id="pmweb_DeleteModal_Delete"
        >
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    setProcessTileList: (list) =>
      dispatch(actionCreators.processTileList(list)),
  };
};

const mapStateToProps = (state) => {
  return {
    processTypeList: state.processTypesReducer.tileData,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteModal);
