import React, { useState, useEffect } from "react";
import "./CreateProcessbyTemplate.css";
import { useTranslation } from "react-i18next";
import {
  Button,
  Grid,
  IconButton,
  Tab,
  Tabs,
  makeStyles,
} from "@material-ui/core";
import { TabPanel, useStylesCustom } from "../../ProcessSettings";
import SliderCarousel from "../../../UI/Carousel/index";
import "./CreateProcessByTemplateArabic.css";
import * as actionCreators from "../../../redux-store/actions/processView/actions";
import * as actionCreators_template from "../../../redux-store/actions/Template";
import { connect } from "react-redux";
import Modal from "../../../UI/Modal/Modal";
import ProcessCreation from "../../../UI/ProcessCreation";
import SingleTemplateCard from "../../../UI/SingleTemplateCard";
import { v4 as uuidv4 } from "uuid";
import {
  APP_HEADER_HEIGHT,
  ENDPOINT_FETCH_ALL_TEMPLATES,
  RTL_DIRECTION,
  SERVER_URL,
  PREVIOUS_PAGE_CREATE_FROM_PROCESS,
  PREVIOUS_PAGE_CREATE_FROM_PROCESSES,
  NO_CREATE_PROCESS_FLAG,
  CREATE_PROCESS_FLAG_FROM_PROCESSES,
  CREATE_PROCESS_FLAG_FROM_PROCESS,
  BTN_HIDE,
  BTN_SHOW,
} from "../../../Constants/appConstants";
import axios from "axios";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

const useStyles = makeStyles((theme) => ({
  backIconContainer: {
    cursor: "pointer",
    margin: (props) =>
      props.direction === RTL_DIRECTION
        ? "0 5px 0 0 !important"
        : "0 0 0 5px !important",
  },
  backIcon: {
    width: "1.25rem",
    height: "1.25rem",
  },
}));

