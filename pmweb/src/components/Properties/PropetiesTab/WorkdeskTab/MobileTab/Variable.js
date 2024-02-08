import React, { useState, useEffect , useRef} from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import { Checkbox } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import arabicStyles from "./ArabicStyles.module.css";
import {
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../../Constants/appConstants";
import { useDispatch } from "react-redux";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";

function Variable(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const { isReadOnly } = props;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [varItemData, setVarItemData] = useState([]);
  const [checked, setChecked] = useState({});
  const [allChecked, setAllChecked] = useState(false);
  const allcheckRef = useRef();
  const varNameRef = useRef([]);

  useEffect(() => {
    let tempCheck = {};
    let tempList = [
      ...localLoadedActivityPropertyData?.ActivityProperty
        ?.m_objDataVarMappingInfo?.dataVarList,
    ];
    let tempVarList = {};
    tempList?.forEach((el) => {
      let id = el?.processVarInfo?.variableId;
      tempVarList[id] = { ...el };
      tempCheck[id] = false;
    });
    localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo?.objPMWdeskPDA?.m_arrAssociatedVar?.forEach(
      (el) => {
        tempCheck[el] = true;
      }
    );
    setChecked(tempCheck);
    let allCheck = Object.keys(tempCheck)?.every((el) => {
      return tempCheck[el] === true;
    });
    setAllChecked(allCheck);
    setVarItemData(tempVarList);
  }, [localLoadedActivityPropertyData]);

  const CheckVarHandler = (val) => {
    let tempCheck = { ...checked };
    tempCheck = { ...tempCheck, [val]: !tempCheck[val] };
    setChecked(tempCheck);
    let allCheck = Object.keys(tempCheck)?.every((el) => {
      return tempCheck[el] === true;
    });
    setAllChecked(allCheck);

    let temp = { ...localLoadedActivityPropertyData };
    if (tempCheck[val]) {
      if (
        temp?.ActivityProperty?.wdeskInfo?.objPMWdeskPDA?.m_arrAssociatedVar
      ) {
        temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_arrAssociatedVar.push(
          val
        );
      } else {
        temp.ActivityProperty.wdeskInfo.objPMWdeskPDA = {
          ...temp.ActivityProperty.wdeskInfo.objPMWdeskPDA,
          m_arrAssociatedVar: [val],
        };
      }
    } else {
      let idx = null;
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskPDA?.m_arrAssociatedVar?.forEach(
        (el, index) => {
          if (+el === +val) {
            idx = index;
          }
        }
      );
      temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_arrAssociatedVar.splice(
        idx,
        1
      );
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const allCheckHandler = () => {
    let allCheck = !allChecked;
    setAllChecked(allCheck);
    let tempCheck = { ...checked };
    Object.keys(tempCheck)?.forEach((val) => {
      tempCheck = { ...tempCheck, [val]: allCheck };
    });
    setChecked(tempCheck);
    let temp = { ...localLoadedActivityPropertyData };
    if (allCheck) {
      let tempList = [];
      Object.keys(varItemData)?.forEach((val) => {
        tempList.push(val);
      });
      temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_arrAssociatedVar =
        tempList;
    } else {
      temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_arrAssociatedVar = [];
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <div className={styles.documentRow}>
      {Object.keys(varItemData)?.length > 0 ? (
        <div>
          <div className="row">
            <h5 style={{ flex: "1" }}>{t("Variables")}</h5>
            <div className="row" style={{ flex: "1" }}>
              <Checkbox
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.mainCheckbox
                    : styles.mainCheckbox
                }
                checked={allChecked}
                disabled={isReadOnly}
                onChange={() => allCheckHandler()}
                id="pmweb_workdesk_mobile_mobility_checkBox"
                inputProps={{
                  "aria-label":"mobile_mobility"
                }}
                inputRef={allcheckRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    allcheckRef.current.click();
                    e.stopPropagation();
                  }
                }}
              />
              <h5>{t("Mobility")}</h5>
            </div>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            {Object.keys(varItemData)?.map((val, index) => {
              return (
                <div className="row">
                  <span className={styles.todoList} style={{ flex: "1" }}>
                    {varItemData[val]?.processVarInfo?.varName}
                  </span>
                  <div className="row" style={{ flex: "1" }}>
                    <Checkbox
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.mainCheckbox
                          : styles.mainCheckbox
                      }
                      checked={checked[val]}
                      disabled={isReadOnly}
                      onChange={(e) => CheckVarHandler(val)}
                      inputProps={{
                        "aria-label":`mobile_mobility_`
                      }}
                      id={`pmweb_workdesk_mobile_mobility_${index}`}
                      inputRef={(item) =>
                        (varNameRef.current[index] = item)
                      }
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          varNameRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Variable;
