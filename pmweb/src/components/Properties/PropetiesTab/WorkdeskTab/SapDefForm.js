import React from "react";
import styles from "./Sap.module.css";
import TextInput from "../../../../UI/Components_With_ErrrorHandling/InputField";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { store, useGlobalState } from "state-pool";
import { useState } from "react";
import { Button, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import MappingPopup from "./MappingPopup.js";
import Modal from "../../../../UI/Modal/Modal";
import axios from "axios";
import arabicStyles from "./ArabicStyles.module.css";
import {
  COMPLEX_VARTYPE,
  ENDPOINT_ADD_SAP_DEF,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import {
  getComplex,
  getVarDetails,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";

function SapDefForm(props) {
  let { disabled, selectedDef, defList, setDefList, showForm } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [variableList, setVariableList] = useState(
    localLoadedProcessData?.Variable
  );
  const constantsData = localLoadedProcessData.DynamicConstant;

  const [defName, setDefName] = useState("");
  const [addBtnDisable, setAddBtnDisable] = useState(true);
  const [tCode, setTCode] = useState("");
  const [showMapping, setShowMapping] = useState(false);
  const [mapData, setMapData] = useState(null); //getting mapped data from Mapping popup
  const [isTcodeConst, setIsTcodeConst] = useState(false);

  useEffect(() => {
    if (defName != "" && tCode != "") {
      setAddBtnDisable(false);
    } else {
      setAddBtnDisable(true);
    }
  }, [defName, tCode]);

  useEffect(() => {
    if (variableList) {
      let variableWithConstants = [];

      // Setting complex data in varibale list
      let tempVarList = [];

      variableList?.forEach((_var) => {
        if (_var.VariableType === COMPLEX_VARTYPE) {
          let tempList = getComplex(_var);
          tempList?.forEach((el) => {
            tempVarList.push(el);
          });
        } else {
          tempVarList.push(_var);
        }
      });

      //Setting constant data from Data Object user define constant
      constantsData?.forEach((element) => {
        let tempObj = {
          VariableName: element.ConstantName,
          VariableScope: "F",
          VariableId: "0",
          VarFieldId: "0",
        };
        variableWithConstants.push(tempObj);
      });
      tempVarList?.forEach((element) => {
        variableWithConstants.push(element);
      });

      setVariableList(variableWithConstants);
    }
  }, []);

  const handleDefinition = (e) => {
    setDefName(e.target.value);
  };

  const handleTcode = (e, constStatus) => {
    setTCode(e.target.value);
  };

  /* idefId: maxId,
          defName: defName,
          tcode: tCode,
          mapping: mapData, */

  const addDefinition = () => {
    let tempDedList;
    let maxId = 0;
    let isValid = true;
    if (defList?.length > 0) {
      //Modified  on 03/08/2023, bug_id:131962

      /*   maxId = defList[defList?.length - 1]?.idefId + 1;
        tempDedList = [
          ...defList,
          {
            strSAPConfigName: null,
            strSAPdefName: defName,
            idefId: maxId,
            strSAPTCode: tCode,
            mapFieldMapping: mapData,
          },
        ]; */

      let checkDef = defList.filter((d) => d.strSAPdefName === defName);

      if (checkDef?.length > 0) {
        dispatch(
          setToastDataFunc({
            message: t("defMsg"),
            severity: "error",
            open: true,
          })
        );
        isValid = false;
      } else {
        maxId = defList[defList?.length - 1]?.idefId + 1;
        tempDedList = [
          ...defList,
          {
            strSAPConfigName: null,
            strSAPdefName: defName,
            idefId: maxId,
            strSAPTCode: tCode,
            mapFieldMapping: mapData,
          },
        ];
        isValid = true;
      }
    } else {
      maxId = maxId + 1;
      tempDedList = [
        {
          strSAPConfigName: null,
          strSAPdefName: defName,
          idefId: maxId,
          strSAPTCode: tCode,
          mapFieldMapping: mapData,
        },
      ];
    }

    let retMapData = mapData?.map((item, j) => {
      return {
        strSAPMappedField: item.strSAPMappedField,

        strSAPFieldName: item.strSAPFieldName,

        fieldVariableId: item?.isConst
          ? "0"
          : getVarDetails(variableList, item.strSAPFieldName)?.VariableId,

        fieldVarFieldId: item?.isConst
          ? "0"
          : getVarDetails(variableList, item.strSAPFieldName)?.VarFieldId,

        mappedFieldType: item?.isConst
          ? "C"
          : getVarDetails(variableList, item.strSAPFieldName)?.VariableScope,
      };
    });

    let json = {
      processDefId: localLoadedProcessData.ProcessDefId,

      strSAPdefName: defName,

      idefId: maxId,

      strSAPTCode: tCode,

      variableId: isTcodeConst
        ? "0"
        : getVarDetails(variableList, tCode).VariableId,

      varFieldId: isTcodeConst
        ? "0"
        : getVarDetails(variableList, tCode).VarFieldId,

      mappedFieldType: isTcodeConst
        ? "C"
        : getVarDetails(variableList, tCode).VariableScope,

      mapFieldMapping: Object.assign({}, retMapData),
    };

    if (isValid) {
      axios.post(SERVER_URL + ENDPOINT_ADD_SAP_DEF, json).then((res) => {
        if (res?.status === 200) {
          setDefList(tempDedList); //setting definition list in the definition list dropdown
        }
      });
      setDefName("");
      setTCode("");
    }
  };

  return (
    <>
      <div className={styles.formContainer}>
        <div className={styles.flexRow}>
          <div className={styles.defForm}>
            <div className={styles.defItem}>
              <p>
                {t("definition")} {t("name")}
                <span style={{ color: "#D53D3D" }}>*</span>
              </p>
              <TextInput
                classTag={styles.sapInput}
                name="defName"
                idTag="Sap_defName"
                readOnlyCondition={disabled}
                inputValue={defName}
                onChangeEvent={handleDefinition}
              />
            </div>
            <div className={styles.defItem}>
              <p
                style={{
                  marginInlineStart:
                    direction === RTL_DIRECTION ? "1rem" : "none",
                }}
              >
                {t("saptCode")} <span style={{ color: "#D53D3D" }}>*</span>
              </p>
              <CustomizedDropdown
                id="SAP_Workdesk_TCode"
                className={styles.dropdown}
                disabled={disabled}
                value={tCode}
                onChange={(e, isConstant) => {
                  handleTcode(e, isConstant);
                }}
                isConstant={isTcodeConst}
                setIsConstant={(val) => {
                  setIsTcodeConst(val);
                }}
                showConstValue={true}
                // MenuProps={menuProps}
                //menuItemStyles={styles.menuItemStyles}
              >
                {variableList?.map((_var, i) => {
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
            </div>
            <div className={styles.mapBtn}>
              <Button
                className={styles.addButton}
                id="sap_workdesk_map_btn"
                onClick={() => {
                  setShowMapping(true);
                }}
                disabled={addBtnDisable}
              >
                {t("mapping")}
              </Button>
            </div>
          </div>
          <div className={styles.defButtons}>
            <div className={styles.btnContainer}>
              <Button
                className={styles.addButton}
                id="sap_workdesk_map_btn"
                onClick={() => {
                  showForm(false);
                }}
              >
                {t("discard")}
              </Button>
            </div>
            <div className={styles.btnContainer}>
              <Button
                className={styles.saveBtn}
                id="sap_workdesk_map_btn"
                onClick={addDefinition}
                disabled={addBtnDisable}
              >
                {t("add")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showMapping ? (
        <Modal
          show={showMapping}
          //backDropStyle={{ backgroundColor: "transparent" }}
          style={{
            width: "50%",
            left: "25%",
            top: "21.5%",
            padding: "0px",
          }}
          modalClosed={false}
          children={
            <MappingPopup
              setShowMapping={setShowMapping}
              showMapping={showMapping}
              mapData={mapData}
              setMapData={setMapData}
              variableList={variableList}
            />
          }
        />
      ) : null}
    </>
  );
}

export default SapDefForm;
