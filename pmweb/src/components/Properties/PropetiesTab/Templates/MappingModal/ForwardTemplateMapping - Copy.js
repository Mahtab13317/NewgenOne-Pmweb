import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import "./index.css";
import "../index.css";
import { Checkbox, MenuItem, Select } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";
import { Label } from "@material-ui/icons";
import { useState } from "react";

function ForwardTemplateMapping(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let {
    schemaList,
    template,
    setUpdatedTemplate,
    checked,
    setChecked,
    isReadOnly,
  } = props;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const VarNameRef = useRef([]);
  const [localLoadedActivityPropertyData] = useGlobalState(
    loadedActivityPropertyData
  );
  const variableDefinition = localLoadedProcessData?.Variable?.filter(
    (el) => el.VariableType !== "11"
  );
  const [checkedList, setCheckedList] = useState([]);

  useEffect(() => {
    let checkedTempObj = {};
    schemaList?.forEach((val) => {
      if (template.FwdVarMapping) {
        let isTemplateFound = false;
        template.FwdVarMapping.forEach((temp) => {
          if (
            val.name === temp.templateVarName &&
            temp.mappedName?.trim() !== ""
          ) {
            isTemplateFound = true;
            checkedTempObj = {
              ...checkedTempObj,
              [val.name]: { isChecked: true, mappedValue: temp.mappedName },
            };
          } else if (!isTemplateFound) {
            checkedTempObj = {
              ...checkedTempObj,
              [val.name]: { isChecked: false, mappedValue: null },
            };
          }
        });
      } else {
        checkedTempObj = {
          ...checkedTempObj,
          [val.name]: { isChecked: false, mappedValue: null },
        };
      }

    
    });
    
    const tempCheckList=Object.values(checkedTempObj)
    setCheckedList(tempCheckList)
   // console.log("@@@","Checked Array", tempCheckList);
    setChecked(checkedTempObj);
  }, [schemaList]);


  


  

  const checkForVarRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item, i) => {
        if (+item?.processVarInfo?.variableId === +data.VariableId) {
          if (
            item?.m_strFetchedRights === "O" ||
            item?.m_strFetchedRights === "R" ||
            item?.m_strFetchedRights === "A"
          ) {
            temp = true;
          }
        }
      }
    );
    return temp;
  };

  const getVarListByType = (varList, item) => {
    console.log("@@@","VARLIST",varList,"ITEM",item)
    let varType = item?.type;
    let list = [];
    varList?.forEach((el) => {
      if (
        el.VariableScope === "M" ||
        el.VariableScope === "S" ||
        (el.VariableScope === "U" && checkForVarRights(el)) ||
        (el.VariableScope === "I" && checkForVarRights(el))
      ) {
        let type = el.VariableType;
        if (+varType === +type) {
          list.push(el);
        }
      }
    });
    return list;
  };

  const updateForwardMapping = (tempName, value) => {
    setChecked((prev) => {
      let temp = { ...prev };
      temp[tempName].mappedValue = value;
      return temp;
    });
    let variable = variableDefinition?.filter(
      (el) => el.VariableName === value
    )[0];
    setUpdatedTemplate((prev) => {
      let temp = { ...prev };
      temp.FwdVarMapping = (
        prev.FwdVarMapping ? prev.FwdVarMapping : schemaList
      ).map((el) => {
        if (
          (prev.FwdVarMapping && el.templateVarName === tempName) ||
          (!prev.FwdVarMapping && el.name === tempName)
        ) {
          return {
            varScope: variable.VariableScope,
            templateVarType: prev.FwdVarMapping ? el.templateVarType : el.type,
            minOccurs: el.minOccurs,
            orderId: el.orderId,
            templateVarName: prev.FwdVarMapping ? el.templateVarName : el.name,
            maxOccurs: el.maxOccurs,
            mappedName: value,
            varId: +variable.VariableId,
            varFieldId: +variable.VarFieldId,
          };
        } else {
          return {
            varScope: el.varScope,
            templateVarType: prev.FwdVarMapping ? el.templateVarType : el.type,
            minOccurs: el.minOccurs,
            orderId: el.orderId,
            templateVarName: prev.FwdVarMapping ? el.templateVarName : el.name,
            maxOccurs: el.maxOccurs,
            mappedName: el.mappedName,
            varId: el.varId,
            varFieldId: el.varFieldId,
          };
        }
      });
      return temp;
    });
  };


  const getMappedVar=(mappedValue,data,varList)=>{

    console.log("@@@@","Checked Array",checkedList,"DATA",data,"CHECKED",checked)
    if(mappedValue!==null)
    {
     // const filterArray=varList.filter(d=>d.variableName===mappedValue);
      console.log("@@@","Filter Array", varList);
    }

  }
  

 /*  useEffect(() => {
    console.log("@@@","Checked Array", checkedList);
    const tempCheckList=Object.values(checked)
    setCheckedList(tempCheckList)
    schemaList?.forEach((data,i)=>{
        const mapVal=checked[data.name]?.mappedValue;
      const filterArray=getVarListByType(variableDefinition, data).filter(d=>d.variableName===mapVal)
      console.log("@@@","Filter Array", filterArray);
      //getMappedVar(mapVal,filterArray)
    })
    console.log("@@@","Checked Array", tempCheckList,checked);

  }, []) */
  

  

  return (
    <div className={styles.mainDiv}>
      <div className={styles.headerDiv}>
        <p
          className={
            direction === RTL_DIRECTION ? arabicStyles.iconDiv : styles.iconDiv
          }
        ></p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.variableName
              : styles.variableName
          }
        >
          {t("TemplateVariables")}
        </p>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.dataType
              : styles.dataType
          }
        >
          {t("CurrentProcessVariable(s)")}
        </p>
      </div>
      <div className={styles.bodyDiv}>
        {schemaList?.map((d, index) => {
          return (
            <div className={styles.dataDiv}>
              <p
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.iconDiv
                    : styles.iconDiv
                }
              >
              {
                getMappedVar(checked[d.name]?.mappedValue,d,getVarListByType(variableDefinition, d))
              }
             
                <Checkbox
                  inputProps={{"aria-label":`${d.name}`}}
                  //checked={checked[d.name] ? checked[d.name].isChecked : false}
                 checked={checkedList?.length>0 ? checkedList[index]?.isChecked:false}
               // checked={getMappedVar(checked[d.name]?.mappedValue,d)}
                  onChange={(e) => {
                    setChecked((prev) => {
                      let temp = { ...prev };
                      temp[d.name].isChecked = e.target.checked;
                      return temp;
                    });
                  }}
                  disabled={isReadOnly}
                  id={`pmweb_oms_${d.name}_check`}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.omsTemplateCheckbox
                      : styles.omsTemplateCheckbox
                  }
                  inputRef={(item) => (VarNameRef.current[index] = item)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      VarNameRef.current[index].click();
                      e.stopPropagation();
                    }
                  }}
                />
              </p>
              <p
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.variableNameData
                    : styles.variableNameData
                }
              >
                {d.name}
                {+d.minOccurs > 0 ? (
                  <span className={styles.starIcon}>*</span>
                ) : null}
              </p>
              <p
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.dataTypeValue
                    : styles.dataTypeValue
                }
                
              >
                 <label htmlFor={`Current_Process_Variable_dropdown_${d.name}`} style={{display:"none"}}>Current_Process_Variable_dropdown</label>
                <Select
                  className={
                    direction === RTL_DIRECTION
                      ? `templatePropSelect ${arabicStyles.templatePropSelect}`
                      : `templatePropSelect ${styles.templatePropSelect}`
                  }
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
                  }}
                  inputProps={{
                    readOnly:
                      (checked[d.name] && !checked[d.name].isChecked) ||
                      isReadOnly,
                      id:`Current_Process_Variable_dropdown_${d.name}`,
                      "aria-label":`Current_Process_Variable_dropdown_${d.name}`
                  }}
                  style={{
                    backgroundColor:
                      checked[d.name] && !checked[d.name].isChecked
                        ? "#f8f8f8"
                        : "#fff",
                  }}
                  value={checked[d.name] ? checked[d.name].mappedValue : null}
                  id={`pmweb_${d.name}_select`}
                  onChange={(e) => {
                    updateForwardMapping(d.name, e.target.value);
                  }}
                >
                  {getVarListByType(variableDefinition, d)?.map((ele) => {
                    return (
                      <MenuItem
                        value={ele.VariableName}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.templateDropdownData
                            : styles.templateDropdownData
                        }
                      >
                        {ele.VariableName}
                      </MenuItem>
                    );
                  })}
                </Select>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ForwardTemplateMapping;
