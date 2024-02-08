// Changes made to solve Bug 116651 - Process Task: add variable button is not working and
// Bug 116650 - Process Task: cancel button is not working or it should not be available if not required
import React, { useState, useEffect } from "react";
import CommonTabHeader from "../commonHeader";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import {
  Select,
  MenuItem,
  Tooltip,
  Grid,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  propertiesLabel,
  VARDOC_LIST,
  SERVER_URL,
  RTL_DIRECTION,
  headerHeight,
} from "../../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import Modal from "../../../../../UI/Modal/Modal";
import deleteImage from "../../../../../assets/icons/Delete.svg";
import DocumentListReverse from "../MappingLists/docListReverse";
import "./index.css";
import TabsHeading from "../../../../../UI/TabsHeading";
import { LatestVersionOfProcess } from "../../../../../utility/abstarctView/checkLatestVersion";
import { useTranslation } from "react-i18next";
import { LightTooltip } from "../../../../../UI/StyledTooltip";

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    alignItems: "center",
  },
  select: {
    "&$select": {
      paddingRight: (props) =>
        props.direction === RTL_DIRECTION ? "14px" : "1.75vw",
      paddingLeft: (props) =>
        props.direction === RTL_DIRECTION ? "1.75vw" : "14px",
    },
    "&::before": {
      display: "none",
    },
    "&::after": {
      display: "none",
    },
  },
  icon: {
    left: (props) => (props.direction === RTL_DIRECTION ? "0px" : "unset"),
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "0px"),
  },
}));

