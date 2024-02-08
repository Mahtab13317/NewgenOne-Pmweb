import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./JmsConsumer.module.css";
import {
  MenuItem,
  Checkbox,
  Grid,
  FormGroup,
  FormControlLabel,
} from "@material-ui/core";
import { connect, useDispatch } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction.js";
import StarRateIcon from "@material-ui/icons/StarRate";
import Modal from "../../../../UI/Modal/Modal";
import { store, useGlobalState } from "state-pool";
import XmlModal from "./XmlModal";
import clsx from "clsx";
import TabsHeading from "../../../../UI/TabsHeading";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import {
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

function JmsConsumer(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const globalActivityData = store.getState("activityPropertyData");
  const [localActivityPropertyData, setLocalActivityPropertyData] =
    useGlobalState(globalActivityData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [modalClicked, setModalClicked] = useState(false);
  const [destinationName, setDestinationName] = useState("");
  const [processVariableDropdown, setProcessVariableDropdown] = useState([]);
  const [masterCheckUpdate, setmasterCheckUpdate] = useState(false);
  const [masterCheckSearch, setmasterCheckSearch] = useState(false);
  const [jmsConsumerData, setJmsConsumerData] = useState({});
  const [messageDataCheckbox, setMessageDataCheckbox] = useState(false); // State that stores the value of message data checkbox.
  const messageRef = useRef();
  const searchRef = useRef();
  const updateRef = useRef();
  const VarmessageRef = useRef([]);
  const VarSearchRef = useRef([]);
  const VarUpdateRef = useRef([]);
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo || // modified on 05/09/2023 for BugId 136103
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ); //code updated on 26 September 2022 for BugId 115467

  // Function that runs when the component loads.
  useEffect(() => {
    setDestinationName(
      localActivityPropertyData?.ActivityProperty?.consumerInfo?.destinationName?.trim()
    );
  }, []);

  // Function that runs when the variables data changes.
  useEffect(() => {
    setProcessVariableDropdown(
      localLoadedProcessData?.Variable?.filter(
        (element) =>
          element.VariableScope === "M" ||
          element.VariableScope === "I" ||
          element.VariableScope === "U"
      )
    );
  }, [localLoadedProcessData?.Variable]);

  // Function that runs when the localActivityPropertyData.ActivityProperty data changes.
  useEffect(() => {
    if (localActivityPropertyData) {
      setJmsConsumerData({
        ImportedXMLData:
          localActivityPropertyData?.ActivityProperty?.consumerInfo
            ?.messageDataList,
      });
    }
  }, [localActivityPropertyData?.ActivityProperty]);

  const masterMessageDataHandler = () => {
    setMessageDataCheckbox((prevState) => {
      return !prevState;
    });
    let [temp] = [jmsConsumerData.ImportedXMLData];
    temp?.forEach((element) => {
      element.m_bEnabledata = !messageDataCheckbox;
      if (messageDataCheckbox) {
        element.selectedProcessVariable = "";
        element.varFieldId = "0";
        element.variableId = "0";
        element.m_bsearch = false;
        element.m_bupdate = false;
        setmasterCheckSearch(false);
        setmasterCheckUpdate(false);
      }
    });
    setJmsConsumerData({ ImportedXMLData: temp });
    setGlobalData("allData", temp);
  };

  // Function to set global data when the user does any action.
  const setGlobalData = (key, value, ind) => {
    let temp = JSON.parse(JSON.stringify(localActivityPropertyData));
    if (key === "destinationName") {
      temp.ActivityProperty.consumerInfo.destinationName = value;
    } else if (key === "allData") {
      temp.ActivityProperty.consumerInfo.messageDataList = value;
    } else {
      temp.ActivityProperty.consumerInfo.messageDataList[ind][key] = value;
    }
    setLocalActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.jmsConsumer]: { isModified: true, hasError: false },
      })
    );
  };

  const importXmlHandler = () => {
    setModalClicked(true);
  };

  const importXmlHandlerCollapse = () => {
    props.expandDrawer(!props.isDrawerExpanded);
    setModalClicked(true);
  };

  const messageCollapseHandler = () => {
    props.expandDrawer(!props.isDrawerExpanded);
  };

  const responseXmlData = (data) => {
    setJmsConsumerData((prev) => {
      let temp = [];
      data?.forEach((el) => {
        temp.push(el);
      });

      return { ImportedXMLData: temp };
    });
  };

  const onSelectName = (event, index) => {
    let variableIdSelected;
    let varFieldIdSelected;
    const { value } = event.target;

    processVariableDropdown?.forEach((element) => {
      if (element.VariableName === value) {
        varFieldIdSelected = element.VarFieldId;
        variableIdSelected = element.VariableId;
      }
    });

    setJmsConsumerData((prev) => {
      let temp = [...prev.ImportedXMLData];
      temp[index].selectedProcessVariable = value;
      temp[index].varFieldId = varFieldIdSelected;
      temp[index].variableId = variableIdSelected;
      setGlobalData("allData", temp);
      return { ...prev, ImportedXMLData: temp };
    });
  };

  const enableDataFlagHandler = (enableFlag, ind) => {
    setJmsConsumerData((prev) => {
      let temp = [...prev.ImportedXMLData];
      temp[ind].m_bEnabledata = !enableFlag;
      if (enableFlag) {
        temp[ind].selectedProcessVariable = "";
        temp[ind].varFieldId = "0";
        temp[ind].variableId = "0";
      }
      setGlobalData("allData", temp);
      return { ...prev, ImportedXMLData: temp };
    });
  };

  const nameHandler = (event) => {
    setDestinationName(event.target.value);
    setGlobalData("destinationName", event.target.value);
  };

  const searchHandler = (searchCheck, index) => {
    setJmsConsumerData((prev) => {
      let temp = [...prev.ImportedXMLData];
      temp[index].m_bsearch = !searchCheck;
      setGlobalData("allData", temp);
      return { ...prev, ImportedXMLData: temp };
    });
  };

  const updateHandler = (updateCheck, index) => {
    setJmsConsumerData((prev) => {
      let temp = [...prev.ImportedXMLData];
      temp[index].m_bupdate = !updateCheck;
      setGlobalData("allData", temp);
      return { ...prev, ImportedXMLData: temp };
    });
  };

  // Function that runs when the component loads.
  useEffect(() => {
    let searchArray = [],
      updateArray = [],
      enableDataArray = [];
    jmsConsumerData?.ImportedXMLData?.forEach((element) => {
      searchArray.push(element.m_bsearch);
      updateArray.push(element.m_bupdate);
      enableDataArray.push(element.m_bEnabledata);
    });
    if (searchArray.includes(false)) {
      setmasterCheckSearch(false);
    } else {
      setmasterCheckSearch(true);
    }
    if (updateArray.includes(false)) {
      setmasterCheckUpdate(false);
    } else {
      setmasterCheckUpdate(true);
    }
    if (enableDataArray.includes(false)) {
      setMessageDataCheckbox(false);
    } else {
      setMessageDataCheckbox(true);
    }
  }, [jmsConsumerData?.ImportedXMLData]);

  const masterCheckHandler = () => {
    let temp = jmsConsumerData;
    temp &&
      temp?.ImportedXMLData?.map((val) => {
        return (val.m_bsearch = !masterCheckSearch);
      });
    setJmsConsumerData(temp);
    setGlobalData("allData", temp.ImportedXMLData);
    setmasterCheckSearch(!masterCheckSearch);
  };

  const masterUpdateHandler = () => {
    let temp = jmsConsumerData;
    temp &&
      temp?.ImportedXMLData?.map((val) => {
        return (val.m_bupdate = !masterCheckUpdate);
      });
    setJmsConsumerData(temp);
    setGlobalData("allData", temp.ImportedXMLData);
    setmasterCheckUpdate(!masterCheckUpdate);
  };

  return (
    <React.Fragment>
      <TabsHeading heading={props?.heading} />
      {props.isDrawerExpanded ? (
        <React.Fragment>
          <div className={styles.flexColumn} style={{ marginTop: "3rem" }}>
            <p className={styles.destinationText}>
              {t("destinationName")}
              <StarRateIcon
                style={{
                  height: "8px",
                  width: "8px",
                  color: "red",
                  marginBottom: "5px",
                }}
              />
            </p>
            <div className={styles.flexRow}>
              <input
                className={styles.input}
                id="pmweb_JmsConsumer_DestinationInput"
                value={destinationName}
                onChange={(e) => nameHandler(e)}
                disabled={isReadOnly} //code updated on 26 September 2022 for BugId 115467
                aria-label="DestinationName"
              />
              <button
                className={
                  destinationName?.trim()?.length === 0
                    ? styles.importXmlBtnDisable
                    : styles.importXmlBtn
                }
                id="pmweb_JmsConsumer_ImportXmlBtn"
                onClick={importXmlHandler}
                disabled={destinationName?.trim()?.length === 0 || isReadOnly} //code updated on 26 September 2022 for BugId 115467
              >
                {t("importXml")}
              </button>
            </div>
          </div>
          {jmsConsumerData && jmsConsumerData?.ImportedXMLData?.length > 0 && (
            <div
              className={clsx(styles.flexRow, styles.headerStrip)}
              style={{ marginTop: "2rem" }}
            >
              <Grid container xs={12} justifyContent="space-between">
                <Grid item xs={3}>
                  <div className={clsx(styles.flexRow, styles.headerMargin)}>
                    <FormGroup>
                      <FormControlLabel
                        label={
                          <p className={styles.message}> {t("messageData")}</p>
                        }
                        aria-label={`messageData`}
                        control={
                          <Checkbox
                            checked={messageDataCheckbox}
                            onChange={() => masterMessageDataHandler()}
                            disabled={isReadOnly} //code updated on 26 September 2022 for BugId 115467
                            id={`pmweb_JmsConsumer_${replaceSpaceToUnderScore(
                              t("messageData")
                            )}`}
                            inputRef={messageRef}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                messageRef.current.click();
                                e.stopPropagation();
                              }
                            }}
                          />
                        }
                      />
                    </FormGroup>

                    {/* <p className={styles.message}> {t("messageData")}</p>  */}
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div className={clsx(styles.flexRow, styles.headerMargin)}>
                    <FormGroup>
                      <FormControlLabel
                        label={<p className={styles.search}>{t("search")}</p>}
                        aria-label={`Search`}
                        control={
                          <Checkbox
                            checked={masterCheckSearch}
                            disabled={!messageDataCheckbox || isReadOnly} //code updated on 26 September 2022 for BugId 115467
                            onChange={() => masterCheckHandler()}
                            id={`pmweb_JmsConsumer_Search`}
                            inputRef={searchRef}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                searchRef.current.click();
                                e.stopPropagation();
                              }
                            }}
                          />
                        }
                      />
                    </FormGroup>
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div className={clsx(styles.flexRow, styles.headerMargin)}>
                    <FormGroup>
                      <FormControlLabel
                        label={<p className={styles.update}>{t("update")}</p>}
                        aria-label={`Update`}
                        control={
                          <Checkbox
                            checked={masterCheckUpdate}
                            disabled={!messageDataCheckbox || isReadOnly} //code updated on 26 September 2022 for BugId 115467
                            onChange={() => masterUpdateHandler()}
                            id={`pmweb_JmsConsumer_Update`}
                            inputRef={updateRef}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                updateRef.current.click();
                                e.stopPropagation();
                              }
                            }}
                          />
                        }
                      />
                    </FormGroup>
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div
                    className={clsx(styles.flexRow, styles.headerMargin)}
                    id={`pmweb_JmsConsumer_${replaceSpaceToUnderScore(
                      t("processVariable")
                    )}`}
                  >
                    <p className={styles.variable}> {t("processVariable")}</p>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}
          {jmsConsumerData &&
            jmsConsumerData?.ImportedXMLData?.map((val, index) => {
              return (
                <div
                  className={clsx(styles.flexRow, styles.dataMainDiv)}
                  style={{ marginTop: "1rem" }}
                >
                  <Grid container xs={12} justifyContent="space-between">
                    <Grid item xs={3}>
                      <div className={styles.dataParamName}>
                        <FormGroup>
                          <FormControlLabel
                            label={<p>{val.messageData}</p>}
                            aria-label={`${val.messageData}`}
                            control={
                              <Checkbox
                                id={`pmweb_JmsConsumer_EnableDataFlagHandler_${index}`}
                                checked={val.m_bEnabledata}
                                onChange={() =>
                                  enableDataFlagHandler(
                                    val.m_bEnabledata,
                                    index
                                  )
                                }
                                disabled={isReadOnly} //code updated on 26 September 2022 for BugId 115467
                                inputRef={(item) =>
                                  (VarmessageRef.current[index] = item)
                                }
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    VarmessageRef.current[index].click();
                                    e.stopPropagation();
                                  }
                                }}
                              />
                            }
                          />
                        </FormGroup>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <div
                        className={clsx(styles.search, styles.checkboxMargins)}
                      >
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={val.m_bsearch}
                                disabled={!val.m_bEnabledata || isReadOnly}
                                onChange={() =>
                                  searchHandler(val.m_bsearch, index)
                                }
                                id={`pmweb_JmsConsumer_SearchHandler_${index}`}
                                inputRef={(item) =>
                                  (VarSearchRef.current[index] = item)
                                }
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    VarSearchRef.current[index].click();
                                    e.stopPropagation();
                                  }
                                }}
                              />
                            }
                          />
                        </FormGroup>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <div
                        className={clsx(styles.update, styles.checkboxMargins)}
                      >
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={val.m_bupdate}
                                disabled={!val.m_bEnabledata}
                                onChange={() =>
                                  updateHandler(val.m_bupdate, index)
                                }
                                id={`pmweb_JmsConsumer_UpdateHandler_${index}`}
                                inputRef={(item) =>
                                  (VarUpdateRef.current[index] = item)
                                }
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    VarUpdateRef.current[index].click();
                                    e.stopPropagation();
                                  }
                                }}
                              />
                            }
                          />
                        </FormGroup>
                      </div>
                    </Grid>
                    <Grid item xs={3}>
                      <div className={styles.variable}>
                        <CustomizedDropdown
                          id={`pmweb_JmsConsumer_Variable_Dropdown_${index}`}
                          className={styles.variableDropdown}
                          value={val.selectedProcessVariable}
                          onChange={(e) => onSelectName(e, index)}
                          ariaLabel={"Process Variable dropdown"}
                          disabled={!val.m_bEnabledata || isReadOnly}
                          isNotMandatory={true}
                        >
                          {processVariableDropdown?.map((element, index) => {
                            return (
                              <MenuItem
                                className={styles.menuItemStyles}
                                key={element.VariableName}
                                value={element.VariableName}
                                style={{
                                  justifyContent:
                                    direction === RTL_DIRECTION ? "end" : null,
                                }}
                                id={`pmweb_JmsConsumer_Variable_Dropdown_Options_${index}`}
                              >
                                {element.VariableName}
                              </MenuItem>
                            );
                          })}
                        </CustomizedDropdown>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              );
            })}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {
            <div className={styles.flexColumn} style={{ marginTop: "1rem" }}>
              <p className={styles.destinationTextCollapse}>
                {t("destinationName")}
                <StarRateIcon
                  style={{
                    height: "8px",
                    width: "8px",
                    color: "red",
                    marginBottom: "5px",
                  }}
                />
              </p>
              <div
                className={styles.flexRow}
                style={{ justifyContent: "space-between" }}
              >
                <input
                  className={styles.inputCollapse}
                  id="pmweb_JmsConsumer_DestinationInput"
                  aria-label="DestinationName"
                  value={destinationName}
                  onChange={(e) => nameHandler(e)}
                  disabled={isReadOnly}
                  style={{ width: "80%" }}
                />

                <button
                  className={
                    destinationName?.trim()?.length === 0
                      ? styles.importXmlBtnDisable
                      : styles.importXmlBtn
                  }
                  id="pmweb_JmsConsumer_ImportXmlBtn"
                  onClick={importXmlHandlerCollapse}
                  disabled={destinationName?.trim()?.length === 0 || isReadOnly}
                >
                  {t("importXml")}
                </button>
              </div>
            </div>
          }
          {jmsConsumerData && jmsConsumerData?.ImportedXMLData?.length > 0 && (
            <div className={styles.flexRow} style={{ marginTop: "2rem" }}>
              <div
                className={styles.messageCollapse}
                onClick={messageCollapseHandler}
              >
                <i>{t("messageData")}</i>
              </div>
            </div>
          )}
          {jmsConsumerData &&
            jmsConsumerData?.ImportedXMLData?.map((val) => {
              return (
                <div className="row" style={{ marginTop: "1rem" }}>
                  <div className={styles.dataParamName}>
                    <Checkbox disabled={isReadOnly} />
                    {val.messageData}
                  </div>
                </div>
              );
            })}
        </React.Fragment>
      )}

      {modalClicked && (
        <Modal
          show={modalClicked}
          style={{
            // width: "30vw",
            height: " 52vh",
            // left: "35%",
            top: "30%",
            padding: "0",
          }}
          modalClosed={() => setModalClicked(false)}
          children={
            <XmlModal
              responseXmlData={responseXmlData}
              setModalClicked={setModalClicked}
              destinationName={destinationName}
              activityId={localActivityPropertyData.ActivityProperty.ActivityId}
              processId={props.openProcessID}
              isReadOnly={isReadOnly}
            />
          }
        />
      )}
    </React.Fragment>
  );
}
const replaceSpaceToUnderScore = (str) => {
  return str.replaceAll(" ", "_");
};

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreators.expandDrawer(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(JmsConsumer);
