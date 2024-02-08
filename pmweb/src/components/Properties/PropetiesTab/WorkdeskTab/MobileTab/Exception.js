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

function Exception(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const { isReadOnly } = props;
  const dispatch = useDispatch();
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [checked, setChecked] = useState({});
  const [allChecked, setAllChecked] = useState(false);
  const [exceptionItemData, setExceptionItemData] = useState([]);
  const allcheckRef = useRef();
  const exceptionNameRef = useRef([]);

  useEffect(() => {
    let tempCheck = {};
    let tempList = {
      ...localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskExceptions?.exceptionMap,
    };
    let tempExpList = {};
    Object.keys(tempList).forEach((el) => {
      let id = tempList[el]?.expTypeInfo?.expTypeId;
      tempExpList[id] = { ...tempList[el] };
      tempCheck[id] = false;
    });
    localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo?.objPMWdeskPDA?.m_arrAssociatedException?.forEach(
      (el) => {
        tempCheck[el] = true;
      }
    );
    setChecked(tempCheck);
    let allCheck = Object.keys(tempCheck)?.every((el) => {
      return tempCheck[el] === true;
    });
    setAllChecked(allCheck);
    setExceptionItemData(tempExpList);
  }, [localLoadedActivityPropertyData]);

  const CheckExpHandler = (val) => {
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
        temp?.ActivityProperty?.wdeskInfo?.objPMWdeskPDA
          ?.m_arrAssociatedException
      ) {
        temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_arrAssociatedException.push(
          val
        );
      } else {
        temp.ActivityProperty.wdeskInfo.objPMWdeskPDA = {
          ...temp.ActivityProperty.wdeskInfo.objPMWdeskPDA,
          m_arrAssociatedException: [val],
        };
      }
    } else {
      let idx = null;
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskPDA?.m_arrAssociatedException?.forEach(
        (el, index) => {
          if (+el === +val) {
            idx = index;
          }
        }
      );
      temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_arrAssociatedException.splice(
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
      Object.keys(exceptionItemData)?.forEach((val) => {
        tempList.push(val);
      });
      temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_arrAssociatedException =
        tempList;
    } else {
      temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_arrAssociatedException =
        [];
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
      {Object.keys(exceptionItemData)?.length > 0 ? (
        <div>
          <div className="row">
            <Checkbox
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.mainCheckbox
                  : styles.mainCheckbox
              }
              checked={allChecked}
              disabled={isReadOnly}
              onChange={() => allCheckHandler()}
              inputProps={{
                "aria-label":"mobile_exception"
              }}
              id="pmweb_workdesk_mobile_exception_checkbox"
              style={{
                // flex: "0.125",
                justifyContent: "left",
              }}
              inputRef={allcheckRef}
              onKeyUp={(e)=>{
                if(e.key === "Enter"){
                  allcheckRef.current.click();
                  e.stopPropagation();
                }
              }}
            />
            <h5
              style={{
                // flex: "1"
                paddingLeft: "1.5vw",
              }}
            >
              {t("exceptions")}
            </h5>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            {Object.keys(exceptionItemData)?.map((val, index) => {
              return (
                <div className="row">
                  <Checkbox
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.mainCheckbox
                        : styles.mainCheckbox
                    }
                    checked={checked[val]}
                    disabled={isReadOnly}
                    onChange={() => CheckExpHandler(val)}
                    inputProps={{
                      "aria-label":`mobile_exception_${exceptionItemData[val]?.expTypeInfo?.expTypeName}`
                    }}
                    id={`pmweb_workdesk_mobile_exception_${index}`}
                    style={{
                      // flex: "0.125",
                      justifyContent: "left",
                    }}
                    inputRef={(item) =>
                      (exceptionNameRef.current[index] = item)
                    }
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        exceptionNameRef.current[index].click();
                        e.stopPropagation();
                      }
                    }}
                  />
                  <span
                    className={styles.todoList}
                    style={{
                      // flex: "1"
                      paddingLeft: "1.5vw",
                    }}
                  >
                    {exceptionItemData[val]?.expTypeInfo?.expTypeName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Exception;
