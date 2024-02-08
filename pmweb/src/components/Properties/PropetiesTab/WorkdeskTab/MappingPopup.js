import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./Sap.module.css";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { CloseIcon } from "../../../../utility/AllImages/AllImages";
import { Box, Button, MenuItem } from "@material-ui/core";
import TextInput from "../../../../UI/Components_With_ErrrorHandling/InputField";
import { useState } from "react";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import arabicStyles from "./ArabicStyles.module.css";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";

function MappingPopup(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  // const loadedProcessData = store.getState("loadedProcessData");
  // const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  // const loadedActivityPropertyData = store.getState("activityPropertyData");
  // const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
  //   useGlobalState(loadedActivityPropertyData);
  const [selectedMapField, setSelectedMapField] = useState(null); //setting sap field name
  /* const [fieldNameList, setFieldNameList] = useState(
    localLoadedProcessData?.Variable
  ); */ //showing dropdown data in fieldname list
  const [fieldNameList, setFieldNameList] = useState(props?.variableList); //showing dropdown data in fieldname list
  const [selectedFieldName, setSelectedFieldName] = useState([]); //setting field name
  const [fieldsList, setfieldsList] = useState([]); //settting sapfieldname and fieldname after click on add button
  const [isTcodeConst, setIsTcodeConst] = useState(false);
  //const [listTcodeConst, setListTcodeConst] = useState([]);
  const dispatch = useDispatch();

  const handleMappingField = (e) => {
    setSelectedMapField(e.target.value);
  };

  const handleFieldName = (e) => {
    setSelectedFieldName(e.target.value);
  };

  //Adding the the sapfield name and fieldname in the dynamic list
  const addMapping = () => {
    let tempListObj = {
      strSAPMappedField: selectedMapField,
      strSAPFieldName: selectedFieldName,
      isConst: isTcodeConst,
    };

    /*    let tempFieldList = [...fieldsList, tempListObj];
    setfieldsList(tempFieldList);
    setSelectedMapField("");
    setSelectedFieldName("");
    setIsTcodeConst(false); */

    //Modified on 02/11/2023, bug_id: 140448
    if (
      selectedMapField === "" ||
      selectedFieldName === "" ||
      selectedMapField === null ||
      selectedFieldName.length === 0
    ) {
      dispatch(
        setToastDataFunc({
          message: t("requiredFields"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let tempFieldList = [...fieldsList, tempListObj];
      setfieldsList(tempFieldList);
      setSelectedMapField("");
      setSelectedFieldName("");
      setIsTcodeConst(false);
    }
    //till here for bug_id: 140448
  };

  const handleSapField = (e, index) => {
    let tempList = [...fieldsList];
    tempList[index].strSAPMappedField = e.target.value;
    setfieldsList(tempList);
  };

  const handleFieldNameList = (e, constStatus, index) => {
    let tempList = [...fieldsList];
    tempList[index].strSAPFieldName = e.target.value;
    if (constStatus) {
      tempList[index].isConst = true;
    } else {
      tempList[index].isConst = false;
    }
    setfieldsList(tempList);
  };

  /* const handleConst = (val, index) => {
    let tempFieldList = [...fieldsList];
    tempFieldList[index].isConst = false;
    setfieldsList(tempFieldList);
  }; */

  //saving the mapped list and embed in defList
  const saveMapping = () => {
    props?.setMapData(fieldsList);
    props?.setShowMapping(false);
  };

  return (
    <>
      <div>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalHeading}>{t("mapping")}</h3>
          <CloseIcon
            onClick={() => {
              props?.setShowMapping(false);
            }}
            className={styles.closeIcon}
            id="Pmweb_MappingPopup_addMapping_CloseIcon"
          />
        </div>
        <p className={styles.modalSubHeading}></p>
        <div className={styles.mappingBody}>
          <Box>
            <table className={styles.sapMapPopup}>
              <thead>
                <tr>
                  <th>
                    <span
                      style={{
                        marginInlineStart:
                          direction === RTL_DIRECTION ? "0.5rem" : "none",
                      }}
                    >
                      {t("toolbox.workdeskSap.sapFieldName")}
                      <span style={{ color: "#D53D3D" }}>*</span>
                    </span>
                  </th>
                  <th>
                    <span
                      style={{
                        marginInlineStart:
                          direction === RTL_DIRECTION ? "1.25rem" : "none",
                      }}
                    >
                      {t("Name")}
                      <span style={{ color: "#D53D3D" }}>*</span>
                    </span>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <TextInput
                      classTag={styles.sapInput}
                      name="fieldName"
                      idTag="Sap_mapFieldName"
                      inputValue={selectedMapField}
                      onChangeEvent={handleMappingField}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td>
                    <CustomizedDropdown
                      id="SAP_Workdesk_FieldName"
                      className={styles.dropdown}
                      // disabled={disabled}
                      value={selectedFieldName}
                      onChange={handleFieldName}
                      isConstant={isTcodeConst}
                      setIsConstant={(val) => {
                        setIsTcodeConst(val);
                      }}
                      showConstValue={true}
                      style={{ minWidth: "15rem" }}
                    >
                      {fieldNameList?.map((_var, i) => {
                        return (
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.menuItemStyles
                                : styles.menuItemStyles
                            }
                            key={i}
                            value={_var.VariableName}
                          >
                            {_var.VariableName}
                          </MenuItem>
                        );
                      })}
                    </CustomizedDropdown>
                  </td>
                  <td>
                    <div style={{ display: "flex" }}>
                      <Button
                        className={styles.addButton}
                        id="sap_workdesk_map_btn_cancel"
                        //onClick={() => {}}
                        //Modified on 02/11/2023, bug_id: 140448
                        onClick={() => {
                          setSelectedFieldName("");
                          setSelectedMapField("");
                        }}
                        //till here for bug_id: 140448
                      >
                        {t("reset")}
                      </Button>
                      <Button
                        className={styles.saveBtn}
                        id="sap_workdesk_map_btn_add"
                        onClick={addMapping}
                        style={{ margin: "0" }}
                      >
                        {t("add")}
                      </Button>
                    </div>
                  </td>
                </tr>
                {fieldsList?.length > 0 &&
                  fieldsList?.map((data, i) => {
                    return (
                      <tr>
                        <td>
                          {
                            <TextInput
                              classTag={styles.sapInput}
                              name="fieldName"
                              idTag={`pmweb_Sap_mapFieldName` + `${i}`}
                              inputValue={data.strSAPMappedField}
                              onChangeEvent={(e) => {
                                handleSapField(e, i);
                              }}
                              style={{ margin: 0 }}
                            />
                          }
                        </td>
                        <td>
                          <CustomizedDropdown
                            id="SAP_Workdesk_FieldName"
                            className={styles.dropdown}
                            // disabled={disabled}
                            value={data?.strSAPFieldName}
                            /*onChange={(e) => {
                              //setTimeout(() => handleFieldNameList(e, i), 50);
                              handleFieldNameList(e, i);
                            }}*/
                            onChange={(e, isConstant) => {
                              handleFieldNameList(e, isConstant, i);
                            }}
                            /*setIsConstant={(val) => {
                              handleConst(val, i);
                            }}*/
                            // isConstant={data?.isConst}
                            isConstant={data?.isConst ? true : false}
                            showConstValue={true}
                          >
                            {fieldNameList?.map((_var, i) => {
                              return (
                                <MenuItem
                                  className={styles.menuItemStyles}
                                  key={i}
                                  value={_var.VariableName}
                                >
                                  {_var.VariableName}
                                </MenuItem>
                              );
                            })}
                          </CustomizedDropdown>
                        </td>
                        <td></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </Box>
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={() => {
              props?.setShowMapping(false);
            }}
            id="pmweb_MappingPopup_saveMapping_close_button"
          >
            {/*  {t("Close")} */}
            {t("cancel")}
          </button>
          <button
            className={styles.saveButton}
            onClick={saveMapping}
            id="pmweb_MappingPopup_saveMapping_save_button"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </>
  );
}

export default MappingPopup;