function ReverseForVariables(props) {
  // Process Data
  const { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ direction });
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  // Activity Data
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  // States for this File
  const [reverseDocsList, setReverseDocsList] = useState([]);
  const dispatch = useDispatch();
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [externalVariablesList, setExternalVariablesList] = useState([]);
    // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  useEffect(() => {
    setReverseDocsList(
      localLoadedActivityPropertyData?.m_objPMSubProcess?.revDocMapping
    );
  }, [localLoadedActivityPropertyData]);

  useEffect(() => {
    let jsonBody = {
      // processDefId: localStorage.getItem("selectedTargetProcessID"),
      processDefId:
        localLoadedActivityPropertyData?.m_objPMSubProcess
          ?.importedProcessDefId,
      extTableDataFlag: "Y",
      docReq: "Y",
      omniService: "Y",
    };

    axios.post(SERVER_URL + VARDOC_LIST, jsonBody).then((res) => {
      if (res?.data?.Status === 0) {
        setExternalVariablesList(res.data.DocDefinition);
      }
    });
  }, []);

  const handleMappingChange = (el, event) => {
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskOptions]: {
          isModified: true,
          hasError: false,
        },
      })
    );
    let temp = { ...localLoadedActivityPropertyData };
    temp?.m_objPMSubProcess?.revDocMapping.map((ep) => {
      if (ep.importedFieldName === el.importedFieldName) {
        ep.mappedFieldName = event.target.value;
      }
    });
    setlocalLoadedActivityPropertyData(temp);
  };

  const deleteVariablesFromList = (element) => {
    let tempVariablesList = reverseDocsList;
    let tempVariablesList_Filtered = tempVariablesList?.filter((variable) => {
      return variable.importedFieldName === element.importedFieldName;
    });
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdVarMappingProcessTask]: {
          isModified: true,
          hasError: false,
        },
      })
    );
    setReverseDocsList(tempVariablesList_Filtered);
    // Deleting Document from getActivityAPI Call
    let tempLocalState = { ...localLoadedActivityPropertyData };
    let reverseIncomingDocsList =
      localLoadedActivityPropertyData.m_objPMSubProcess.revDocMapping;
    reverseIncomingDocsList &&
      reverseIncomingDocsList.map((document, index) => {
        if (document.importedFieldName === element.importedFieldName) {
          reverseIncomingDocsList.splice(index, 1);
        }
      });
    tempLocalState.m_objPMSubProcess.revDocMapping = [
      ...reverseIncomingDocsList,
    ];
    setlocalLoadedActivityPropertyData(tempLocalState);
  };

  const oneLineForMap = () => {
    return reverseDocsList?.map((el, index) => {
      return (
        <>
          <div
            id="processTaskId1"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5vh 0.5vw ",
              width: props.isDrawerExpanded ? "100%" : "100%",
            }}
          >
            {/* <div
              style={{
                flex: "1",
                height: "36px",
                backgroundColor: "#F4F4F4",
                borderRadius: "1px",
                opacity: "1",
                fontSize: "12px",
                padding: "5px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <Tooltip title={el.importedFieldName}>
                <span style={{ padding: "5px" }}>{el.importedFieldName}</span>
              </Tooltip>
            </div>
            <p style={{ marginTop: "5px", flex: "0.2", textAlign: "center" }}>
              =
            </p>
            <div
              style={{
                flex: "1",
                overflow: "hidden",
              }}
            >
              <Select
                id={`pmweb_ReverseMDocs_MappedField_${index}`}
                inputProps={{ "aria-label": "Without label" }}
                value={el.mappedFieldName}
                style={{
                  width: "100%",
                  height: "34px",
                  border: "1px solid #CECECE",
                  borderRadius: "1px",
                  opacity: "1",
                }}
                onChange={(e) => handleMappingChange(el, e)}
                className="selectDateTime_options"
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                  PaperProps: {
                    style: {
                      maxHeight: props.maxHeight ? props.maxHeight : "15rem",
                    },
                  },
                }}
              >
                {externalVariablesList?.map((document) => {
                  return (
                    <MenuItem value={document.DocName}>
                      <em
                        style={{
                          fontSize: "12px",
                          fontStyle: "normal",
                          paddingLeft: "5px",
                        }}
                      >
                        {document.DocName}
                      </em>
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
            <div style={{ marginTop: "9px", flex: "0.2", textAlign: "center" }}> */}
            {/* <DeleteIcon
                className="deleteIconProcessTask"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => deleteVariablesFromList(el)}
              /> */}
            {/* <img
                id={`pmweb_ReverseMDocs_DeleteVarFromList_${index}`}
                src={deleteImage}
                style={{ height: "200px", width: "12px", height: "12px" }}
                onClick={() => deleteVariablesFromList(el)}
                alt={t("DELETE")}
              /> */}
            {/* </div> */}
            <Grid
              item
              xs={5}
              className={classes.flex}
              style={{
                backgroundColor: "#F4F4F4",
              }}
            >
              <div
                style={{
                  padding:
                    direction === RTL_DIRECTION
                      ? "0px 14px 0px 0px"
                      : "0px 0px 0px 14px",
                }}
              >
                <Tooltip title={el.importedFieldName}>
                  <span>{el.importedFieldName}</span>
                </Tooltip>
              </div>
            </Grid>
            <Grid item xs={1} className={classes.flex} justifyContent="center">
              <div
                style={{
                  textAlign: "center",
                }}
              >
                <span>=</span>
              </div>
            </Grid>
            <Grid item xs={5}>
              <Select
                id={`pmweb_ReverseMDocs_MappedField_${index}`}
                classes={{ icon: classes.icon, select: classes.select }}
                inputProps={{ "aria-label": "Without label" }}
                value={el.mappedFieldName}
                style={{
                  width: "100%",
                  height: "34px",
                  border: "1px solid #CECECE",
                  borderRadius: "1px",
                  opacity: "1",
                }}
                onChange={(e) => handleMappingChange(el, e)}
                className="selectDateTime_options"
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                  PaperProps: {
                    style: {
                      maxHeight: props.maxHeight ? props.maxHeight : "15rem",
                    },
                  },
                }}
              >
                {externalVariablesList?.map((document) => {
                  return (
                    <MenuItem value={document.DocName}>
                      <em
                        style={{
                          fontSize: "12px",
                          fontStyle: "normal",
                        }}
                      >
                        {document.DocName}
                      </em>
                    </MenuItem>
                  );
                })}
              </Select>
            </Grid>
            <Grid
              item
              xs={1}
              className={classes.flex}
              justifyContent="flex-start"
            >
              <LightTooltip
                id={`pmweb_ReverseMDocs_DeleteTooltip_${index}`}
                arrow={true}
                placement="bottom-start"
                title={t("delete")}
              >
                <img
                  id={`pmweb_ReverseMDocs_DeleteVarFromList_${index}`}
                  src={deleteImage}
                  //style={{ height: "200px", width: "12px", height: "12px" }}
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    margin:
                      direction === RTL_DIRECTION
                        ? "0px 5px 0px 0px"
                        : "0px 0px 0px 5px",
                    cursor: "pointer",
                  }}
                  onClick={() => deleteVariablesFromList(el)}
                  alt={t("DELETE")}
                />
              </LightTooltip>
            </Grid>
          </div>
        </>
      );
    });
  };

  return (
    <div>
      <TabsHeading heading={props?.heading} />
      <div
        className="forwardMVarDiv"
        style={{
          // height: `calc(${windowInnerHeight}px - ${headerHeight} - 10.5rem)`,
          height:
            window.innerWidth < 1200
              ? `calc(${windowInnerHeight}px - ${headerHeight} - 11.5rem)`
              : "59vh",
          padding: props.isDrawerExpanded ? "8px 0.5vw" : "0", //Changes made to solve Bug 135428
        }}
      >
        {props.isDrawerExpanded && (
          <div
            style={{
              flex: "1.5",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
              backgroundColor: "white",
            }}
          >
            <DocumentListReverse
              selectedVariableList={reverseDocsList}
              setSelectedVariableList={setReverseDocsList}
              setShowVariablesModal={setShowVariablesModal}
              isReadOnly={isReadOnly}
            />
          </div>
        )}
        <div
          style={{
            flex: "4",
            background: "white",
            overflowY: props.isDrawerExpanded ? "scroll" : "",
            paddingLeft: "0.58vw",
          }}
        >
          <CommonTabHeader
            tabType="ReverseForDocuments"
            setShowVariablesModal={setShowVariablesModal}
            isDrawerExpanded={props.isDrawerExpanded}
            isReadOnly={isReadOnly}
            hideTargetCurrentHeader={reverseDocsList?.length === 0}
          />
          {reverseDocsList?.length > 0 ? (
            <div
              className="mapList"
              // style={{ height: "275px", overflowY: "scroll" }}
              //Bug 123925 - safari>> process task>> too much unnecessary white spacing on mapping variable screen
              //[25-03-2023] updated the height from 275px to 50vh
              style={{
                height: "50vh",
                // overflowY: "scroll", //Changes made to solve Bug 135141
                scrollbarColor: "#dadada #fafafa",
                scrollbarWidth: "thin",
              }}
            >
              {oneLineForMap()}
            </div>
          ) : (
            // <p
            //   className={
            //     props.isDrawerExpanded
            //       ? direction === RTL_DIRECTION
            //         ? "noMappingPresentTaskArabic"
            //         : "noMappingPresentTask"
            //       : "noMappingPresent_expandedTask"
            //   }
            // >
            //   {t("addDocsMessage")}
            // </p>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
            >
              <Grid item style={{ paddingTop: "20vh" }}>
                <Typography>{t("addDocsMessage")}</Typography>
              </Grid>
            </Grid>
          )}
        </div>
        {showVariablesModal && !props.isDrawerExpanded ? (
          <Modal
            show={showVariablesModal}
            backDropStyle={{ backgroundColor: "transparent" }}
            style={{
              top: "0%",
              // left: direction === RTL_DIRECTION ? "100%" : "-85%",
              // modified on 17/10/2023 for bug_id: 138128
              left: direction == RTL_DIRECTION ? "100%" : "unset",
              right: direction === RTL_DIRECTION ? "unset" : "100%",
              position: "absolute",
              width: "25.35vw",
              zIndex: "1500",
              boxShadow: "0px 3px 6px #00000029",
              border: "0",
              borderLeft: "1px solid #D6D6D6",
              borderRadius: "2px",
              padding: "0",
              height: `calc(${windowInnerHeight}px - ${headerHeight})`,
            }}
            modalClosed={() => setShowVariablesModal(false)}
            children={
              <DocumentListReverse
                selectedVariableList={reverseDocsList}
                setSelectedVariableList={setReverseDocsList}
                setShowVariablesModal={setShowVariablesModal}
                isReadOnly={isReadOnly}
              />
            }
          ></Modal>
        ) : null}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(ReverseForVariables);
