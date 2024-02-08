// #BugID - 112684
// #BugDescription - handled checks for error popup message
// #BugID - 121528
// #BugDescription - Handled the function to sort by date

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SearchBox from "../../../UI/Search Component";
import SortButton from "../../../UI/SortingModal/Modal";
import FilterImage from "../../../assets/ProcessView/Sort_ASC.svg"; //Modified on 12/09/2023, bug_id:136595
//import FilterImage from "../../../assets/ProcessView/PT_Sorting.svg";
import styles from "./template.module.css";
import arabicStyles from "./templateArabicStyles.module.css";
import {
  APP_HEADER_HEIGHT,
  CREATE_PROCESS_FLAG_FROM_TEMPLATES,
  NO_CREATE_PROCESS_FLAG,
  PREVIOUS_PAGE_CREATE_FROM_TEMPLATE,
  RTL_DIRECTION,
} from "../../../Constants/appConstants";
import MenuIcon from "@material-ui/icons/Menu";
import AppsIcon from "@material-ui/icons/Apps";
import {
  TEMPLATE_GRID_VIEW,
  TEMPLATE_LIST_VIEW,
} from "../../../Constants/appConstants";
import ProcessCreation from "../../../UI/ProcessCreation";
import Modal from "../../../UI/Modal/Modal.js";
import TemplateListView from "./TemplateListView";
import TemplateGridView from "./TemplateGridView";
import NoTemplateScreen from "./NoTemplateScreen";
import * as actionCreators from "../../../redux-store/actions/processView/actions";
import * as actionCreators_template from "../../../redux-store/actions/Template";
import { connect, useSelector } from "react-redux";
import DeleteModal from "./DeleteModal";
import { Grid } from "@material-ui/core";
//import RenameTemplate from "./RenameTemplate";
//import EditTemplate from "./EditTemplate";

