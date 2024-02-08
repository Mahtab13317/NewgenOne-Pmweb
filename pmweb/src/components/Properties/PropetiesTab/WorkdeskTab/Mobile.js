import React, { useState, useEffect } from "react";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import "./index.css";
import Tabs from "../../../../UI/Tab/Tab.js";
import Todo from "./MobileTab/Todo";
import Exception from "./MobileTab/Exception";
import Document from "./MobileTab/Document";
import Variable from "./MobileTab/Variable";
import styles from "./MobileTab/index.module.css";
import arabicStyles from "./MobileTab/ArabicStyles.module.css";
import {
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { Checkbox } from "@material-ui/core";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { useRef } from "react";

function Mobile(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [checkMobile, setCheckMobile] = useState(false);
  const mobileRef = useRef();
  const dispatch = useDispatch();
  let isReadOnly =
    props.isReadOnly ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  useEffect(() => {
    setCheckMobile(
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskPDA?.m_bchkBoxChecked
    );
  }, [localLoadedActivityPropertyData]);

  const CheckMobileHandler = () => {
    let val;
    setCheckMobile((prev) => {
      val = !prev;
      return !prev;
    });
    let temp = { ...localLoadedActivityPropertyData };
    if (temp?.ActivityProperty?.wdeskInfo) {
      if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskPDA) {
        let valTemp =
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskPDA?.m_bchkBoxChecked;
        if (valTemp === false || valTemp === true) {
          temp.ActivityProperty.wdeskInfo.objPMWdeskPDA.m_bchkBoxChecked = val;
        } else {
          temp.ActivityProperty.wdeskInfo.objPMWdeskPDA = {
            ...temp.ActivityProperty.wdeskInfo.objPMWdeskPDA,
            m_bchkBoxChecked: val,
          };
        }
      } else {
        temp.ActivityProperty.wdeskInfo = {
          ...temp.ActivityProperty.wdeskInfo,
          objPMWdeskPDA: {
            m_bchkBoxChecked: val,
          },
        };
      }
    } else {
      temp.ActivityProperty = {
        ...temp.ActivityProperty,
        wdeskInfo: {
          objPMWdeskPDA: {
            m_bchkBoxChecked: val,
          },
        },
      };
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <div className={styles.flexColumn}>
      <div className={styles.checklist}>
        <Checkbox
          inputProps={{
            "aria-label": "mobile",
          }}
          checked={checkMobile}
          onChange={() => CheckMobileHandler()}
          disabled={isReadOnly}
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.mainCheckbox
              : styles.mainCheckbox
          }
          data-testid="CheckMobile"
          type="checkbox"
          inputRef={mobileRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              mobileRef.current.click();
              e.stopPropagation();
            }
          }}
        />
        {t("mobile")}
      </div>
      {checkMobile ? (
        <div className={styles.mobileTabDiv}>
          <Tabs
            tabType="processSubTab"
            tabContentStyle="processSubTabContentStyle"
            tabBarStyle="processSubTabBarStyle"
            oneTabStyle="processSubOneTabStyle"
            tabStyling="processViewTabs"
            tabsStyle="processViewSubTabs"
            TabNames={[
              t("todo"),
              t("exception(s)"),
              t("document"),
              t("variable"),
            ]}
            TabElement={[
              <Todo isReadOnly={isReadOnly} />,
              <Exception isReadOnly={isReadOnly} />,
              <Document isReadOnly={isReadOnly} />,
              <Variable isReadOnly={isReadOnly} />,
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
  };
};

export default connect(mapStateToProps, null)(Mobile);
