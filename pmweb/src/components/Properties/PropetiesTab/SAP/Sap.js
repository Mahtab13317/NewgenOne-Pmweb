import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction";
import { connect, useDispatch } from "react-redux";
import styles from "./index.module.css";
import { Select, MenuItem, CircularProgress } from "@material-ui/core";

import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ENDPOINT_SAP_FUNCTION,
  propertiesLabel,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../Constants/appConstants.js";
import arabicStyles from "./ArabicStyles.module.css";
import Input from "./Input";
import Output from "./Output";
import Table from "./Table";
import Tabs from "../../../../UI/Tab/Tab.js";
import axios from "axios";
import TabsHeading from "../../../../UI/TabsHeading";
import {
  getVarDetails,
  isReadOnlyFunc,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import TextInput from "../../../../UI/Components_With_ErrrorHandling/InputField";

function Sap(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [registerFunctionList, setregisterFunctionList] = useState([]); //state to show the list of resister function
  const [configDrop, setconfigDrop] = useState([]); //state to show the list of config of sap
  const [selectedFunction, setselectedFunction] = useState(null);
  const [selectedConfig, setselectedConfig] = useState(null);
  const [sapUserDrop, setSAPUserDrop] = useState([]); //state to set user variable list
  const [processVarDropdown, setprocessVarDropdown] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [sapOutput, setSapOutput] = useState(null); //state to show selected function detail for input/output and table
  const [isChangeFunc, setIsChangeFunc] = useState(null);
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  const parameterHandler = () => {
    props.expandDrawer(!props.isDrawerExpanded);
  };

  useEffect(() => {
    let temp =
      localLoadedActivityPropertyData?.ActivityProperty?.m_objPMSAPAdapterInfo;
    axios
      .get(
        SERVER_URL +
          ENDPOINT_SAP_FUNCTION +
          "/" +
          localLoadedProcessData.ProcessDefId +
          "/" +
          localLoadedProcessData.ProcessType
      )
      .then((res) => {
        if (res.status === 200) {
          setregisterFunctionList(res?.data?.SAPFunctions);

          setconfigDrop(res?.data?.SAPConfig);

          let config = [...res?.data?.SAPConfig];

          if (+temp?.m_strSelectedSAPConfig === 0) {
            setselectedConfig("");
          } else {
            config = config?.filter(
              (d) => +d.SAPConfigId === +temp?.m_strSelectedSAPConfig
            );
            setselectedConfig(config[0]?.ConfigName); //settting the value of selected config
          }

          const filterFuncList = res?.data?.SAPFunctions?.filter(
            (d) =>
              d.FunctionID ==
              localLoadedActivityPropertyData?.ActivityProperty
                ?.m_objPMSAPAdapterInfo?.m_strSelectedSAPFunction
          );

          setSapOutput(filterFuncList); //setting the value of selected function locally
        }
      });

    setSAPUserDrop(
      localLoadedProcessData?.Variable?.filter(
        (val) => val.VariableType == "10"
      )
    );

    setprocessVarDropdown(localLoadedProcessData?.Variable);
    setselectedFunction(temp?.m_strSelectedSAPFunction); //setting the value of selected function from get api of activity
    setSelectedUserName(temp?.m_sSapUserName);
    setIsChangeFunc(temp?.m_strSelectedSAPFunction);
  }, []);

  const getSelectedVal = (e) => {
    setselectedFunction(e.target.value);
    const temp = [...registerFunctionList];
    const funcList = temp.filter((d) => d.FunctionID === e.target.value);
    setSapOutput(funcList);
    setIsChangeFunc(e.target.value);

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_strSelectedSAPFunction =
      e.target.value;

    let config = [...configDrop];
    config = config?.filter((d) => d.SAPConfigId === funcList[0].SAPConfigId);
    setselectedConfig(config[0]?.ConfigName);
    tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_strSelectedSAPConfig =
      funcList[0].SAPConfigId;

    if (isChangeFunc != e.target.value) {
      /* tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.mapSAPInputParamMapInfo =
        {};

      tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.mapSAPOutputParamMapInfoComplex =
        {};

      tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.mapSAPtableParamMapInfoComplex =
        {}; */
    }

    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.sap]: { isModified: true, hasError: false },
      })
    );
  };

  const changeUsername = (userVal) => {
    setSelectedUserName(userVal);
    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_sSapUserName =
      userVal;
    tempLocalState.ActivityProperty.m_objPMSAPAdapterInfo.m_sSapUserVariableid =
      getVarDetails(sapUserDrop, userVal).VariableId;
    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.sap]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <React.Fragment>
      <TabsHeading heading={props?.heading} />
      {sapOutput ? (
        <>
          {props.isDrawerExpanded && sapOutput ? (
            <div style={{ margin: "1%" }}>
              <div className="row" style={{ marginTop: "1%", width: "100%" }}>
                <div style={{ width: "20%" }}>
                  <p className={styles.dropdownLabel}>
                    {t("registerFunctions")}
                  </p>
                  {/*   <Select
                className={styles.dataDropdown}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  style: {
                    maxHeight: 400,
                  },
                  getContentAnchorEl: null,
                }}
                disabled={isReadOnly}
                style={{ width: "10rem", border: ".5px solid #c4c4c4" }}
                value={selectedFunction}
                onChange={getSelectedVal}
                id="sap_selectedFunction"
              >
                {registerFunctionList?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.webSDropdownData
                          : styles.webSDropdownData
                      }
                      value={option.FunctionID}
                    >
                      {option.FunctionName}
                    </MenuItem>
                  );
                })}
              </Select> */}
                  <CustomizedDropdown
                    disabled={isReadOnly}
                    value={selectedFunction}
                    onChange={getSelectedVal}
                    id="pmweb_SAPAdapter_sap_selectedFunction"
                    isNotMandatory={true}
                    width="100%"
                    className={styles.dataDropdown}
                  >
                    {registerFunctionList?.map((option) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.webSDropdownData
                              : styles.webSDropdownData
                          }
                          value={option.FunctionID}
                        >
                          {option.FunctionName}
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>

                <div style={{ marginLeft: "2rem", width: "20%" }}>
                  <p className={styles.dropdownLabel}>{t("sapConfig")}</p>
                  {/* <Select
                className={styles.dataDropdown}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  style: {
                    maxHeight: 400,
                  },
                  getContentAnchorEl: null,
                }}
                disabled={isReadOnly}
                style={{ width: "10rem", border: ".5px solid #c4c4c4" }}
                value={selectedConfig}
                onChange={(e) => changeConfig(e.target.value)}
                id="sap_selectedConfig"
              >
                {configDrop?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.webSDropdownData
                          : styles.webSDropdownData
                      }
                      value={option.SAPConfigId}
                    >
                      {option.ConfigName}
                    </MenuItem>
                  );
                })}
              </Select> */}
                  {/* <CustomizedDropdown
                 disabled={isReadOnly}
                
                value={selectedConfig}
                onChange={(e) => changeConfig(e.target.value)}
                id="sap_selectedConfig"
                className={styles.dataDropdown}
                isNotMandatory={true}
              >
                {configDrop?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.webSDropdownData
                          : styles.webSDropdownData
                      }
                      value={option.SAPConfigId}
                    >
                      {option.ConfigName}
                    </MenuItem>
                  );
                })}
              </CustomizedDropdown> */}
                  <TextInput
                    inputValue={selectedConfig}
                    classTag={styles.textInput}
                    name="hostName"
                    idTag="pmweb_SapAdapter_SapConfig"
                    readOnlyCondition={true}
                  />
                </div>

                <div style={{ marginLeft: "2rem", width: "20%" }}>
                  <p className={styles.dropdownLabel}>{t("sapUserName")}</p>
                  {/*  <Select
                className={styles.dataDropdown}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  style: {
                    maxHeight: 400,
                  },
                  getContentAnchorEl: null,
                }}
                disabled={isReadOnly}
                style={{ width: "10rem", border: ".5px solid #c4c4c4" }}
                value={selectedUserName}
                onChange={(e) => changeUsername(e.target.value)}
                id="selectedUser"
              >
                {sapUserDrop?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.webSDropdownData
                          : styles.webSDropdownData
                      }
                      value={option.VariableName}
                    >
                      {option.VariableName}
                    </MenuItem>
                  );
                })}
              </Select> */}
                  <CustomizedDropdown
                    disabled={isReadOnly}
                    value={selectedUserName}
                    onChange={(e) => changeUsername(e.target.value)}
                    id="pmweb_SAPAdapter_sap_selectedUser"
                    className={styles.dataDropdown}
                    isNotMandatory={true}
                  >
                    {sapUserDrop?.map((option) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.webSDropdownData
                              : styles.webSDropdownData
                          }
                          value={option.VariableName}
                        >
                          {option.VariableName}
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>
              </div>

              <h4 style={{ marginTop: "2%" }}>{t("parameterMapping")}</h4>
              <Tabs
                tabType={styles.sapSubTab}
                tabBarStyle={styles.mainTabBarStyle}
                oneTabStyle={styles.mainOneTabStyle}
                TabNames={[t("Input"), t("Output"), t("table")]}
                TabElement={[
                  <Input
                    sapOutput={sapOutput}
                    processVarDropdown={processVarDropdown}
                    changeFunction={isChangeFunc}
                    isReadOnly={isReadOnly}
                    id="pmweb_sap_adapter_input"
                  />,
                  <Output
                    sapOutput={sapOutput}
                    processVarDropdown={processVarDropdown}
                    changeFunction={isChangeFunc}
                    isReadOnly={isReadOnly}
                    id="pmweb_sap_adapter_output"
                  />,
                  <Table
                    sapOutput={sapOutput}
                    processVarDropdown={processVarDropdown}
                    changeFunction={isChangeFunc}
                    isReadOnly={isReadOnly}
                    id="pmweb_sap_adapter_table"
                  />,
                ]}
              />
            </div>
          ) : (
            <React.Fragment>
              <div style={{ margin: "1rem" }}>
                <div style={{ width: "80%" }}>
                  <p className={styles.dropdownLabelCompact}>
                    {t("registerFunctions")}
                  </p>
                  {/* <Select
                className={styles.dataDropdown}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  style: {
                    maxHeight: 400,
                  },
                  getContentAnchorEl: null,
                }}
                style={{ width: "10rem", border: ".5px solid #c4c4c4" }}
                value={selectedFunction}
                disabled={isReadOnly}
                onChange={(e) => setselectedFunction(e.target.value)}
                id="sap_selectedFunction"
              >
                {registerFunctionList?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.webSDropdownData
                          : styles.webSDropdownData
                      }
                      value={option.FunctionID}
                    >
                      {option.FunctionName}
                    </MenuItem>
                  );
                })}
              </Select> */}
                  <CustomizedDropdown
                    disabled={isReadOnly}
                    value={selectedFunction}
                    onChange={getSelectedVal}
                    id="sap_selectedFunction"
                    isNotMandatory={true}
                    width="80%"
                    className={styles.dataDropdown}
                  >
                    {registerFunctionList?.map((option) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.webSDropdownData
                              : styles.webSDropdownData
                          }
                          value={option.FunctionID}
                        >
                          {option.FunctionName}
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>

                <div style={{ width: "80%" }}>
                  <p className={styles.dropdownLabelCompact}>
                    {t("sapConfig")}
                  </p>
                  {/* <Select
                className={styles.dataDropdown}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  style: {
                    maxHeight: 400,
                  },
                  getContentAnchorEl: null,
                }}
                disabled={isReadOnly}
                style={{ width: "10rem", border: ".5px solid #c4c4c4" }}
                value={selectedConfig}
                onChange={(e) => setselectedConfig(e.target.value)}
                id="sap_selectedConfig"
              >
                {configDrop?.map((option) => {
                  return (
                    <MenuItem
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.webSDropdownData
                          : styles.webSDropdownData
                      }
                      value={option.iConfigurationId}
                    >
                      {option.configurationName}
                    </MenuItem>
                  );
                })}
              </Select> */}
                  <TextInput
                    inputValue={selectedConfig}
                    classTag={styles.textInput}
                    name="hostName"
                    idTag="pmweb_SapAdapter_SapConfig"
                    readOnlyCondition={true}
                  />
                </div>

                <div>
                  <p className={styles.dropdownLabelCompact}>
                    {t("sapUserName")}
                  </p>
                  <Select
                    className={styles.dataDropdown}
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      style: {
                        maxHeight: 400,
                      },
                      getContentAnchorEl: null,
                    }}
                    disabled={isReadOnly}
                    style={{ width: "10rem", border: ".5px solid #c4c4c4" }}
                    value={selectedUserName}
                    onChange={(e) => setSelectedUserName(e.target.value)}
                    id="selectedUser"
                  >
                    {sapUserDrop?.map((option) => {
                      return (
                        <MenuItem
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.webSDropdownData
                              : styles.webSDropdownData
                          }
                          value={option}
                        >
                          {option.VariableName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
              </div>
              <h4 style={{ margin: "5%" }}>{t("parameterMapping")}</h4>
              <button
                className={styles.viewParameter}
                onClick={parameterHandler}
              >
                {t("viewParameterMapping")}
              </button>
            </React.Fragment>
          )}
        </>
      ) : (
        <CircularProgress
          style={
            direction === RTL_DIRECTION
              ? { marginTop: "30vh", marginRight: "50%" }
              : { marginTop: "30vh", marginLeft: "50%" }
          }
        />
      )}
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
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

export default connect(mapStateToProps, mapDispatchToProps)(Sap);
