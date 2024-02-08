import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import { useTranslation } from "react-i18next";
import {
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import { useDispatch } from "react-redux";
import FilterRules from "./FilterRules";
import { useState } from "react";
import { useEffect } from "react";
import { store, useGlobalState } from "state-pool";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";

function FilterPopup(props) {
  let { t } = useTranslation();
  const actProperty = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(actProperty);
  const direction = `${t("HTML_DIR")}`;
  const [filterData, setFilterData] = useState([]); //local state to show the all filter condition in dropdowns
  const [critireaSatatement, setCritireaSatatement] = useState(""); // local state to show filter critera in a teaxtarea box in popup
  const dispatch = useDispatch();

  useEffect(() => {
    props.taskInfo?.m_arrUGInfoList?.forEach((data) => {
      if (
        `${data.m_strID}_${data.m_strName}_${data.m_strType}` ===
        props.filterKey
      ) {
        if (data?.esRuleList?.length > 0) {
          setCritireaSatatement(props?.filterCriterea?.trim());
          setFilterData(data?.esRuleList[0]?.ruleCondList);
        }
      }
    });
  }, [props.taskInfo?.m_arrUGInfoList, props.filterKey, props.filterCriterea]);

  const changeFilterData = (data) => {
    setFilterData(data);
  };

  const saveFilter = () => {
    let tempCriteria = [...props?.userFilterList];
    let tempGroupCriteria = [...props?.userFilterList];
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );

    tempLocalState?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap[
      props?.taskInfo?.taskTypeInfo?.taskName
    ].m_arrUGInfoList?.forEach((data, i) => {
      if (
        `${data.m_strID}_${data.m_strName}_${data.m_strType}` ==
        props?.filterKey
      ) {
        data.esRuleList = [
          {
            ruleCondList: [...filterData],
            ruleId: 1,
            ruleType: "T",
            ruleOrderId: 1,
          },
        ];
        if (data.m_strType === "G") {
          tempGroupCriteria[i] = critireaSatatement;
        } else {
          tempCriteria[i] = critireaSatatement;
        }
      }
    });
    props?.setUserFilterList(tempCriteria);
    props?.setGroupFilterList(tempGroupCriteria);
    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
    props?.setShowFilter(false);
  };

  return (
    <div>
      <div className={styles.modalHeader}>
        <h3
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.modalHeading
              : styles.modalHeading
          }
        >
          {t("add")} {t("Filters")}
        </h3>
        <CloseIcon
          onClick={() => {
            props?.setShowFilter(false);
          }}
          className={styles.closeIcon}
          id="Pmweb_FilterPopup_addFilter_CloseIcon"
        />
      </div>
      <p className={styles.modalSubHeading}></p>
      <div className={styles.filterALBody}>
        <div className={styles.filterRules}>
          <FilterRules
            filterData={filterData}
            critireaSatatement={critireaSatatement}
            setCritireaSatatement={setCritireaSatatement}
            changeFilterData={changeFilterData}
          />
        </div>
        <hr className={styles.separator} />
        <div className={styles.filterCriteraSection}>
          <p className={styles.listHeading}>
            {t("filter")} {t("criteria")}
          </p>
          <textarea
            className={styles.filterALTextArea}
            value={critireaSatatement}
            disabled
          />
        </div>
      </div>
      <div className={styles.modalFooter}>
        <button
          className={
            direction === RTL_DIRECTION
              ? styles.cancelButtonRTL
              : styles.cancelButton
          }
          onClick={() => {
            props?.setShowFilter(false);
          }}
          id="pmweb_FilterPopup_showfilter_close_button"
        >
          {t("Close")}
        </button>
        <button
          className={
            direction === RTL_DIRECTION
              ? styles.saveButtonRTL
              : styles.saveButton
          }
          onClick={saveFilter}
          id="pmweb_FilterPopup_savefilter_save_button"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
}

export default FilterPopup;