function CategoryTemplatesList(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [view, setView] = useState(TEMPLATE_LIST_VIEW);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateList, setTemplateList] = useState([]);
  const [actedTemplate, setActedTemplate] = useState(null);
  const [action, setAction] = useState(null);
  const [divWidth, setDivWidth] = useState(
    window?.innerWidth < 850 ? "63.6vw" : "75vw"
  ); //code added on 28-09-2023 for bugId: 138201
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  useEffect(() => {
    if (props.selectedCategoryDetails?.Templates) {
      setTemplateList(props.selectedCategoryDetails.Templates);
      if (props.templateView) {
        //to set the previous view of templates, before preview button was clicked
        setView(props.templateView);
      }
      if (props.getTemplatePage === PREVIOUS_PAGE_CREATE_FROM_TEMPLATE) {
        //this means the preview button was clicked inside the createProcess modal
        setShowTemplateModal(true);
      }
    }
  }, [props.selectedCategoryDetails]);

  //code added on 28-09-2023 for bugId: 138201
  useEffect(() => {
    const handleResize = () => {
      // Update the width when the window is resized
      setDivWidth(window?.innerWidth < 850 ? "63.6vw" : "75vw");
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // till here for bugId: 138201

  const onSearchSubmit = (searchVal) => {
    //search function for templates
    let arr = [];
    props.selectedCategoryDetails.Templates?.forEach((elem) => {
      if (elem.Name.toLowerCase().includes(searchVal.trim())) {
        arr.push(elem);
      }
    });
    setTemplateList(arr);
  };

  const clearResult = () => {
    //clear the search result
    setTemplateList(props.selectedCategoryDetails.Templates);
  };

  const sortSelection = (selection) => {
    // sort alphabetically
    if (selection === t("alphabeticalOrder")) {
      let localArr = [...templateList];
      localArr.sort((a, b) => {
        return a.Name.toLowerCase() < b.Name.toLowerCase() ? -1 : 1;
      });
      setTemplateList(localArr);
    }
    //sort on basis of latest creation date and time
    else if (selection === t("recentlyCreated")) {
      let localArr = [...templateList];
      localArr.sort((a, b) => {
        return new Date(b.CreatedDate) - new Date(a.CreatedDate) === 0
          ? b.CreatedTime.localeCompare(a.CreatedTime)
          : new Date(b.CreatedDate) - new Date(a.CreatedDate);
      });
      setTemplateList(localArr);
    }
    //sort on basis of most used template
    else if (selection === t("mostUsed")) {
      let localArr = [...templateList];
      localArr.sort((a, b) => {
        return b.UsageCount - a.UsageCount;
      });
      setTemplateList(localArr);
    }
  };

  return (
    <div
      className={styles.categoryTemplatesList}
      style={{
        height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 6rem)`,
        overflowY: "auto",
      }}
    >
      {props.selectedCategoryDetails?.Templates?.length > 0 ? (
        <React.Fragment>
          <div className={styles.templateFilterArea}>
            <Grid container spacing={1} justifyContent="space-between" xs={12}>
              <Grid item>
                <div className={styles.searchDiv}>
                  <Grid
                    container
                    spacing={{ xs: 0.5, sm: 0.5, md: 3 }}
                    justifyContent="space-between"
                  >
                    <Grid item xs={6} sm={6}>
                      <div
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.searchBox
                            : styles.searchBox
                        }
                      >
                        <SearchBox
                          // width="16vw"
                          title={"CategoryTemplateList"}
                          onSearchChange={onSearchSubmit}
                          clearSearchResult={clearResult}
                          name="search"
                          placeholder={t("search")}
                        />
                      </div>
                    </Grid>
                    <Grid item xs={2}>
                      <SortButton
                        backDrop={true}
                        buttonToOpenModal={
                          <div className="filterButton1">
                            <img
                              src={FilterImage}
                              style={{ width: "100%" }}
                              alt={t("sortBy")}
                            />
                          </div>
                        }
                        getActionName={sortSelection}
                        showTickIcon={true}
                        sortBy={t("sortBy")}
                        /**code changes for bug 123660 */

                        sortSectionOne={[
                          t("alphabeticalOrder"),
                          t("recentlyCreated"),
                          // t("mostUsed"),
                        ]}
                        modalPaper={styles.categoryFilterBtn}
                        isArabic={direction === RTL_DIRECTION}
                      />
                    </Grid>
                  </Grid>
                </div>
              </Grid>
              <Grid item>
                <div className="flex">
                  <button
                    onClick={() => setView(TEMPLATE_LIST_VIEW)}
                    className={
                      view === TEMPLATE_LIST_VIEW
                        ? styles.selectedListViewBtn
                        : styles.listViewBtn
                    }
                    title={t("listView")}
                    id="pmweb_template_CategoryList"
                  >
                    <MenuIcon
                      fontSize="small"
                      style={{
                        color:
                          view === TEMPLATE_LIST_VIEW
                            ? "var(--button_color)"
                            : "#C4C4C4",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                  </button>
                  <button
                    onClick={() => setView(TEMPLATE_GRID_VIEW)}
                    id="pmweb_template_CategoryGrid"
                    className={
                      view === TEMPLATE_GRID_VIEW
                        ? styles.selectedListViewBtn
                        : styles.listViewBtn
                    }
                    title={t("tileView")}
                  >
                    <AppsIcon
                      fontSize="small"
                      style={{
                        color:
                          view === TEMPLATE_GRID_VIEW
                            ? "var(--button_color)"
                            : "#C4C4C4",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                  </button>
                </div>
              </Grid>
            </Grid>
          </div>
          <div
            className={styles.templateListTable}
            style={{
              height: "92%",
              overflow: "auto",
              // width:window.innerWidth < 750 ? "63.6vw":"75vw" }} //Changes made to solve Bug 135522 and Bug 135978
              width: window.innerWidth < 850 ? "63.9vw" : "74.25vw", //modified on 29-9-2023 for bug_id: 137970
            }}
          >
            {view === TEMPLATE_LIST_VIEW ? (
              <TemplateListView
                createProcessFunc={() => {
                  setShowTemplateModal(true);
                  props.setTemplateDetails(
                    null,
                    null,
                    false,
                    null,
                    null,
                    false,
                    "",
                    []
                  );
                  props.setSelectedProject(null, null);
                  props.CreateProcessClickFlag(
                    CREATE_PROCESS_FLAG_FROM_TEMPLATES
                  );
                }}
                setSelectedTemplate={setSelectedTemplate}
                templateList={templateList}
                category={props.selectedCategoryDetails}
                setActedTemplate={setActedTemplate}
                setAction={setAction}
              />
            ) : (
              <TemplateGridView
                createProcessFunc={() => {
                  setShowTemplateModal(true);
                  props.setTemplateDetails(
                    null,
                    null,
                    false,
                    null,
                    null,
                    false,
                    "",
                    []
                  );
                  props.setSelectedProject(null, null);
                  props.CreateProcessClickFlag(
                    CREATE_PROCESS_FLAG_FROM_TEMPLATES
                  );
                }}
                setSelectedTemplate={setSelectedTemplate}
                templateList={templateList}
                category={props.selectedCategoryDetails}
                setActedTemplate={setActedTemplate}
                setAction={setAction}
              />
            )}
          </div>
        </React.Fragment>
      ) : (
        <NoTemplateScreen />
      )}
      {showTemplateModal ? (
        <Modal
          show={showTemplateModal}
          style={{
            width: "100vw",
            height: `calc(100% - ${APP_HEADER_HEIGHT})`,
            left: "0",
            top: `${APP_HEADER_HEIGHT}`,
            padding: "0",
            border: "0",
          }}
          hideBackdrop={true}
          modalClosed={() => {
            setShowTemplateModal(false);
            props.CreateProcessClickFlag(NO_CREATE_PROCESS_FLAG);
          }}
          children={
            <ProcessCreation
              moveBackFunction={() => {
                setShowTemplateModal(false);
                props.CreateProcessClickFlag(NO_CREATE_PROCESS_FLAG);
              }}
              selectedTemplate={selectedTemplate}
              backBtnLabel="backToTemplatesPage"
              templatePage={PREVIOUS_PAGE_CREATE_FROM_TEMPLATE}
              category={props.selectedCategoryDetails}
              view={view}
            />
          }
        />
      ) : null}
      {action === t("delete") ? (
        <Modal
          show={action === t("delete")}
          style={{
            // width: "30vw",
            //height: "11.5rem",
            // left: "37%",
            top: "25%",
            padding: "0",
          }}
          modalClosed={() => setAction(null)}
          children={
            <DeleteModal
              categoryList={props.categoryList}
              setCategoryList={props.setCategoryList}
              setModalClosed={() => setAction(null)}
              category={false}
              elemToBeDeleted={actedTemplate}
              parentElem={props.selectedCategoryDetails}
              //test="mahtab"
            />
          }
        />
      ) : null}

      {action === t("Rename")
        ? {
            /*  <Modal
          show={action === t("Rename")}
          style={{
            width: "30vw",
            height: "11.5rem",
            left: "37%",
            top: "25%",
            padding: "0",
          }}
          modalClosed={() => setAction(null)}
          children={
            <RenameTemplate
            actedTemplate={actedTemplate}
            setModalClosed={() => setAction(null)}
            catList={props.selectedCategoryDetails}
             />
          }
        /> */
          }
        : null}

      {action === t("Edit")
        ? {
            /*  <Modal
          show={action === t("Edit")}
          style={{
            width: "30vw",
            height: "11.5rem",
            left: "37%",
            top: "25%",
            padding: "0",
          }}
          modalClosed={() => setAction(null)}
          children={
           
             <EditTemplate
              actedTemplate={actedTemplate}
            setModalClosed={() => setAction(null)}
            catList={props.selectedCategoryDetails}
              />
          }
        /> */
          }
        : null}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSelectedProject: (id, name) => {
      dispatch(actionCreators.selectedProject(id, name));
    },
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
    templateView: state.templateReducer.template_view,
    getTemplatePage: state.templateReducer.template_page,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CategoryTemplatesList);