function CreateProcessByTemplate(props) {
  let { t } = useTranslation();
  const [value, setValue] = useState(0);
  const [modalClicked, setModalClicked] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const classes = useStylesCustom();
  const styles = useStyles();

  useEffect(() => {
    // code commented on 12 Sep 2022 for BugId 115566
    // if (
    //   props.getTemplatePage === PREVIOUS_PAGE_CREATE_FROM_PROCESS ||
    //   props.getTemplatePage === PREVIOUS_PAGE_CREATE_FROM_PROCESSES
    // ) {
    //   setModalClicked(true);
    // }
    axios.get(SERVER_URL + ENDPOINT_FETCH_ALL_TEMPLATES).then((res) => {
      if (res.data.Status === 0) {
        setCategoryList(res.data.Category);
      }
    });
  }, []);

  const cancelHandler = () => {
    props.CreateProcessClickFlag(NO_CREATE_PROCESS_FLAG);
  };

  const createHandler = () => {
    props.setTemplateDetails(null, null, false, null, null, false, "", []);
    setSelectedTemplate(null);
    setModalClicked(true);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const viewallTemp = (index) => {
    setValue(index + 1);
  };

  const direction = `${t("HTML_DIR")}`;

  // Function used for tabs.
  function tabProps(index) {
    return {
      id: `pmweb_vertical-tab-${uuidv4()}`,
      "aria-controls": `pmweb_vertical-tabpanel-${uuidv4()}`,
    };
  }

  return (
    <React.Fragment>
      <div style={{ direction: direction }}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          style={{ flexWrap: "nowrap", padding: "0.5rem 0" }}
        >
          <Grid container alignItems="center">
            {props?.showBackBtn && (
              <IconButton
                id="pmweb_backBtn_pmWebTemplateBack"
                onClick={props?.moveBackFunction}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && props.moveBackFunction(e)
                }
                className={styles.backIconContainer}
                disableFocusRipple
                disableTouchRipple
                disableRipple
              >
                {direction === RTL_DIRECTION ? (
                  <ArrowForwardIosIcon className={styles.backIcon} />
                ) : (
                  <ArrowBackIosIcon className={styles.backIcon} />
                )}
              </IconButton>
            )}
            <p
              className={
                direction === RTL_DIRECTION
                  ? "selectPrcocessTempHeadingArabic"
                  : "selectPrcocessTempHeading"
              }
              style={{ direction: direction }}
            >
              {t("chooseTemplate")}
            </p>
          </Grid>
          {props?.showCreateProcessByAI && (
            <Grid item container justifyContent="flex-end">
              <Button
                className="regenerateBtnCreate"
                onClick={props?.moveBackFunction}
              >
                <div
                  className="regenerateTextDivCreate"
                  style={{
                    width: `calc(100% - 4px)`,
                    height: `calc(100% - 4px)`,
                  }}
                >
                  <div className="regenerateTextCreate">
                    {t("createUsingNewgenAI")}
                  </div>
                </div>
              </Button>
            </Grid>
          )}
        </Grid>

        <hr className="hrCreateProcessTemplate" />

        <div className="row">
          <div className="ProcessCreationLeftPannel">
            <Tabs
              orientation="vertical"
              variant="scrollable"
              style={{ maxHeight: "100vh" }}
              value={value}
              onChange={handleChange}
              id="pmweb_leftPannel_processCreationByTemplate"
            >
              <Tab
                classes={{
                  selected: classes.selectedTab,
                }}
                className={
                  direction === RTL_DIRECTION ? "categoryTabrtl" : "categoryTab"
                }
                label={t("All")}
                {...tabProps(0)}
                tabIndex={0}
              />
              {categoryList?.map((category, index) => {
                return (
                  <Tab
                    classes={{
                      selected: classes.selectedTab,
                    }}
                    className={
                      direction === RTL_DIRECTION
                        ? "categoryTabrtl"
                        : "categoryTab"
                    }
                    label={category.CategoryName}
                    {...tabProps(index + 1)}
                    tabIndex={0}
                  />
                );
              })}
            </Tabs>
          </div>
          <div
            className={
              direction === RTL_DIRECTION
                ? "ProcessCreationRightPannelArabic"
                : "ProcessCreationRightPannel"
            }
          >
            {
              //code added on 25 Nov 2022 for BugId 110874
            }
            <TabPanel
              value={value}
              index={0}
              style={{
                height: "78vh",
                overflowY: "scroll",
                scrollbarColor: "#dadada #fafafa",
                scrollbarWidth: "thin",
              }}
            >
              {categoryList?.map((category, i) => {
                return (
                  <div>
                    <div className="row">
                      <p className="allCatName">{category.CategoryName}</p>

                      {category.Templates?.length > 2 ? (
                        <p
                          className={
                            direction === RTL_DIRECTION
                              ? "viewAllTempArabic"
                              : "viewAllTemp"
                          }
                          onClick={() => viewallTemp(i)}
                          id="pmweb_viewAllBtn_processCreationByTemp"
                          tabIndex={0}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              viewallTemp(i);
                              e.stopPropagation();
                            }
                          }}
                        >
                          {t("viewall")}
                        </p>
                      ) : null}
                    </div>
                    <SliderCarousel
                      data={category.Templates?.map((template) => {
                        return template;
                      })}
                      tabIndex={0}
                      containerWidth={
                        props.containerWidth ? props.containerWidth : "84vw"
                      }
                      cardWidth={props.cardWidth ? props.cardWidth : "40vw"}
                      cardActivityMaxWidth={
                        props.cardActivityMaxWidth
                          ? props.cardActivityMaxWidth
                          : "10vw"
                      }
                      bSelectBtn={props.bSelectBtn}
                      bSelectTemplateBtn={props.bSelectTemplateBtn}
                      bPreviewBtn={props.bPreviewBtn}
                      selectFunction={props.selectFunction}
                      selectedTemplate={props.selectedTemplate}
                      templatePage={
                        props.CreateProcessFlag ===
                        CREATE_PROCESS_FLAG_FROM_PROCESSES
                          ? PREVIOUS_PAGE_CREATE_FROM_PROCESSES
                          : props.CreateProcessFlag ===
                            CREATE_PROCESS_FLAG_FROM_PROCESS
                          ? PREVIOUS_PAGE_CREATE_FROM_PROCESS
                          : null
                      }
                      previewFunc={() => {
                        props.setTemplatePage(props.templatePage);
                      }}
                      modalClicked={modalClicked}
                      setModalClicked={setModalClicked}
                      selectTemplateFunc={(template) => {
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
                        setSelectedTemplate(template);
                        setModalClicked(true);
                      }}
                    />
                  </div>
                );
              })}
            </TabPanel>

            {categoryList?.map((category, index) => {
              return (
                <TabPanel value={value} index={index + 1}>
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? "allCatNameArabic"
                        : "allCatName"
                    }
                  >
                    {category.CategoryName}
                  </p>
                  {category.Templates?.map((template) => {
                    return (
                      <SingleTemplateCard
                        item={template}
                        cardWidth={props.cardWidth ? props.cardWidth : "40vw"}
                        cardActivityMaxWidth={
                          props.cardActivityMaxWidth
                            ? props.cardActivityMaxWidth
                            : "10vw"
                        }
                        style={{
                          boxShadow: "none",
                        }}
                        templateComboStyle={{
                          minWidth: "13vw",
                        }}
                        disableSelect={
                          props.selectedTemplate
                            ? props.selectedTemplate.Id === template.Id
                            : false
                        }
                        previewFunc={() => {
                          props.setTemplatePage(props.templatePage);
                        }}
                        templateName={template.Name}
                        templateId={template.Id}
                        selectTemplate={() => {
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
                          setSelectedTemplate(template);
                          setModalClicked(true);
                        }}
                        selectFunction={() => {
                          if (props.selectFunction) {
                            props.selectFunction(template);
                          }
                        }}
                        bSelectBtn={
                          props.bSelectBtn && props.bSelectBtn === BTN_SHOW
                            ? true
                            : false
                        }
                        bSelectTemplateBtn={
                          props.bSelectTemplateBtn &&
                          props.bSelectTemplateBtn === BTN_HIDE
                            ? false
                            : true
                        }
                        bPreviewBtn={
                          props.bPreviewBtn && props.bPreviewBtn === BTN_HIDE
                            ? false
                            : true
                        }
                      />
                    );
                  })}
                </TabPanel>
              );
            })}
          </div>
        </div>

        <div
          className={
            direction === RTL_DIRECTION
              ? "processCreationFooterArabic"
              : "processCreationFooter"
          }
        >
          {props.bCancel ? (
            <button
              className="processCreationCancel"
              onClick={
                props.cancelFunction ? props.cancelFunction : cancelHandler
              }
              id="pmweb_cancelBtn_processCreationByTemp"
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  if (!props.cancelFunction) {
                    cancelHandler();
                    e.stopPropagation();
                  }
                }
              }}
            >
              {t("cancel")}
            </button>
          ) : null}
          {props.bCreateFromScratchBtn ? (
            <button
              className="processCreationCreate"
              onClick={createHandler}
              id="pmweb_createBtn_processCreationByTemp"
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  createHandler();
                  e.stopPropagation();
                }
              }}
            >
              {t("createFromScratch")}
            </button>
          ) : null}
        </div>
      </div>

      {modalClicked ? (
        <Modal
          show={modalClicked}
          style={{
            width: "100vw",
            height: `calc(100% - ${APP_HEADER_HEIGHT})`,
            left: "0",
            top: APP_HEADER_HEIGHT,
            padding: "0",
            border: "0",
          }}
          hideBackdrop={true}
          modalClosed={() => setModalClicked(false)}
          children={
            <ProcessCreation
              moveBackFunction={() => setModalClicked(false)}
              selectedTemplate={selectedTemplate}
              backBtnLabel="backToTemplateSelection"
              templatePage={
                props.CreateProcessFlag === CREATE_PROCESS_FLAG_FROM_PROCESSES
                  ? PREVIOUS_PAGE_CREATE_FROM_PROCESSES
                  : props.CreateProcessFlag === CREATE_PROCESS_FLAG_FROM_PROCESS
                  ? PREVIOUS_PAGE_CREATE_FROM_PROCESS
                  : null
              }
              createProcessFlag={
                props.CreateProcessFlag ===
                  CREATE_PROCESS_FLAG_FROM_PROCESSES ||
                props.CreateProcessFlag === CREATE_PROCESS_FLAG_FROM_PROCESS
              }
            />
          }
        />
      ) : null}
    </React.Fragment>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    CreateProcessClickFlag: (flag) =>
      dispatch(actionCreators.createProcessFlag(flag)),
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
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
  };
};

const mapStateToProps = (state) => {
  return {
    getTemplatePage: state.templateReducer.template_page,
    CreateProcessFlag: state.createProcessFlag.clickedCreateProcess,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProcessByTemplate);
