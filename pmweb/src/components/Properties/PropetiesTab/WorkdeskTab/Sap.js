import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Sap.module.css";
import { MenuItem, Checkbox, Box, CircularProgress } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import axios from "axios";
import {
  SERVER_URL,
  RTL_DIRECTION,
  STATE_CREATED,
  ENDPOINT_REGISTER_SAP,
  ADD_CONSTANT,
  MODIFY_CONSTANT,
  DELETE_CONSTANT,
  STATE_ADDED,
  STATE_EDITED,
  ENDPOINT_ADD_SAP_DEF,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import arabicStyles from "./ArabicStyles.module.css";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import SapDefList from "./SapDefList";
import TextInput from "../../../../UI/Components_With_ErrrorHandling/InputField";
import { DDIcon } from "../../../../utility/AllImages/AllImages";
import SapDefForm from "./SapDefForm";
import SapDefMap from "./SapDefMap";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import emptyStatePic from "../../../../assets/ProcessView/EmptyState.svg";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction.js";
const menuProps = {
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
};

/* const testList=[
  { id: 1, name: "Testing", tcode: "", status: "added", mapping: "" },
  { id: 2, name: "Testing2", tcode: "", status: "added", mapping: "" },
  { id: 3, name: "Testing3", tcode: "", status: "added", mapping: "" },
] */
/* 
const selected={
  id: 1,
  name: "Testing",
  status: "added",
  tcode: "",
  mapping: "",
} */

/* const defL=[
  { id: 1, defName: "Testing", tcode: "xyz", mapping: null },
  { id: 2, defName: "newDef", tcode: "qwe", mapping: null },
] */

function Sap(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const { isReadOnly } = props;
  const [sapList, setSapList] = useState([]); //state to show DEfinition list in dropdown
  const [sapConfig, setSapConfig] = useState([]); // state to show config list dropdown
  const [selected, setSelected] = useState(null);
  const [isDisable, setIsDisable] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState("");
  const [selectedDef, setSelectedDef] = useState("");
  const [sapAdapter, setSapAdapter] = useState(false);
  const [showSapDefForm, setShowSapDefForm] = useState(false);
  const [defList, setDefList] = useState(null);
  const [sapTcode, setSapTcode] = useState(null);
  const [showMapping, setShowMapping] = useState(false);
  const [mappedData, setMappedData] = useState(null);
  const [spinner, setspinner] = useState(true);

  const getAPICall = async (url) => {
    return await axios.get(url);
  };

  useEffect(async () => {
    const url =
      SERVER_URL +
      ENDPOINT_REGISTER_SAP +
      "/" +
      localLoadedProcessData.ProcessDefId +
      "/" +
      localLoadedProcessData.ProcessType;
    const configList = await getAPICall(url);
    if (configList?.status === 200) {
      setSapConfig(configList?.data);
    }

    const url2 =
      SERVER_URL +
      ENDPOINT_ADD_SAP_DEF +
      "/" +
      localLoadedProcessData.ProcessDefId +
      "/" +
      localLoadedProcessData.ProcessType;

    const sapDefList = await getAPICall(url2);
    if (sapDefList?.status === 200) {
      setDefList(sapDefList?.data);
    }

    let assocDefList =
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo?.m_objSAPDefInfo.lstAssocSAPAdapterDef?.map(
        (data, i) => {
          return { ...data, status: STATE_ADDED };
        }
      );

    if (assocDefList?.length > 0) {
      setSapList(assocDefList);
      setSelected(assocDefList[0]);
      setSelectedConfig(assocDefList[0].sapConfigId);
      setSapAdapter(true);
      setIsDisable(false);
      setSelectedDef(assocDefList[0].strSAPdefName);
      sapDefList?.data?.forEach((item, i) => {
        if (item.strSAPdefName === assocDefList[0].strSAPdefName) {
          setSapTcode(item.strSAPTCode);
          const mappedList = Object.keys(item.mapFieldMapping).map((key) => {
            return item.mapFieldMapping[key];
          });
          setMappedData(mappedList);
          setShowMapping(true);
        }
      });
    }

    if (localLoadedActivityPropertyData !== null) {
      setspinner(false);
    }
  }, [localLoadedActivityPropertyData]);

  //Added  on 14/08/2023, bug_id:133944

  useEffect(() => {
    setSelectedConfig(selected?.sapConfigId);
    setSelectedDef(selected?.strSAPdefName);
    defList?.forEach((data, i) => {
      if (data.strSAPdefName === selected?.strSAPdefName) {
        setSapTcode(data.strSAPTCode);
        const mappedList = Object.keys(data.mapFieldMapping).map((key) => {
          return data.mapFieldMapping[key];
        });
        setMappedData(mappedList);
      }
    });
    setShowMapping(true);
  }, [selected]);

  //Function to add new blank definition to define
  const addNewHandler = () => {
    props.expandDrawer(true);
    let temp = [...sapList];
    let indexVal;
    let maxId = 0;

    //to remove existing temporary SAP from list, before adding new temporary SAP
    temp?.forEach((def, index) => {
      if (def.status && def.status === STATE_CREATED) {
        indexVal = index;
      }
      if (maxId < def.idefId) {
        maxId = def.idefId;
      }
    });

    if (indexVal >= 0) {
      temp.splice(indexVal, 1);
    }

    temp.splice(0, 0, {
      strSAPdefName: t("newDefinition"),
      idefId: maxId + 1,
      status: STATE_CREATED,
    });
    setSelected(temp[0]);
    setSapList(temp);
    //Added on 09/08/2023, bug_id:133786
    setSelectedConfig("");
    setSelectedDef("");
    setSapTcode("");
  };

  const changeConfig = (e) => {
    setSelectedConfig(e.target.value);
  };

  const changeDefinition = (e) => {
    setSelectedDef(e.target.value);
    defList?.forEach((data, i) => {
      if (data.strSAPdefName === e.target.value) {
        setSapTcode(data.strSAPTCode);
        const mappedList = Object.keys(data.mapFieldMapping).map((key) => {
          return data.mapFieldMapping[key];
        });
        setMappedData(mappedList);
      }
    });
    setShowMapping(true);
  };

  const handleDefinition = (statusConstant) => {
    const tempLocalState = { ...localLoadedActivityPropertyData };
    let sapDefList = [...sapList];
    let tempDefList = defList?.filter((d) => d?.strSAPdefName == selectedDef);
    let newObj = {
      idefId: tempDefList[0]?.idefId,
      strSAPdefName: tempDefList[0]?.strSAPdefName,
      sapConfigId: selectedConfig,
      status: STATE_ADDED,
    };
    let filterList = sapDefList.filter((d) => d.strSAPdefName === selectedDef);

    if (statusConstant === ADD_CONSTANT) {
      //call add api

      if (filterList?.length > 0) {
        dispatch(
          setToastDataFunc({
            message: t("defMsg"),
            severity: "error",
            open: true,
          })
        );
      } else {
        sapDefList[0] = newObj;
        setSapList(sapDefList);
        setSelected(newObj);
      }
    }

    if (statusConstant === MODIFY_CONSTANT) {
      //call modify api
      if (filterList?.length > 0) {
        dispatch(
          setToastDataFunc({
            message: t("defMsg"),
            severity: "error",
            open: true,
          })
        );
      } else {
        let currPos = 0;
        sapDefList?.forEach((data, i) => {
          if (data?.idefId === selected?.idefId) {
            currPos = i;
          }
        });

        /*   newObj = {
          idefId: tempDefList[0]?.idefId,
          strSAPdefName: tempDefList[0]?.strSAPdefName,
          sapConfigId: selectedConfig,
          status: STATE_ADDED,
        }; */
        sapDefList[currPos] = newObj;
        setSapList(sapDefList);
        //setSelected(newObj);
      }
    }

    if (statusConstant === DELETE_CONSTANT) {
      //call delete api
      sapDefList = sapDefList?.filter((d) => d.idefId !== selected?.idefId);
      setSapList(sapDefList);
      setSelected(sapDefList[0]);
    }

    tempLocalState.ActivityProperty.wdeskInfo.m_objSAPDefInfo.lstAssocSAPAdapterDef =
      sapDefList;
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.sapDef]: { isModified: true, hasError: false },
      })
    );
  };

  const cancelAddDef = () => {
    let temp = [...sapList];
    temp.splice(0, 1);
    setSelected(temp[0]);
    setSapList(temp);
  };

  const showForm = (bool) => {
    setShowSapDefForm(bool);
  };

  return (
    <React.Fragment>
      <div className={styles.mainWrappingDiv}>
        {spinner ? (
          <CircularProgress
            style={
              direction === RTL_DIRECTION
                ? { marginTop: "30vh", marginRight: "50%" }
                : { marginTop: "30vh", marginLeft: "50%" }
            }
          />
        ) : (
          <>
            {sapList?.length > 0 ? (
              <>
                {props.isDrawerExpanded ? (
                  <>
                    <div className={styles.leftPannel}>
                      <div className={`row ${styles.listHeader}  `}>
                        <div className={styles.listHeading}>
                          {t("associateDefinition")}
                        </div>
                        <div>
                          <button
                            className={styles.addButton}
                            id="AddAssociate"
                            onClick={addNewHandler}
                          >
                            {t("addNew")}
                          </button>
                        </div>
                      </div>
                      <SapDefList
                        list={sapList}
                        selected={selected}
                        setSelected={setSelected}
                      />
                      {/* <div className={styles.verticalDivision}></div> */}
                    </div>
                    <div className={styles.rightPannel}>
                      <Box>
                        <div className={styles.defHeader}>
                          <div className={styles.listHeading}>
                            {t("newDefinition")}
                          </div>

                          <div>
                            {selected?.status === STATE_ADDED ||
                            selected?.status === STATE_EDITED ? (
                              <>
                                <button
                                  className={`${styles.addButton}`}
                                  onClick={() =>
                                    handleDefinition(DELETE_CONSTANT)
                                  }
                                  id="webS_deleteBtn_sap_config"
                                >
                                  {t("delete")}
                                </button>
                                <button
                                  className={`${styles.saveBtn}`}
                                  onClick={() =>
                                    handleDefinition(MODIFY_CONSTANT)
                                  }
                                  id="webS_saveChangeBtn_sap_config"
                                >
                                  {t("modify")}
                                </button>{" "}
                              </>
                            ) : (
                              <div>
                                <button
                                  className={`${styles.addButton}`}
                                  onClick={cancelAddDef}
                                  id="webS_discardAddBtn_sap_config"
                                >
                                  {t("discard")}
                                </button>
                                <button
                                  className={`${styles.saveBtn}`}
                                  onClick={() => handleDefinition(ADD_CONSTANT)}
                                  id="webS_addBtn_sap_config"
                                >
                                  {t("addDefinition")}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Box>
                      <Box>
                        <div className={styles.checklist}>
                          <Checkbox
                            onChange={(e) => {
                              setIsDisable(!e.target.checked);
                              setSapAdapter(e.target.checked);
                            }}
                            className={styles.checkBoxCommon}
                            disabled={isReadOnly}
                            checked={sapAdapter}
                          />
                          {t("sapAdapter")}
                        </div>
                      </Box>

                      <Box>
                        <div className={styles.flexRow}>
                          <div className={styles.formControl}>
                            <p
                              className={styles.labelTittle}
                              style={{
                                marginInlineStart:
                                  direction === RTL_DIRECTION
                                    ? "1.25rem"
                                    : "none",
                              }}
                            >
                              {t("sapConfig")}
                            </p>
                            <CustomizedDropdown
                              id="SAP_Def_Config_Dropdown"
                              value={selectedConfig}
                              onChange={changeConfig}
                              className={styles.dropdown}
                              MenuProps={menuProps}
                              disabled={isReadOnly || isDisable}
                            >
                              {sapConfig?.length > 0 ? (
                                sapConfig?.map((element) => {
                                  return (
                                    <MenuItem
                                      className={
                                        direction === RTL_DIRECTION
                                          ? arabicStyles.menuItemStyles
                                          : styles.menuItemStyles
                                      }
                                      key={element}
                                      value={element?.iConfigurationId}
                                    >
                                      {element?.configurationName}
                                    </MenuItem>
                                  );
                                })
                              ) : (
                                <MenuItem>
                                  <CircularProgress
                                    style={{
                                      width: "2rem",
                                      height: "2rem",
                                    }}
                                  />
                                </MenuItem>
                              )}
                            </CustomizedDropdown>
                          </div>
                          <div className={styles.formControl}>
                            <p
                              className={styles.labelTittle}
                              style={{
                                marginInlineStart:
                                  direction === RTL_DIRECTION
                                    ? "1.25rem"
                                    : "none",
                              }}
                            >
                              {t("definedDefinition")}
                            </p>
                            <div style={{ display: "flex", width: "100%" }}>
                              <div style={{ width: "90%" }}>
                                <CustomizedDropdown
                                  id="SAP_Def_Dropdown"
                                  value={selectedDef}
                                  onChange={changeDefinition}
                                  className={styles.dropdown}
                                  MenuProps={menuProps}
                                  disabled={isReadOnly || isDisable}
                                >
                                  {defList &&
                                    defList?.map((element, i) => {
                                      return (
                                        <MenuItem
                                          className={
                                            direction === RTL_DIRECTION
                                              ? arabicStyles.menuItemStyles
                                              : styles.menuItemStyles
                                          }
                                          key={i}
                                          value={element.strSAPdefName}
                                        >
                                          {element.strSAPdefName}
                                        </MenuItem>
                                      );
                                    })}
                                </CustomizedDropdown>
                              </div>
                              <div
                                style={{
                                  width:
                                    direction === RTL_DIRECTION ? "15%" : "10%",
                                  background: "#2274BC",
                                  color: "#fff",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "large",
                                    padding:
                                      direction === RTL_DIRECTION
                                        ? "1.5rem"
                                        : "0.5rem",
                                  }}
                                >
                                  {/*  <AddIcon style={{ marginTop: "5px" }} /> */}
                                  <DDIcon
                                    id="pmweb_SAP_DD_Icon"
                                    style={{
                                      marginTop: "0.5rem",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      showForm(
                                        isReadOnly || isDisable ? null : true
                                      );
                                    }}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className={styles.formControl}>
                            <p className={styles.labelTittle}>
                              {t("saptCode")}
                            </p>
                            <TextInput
                              classTag={styles.sapInput}
                              name="tcode"
                              idTag="Sap_TCode"
                              readOnlyCondition={true}
                              inputValue={sapTcode}
                            />
                          </div>
                        </div>
                      </Box>
                      {showSapDefForm ? (
                        <Box>
                          <SapDefForm
                            disabled={isReadOnly || isDisable}
                            selectedDef={selected}
                            defList={defList}
                            setDefList={setDefList}
                            showForm={showForm}
                            id="pmweb_workdesk_sapdefForm"
                          />
                        </Box>
                      ) : null}

                      {showMapping ? (
                        <Box>
                          <SapDefMap
                            selectedDef={selected}
                            mappedData={mappedData}
                            id="pmweb_workdesk_sapdefMap"
                          />
                        </Box>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.collapsePanel}>
                      <div className={`row ${styles.listHeader}  `}>
                        <div className={styles.listHeading}>
                          {t("associateDefinition")}
                        </div>
                      </div>
                      <SapDefList
                        list={sapList}
                        selected={selected}
                        setSelected={setSelected}
                        id="pmweb_workdesk_sapdeflist"
                      />
                      <div>
                        <button
                          className={styles.addButton}
                          id="ViewDef"
                          onClick={() => {
                            props.expandDrawer(true);
                          }}
                        >
                          {t("view")} {t("definition")}
                        </button>
                      </div>
                      {/* <div className={styles.verticalDivision}></div> */}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className={styles.noData}>
                  <div>
                    <img
                      src={emptyStatePic}
                      alt={t("noConfigurationAdded")}
                      id="sap_catalog_config_noImg"
                    />
                  </div>
                  <button
                    className={styles.noDataBtn}
                    onClick={addNewHandler}
                    id="sap_catalog_blank_addNewBtn"
                  >
                    {t("addWithPlusIcon")} {t("New")}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreators.expandDrawer(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sap);
