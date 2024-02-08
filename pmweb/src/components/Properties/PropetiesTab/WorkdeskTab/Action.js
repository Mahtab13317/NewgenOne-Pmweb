import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./todo.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import ActivityRules from "../../../../components/Properties/PropetiesTab/ActivityRules";
import { store, useGlobalState } from "state-pool";
import EmptyStateIcon from "../../../../assets/ProcessView/EmptyState.svg";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { connect, useDispatch } from "react-redux";
import {
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { useRef } from "react";
import FormGroup from "@material-ui/core/FormGroup/FormGroup";

function Action(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [actionItemData, setActionItemData] = useState([]);
  const [checkAction, setCheckAction] = useState(false);
  const actionRef = useRef();
  /*code updated on 21 September 2022 for BugId 115467*/
  let isReadOnly =
    props.isReadOnly ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );
  const CheckActionHandler = (e) => {
    /* let val;
    setCheckAction((prev) => {
      val = !prev;
      return !prev;
    }); */
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (temp?.ActivityProperty?.wdeskInfo) {
      if (temp?.ActivityProperty?.wdeskInfo?.m_objActionDetails) {
        let valTemp =
          temp?.ActivityProperty?.wdeskInfo?.m_objActionDetails
            ?.m_bSelectAction;
        if (valTemp === false || valTemp === true) {
          temp.ActivityProperty.wdeskInfo.m_objActionDetails.m_bSelectAction =
            e.target.checked;
        } else {
          temp.ActivityProperty.wdeskInfo.m_objActionDetails = {
            ...temp.ActivityProperty.wdeskInfo.m_objActionDetails,
            m_bSelectAction: e.target.checked,
          };
        }
      } else {
        temp.ActivityProperty.wdeskInfo = {
          ...temp.ActivityProperty.wdeskInfo,
          m_objActionDetails: {
            m_bSelectAction: e.target.checked,
          },
        };
      }
    } else {
      temp.ActivityProperty = {
        ...temp.ActivityProperty,
        wdeskInfo: {
          m_objActionDetails: {
            m_bSelectAction: e.target.checked,
          },
        },
      };
    }

    setCheckAction(e.target.checked);
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  useEffect(() => {
    let tempArr = [];
    let tempList = {
      ...localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.m_objActionDetails?.actionMap,
    };

    Object.keys(tempList).forEach((el) => {
      tempArr.push(tempList[el]);
    });

    setActionItemData(tempArr);
    setCheckAction(
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.m_objActionDetails?.m_bSelectAction
    );
  }, [localLoadedActivityPropertyData]);

  return (
    <div>
      <div className={styles.checklist} style={{ padding: "0 0.75vw" }}>
        <FormGroup>
          <FormControlLabel
            label={<div>{t("action")}</div>}
            control={
              <Checkbox
                checked={checkAction}
                onChange={CheckActionHandler}
                id="pmweb_workdesk_action_checkBox"
                disabled={isReadOnly}
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.mainCheckbox
                    : styles.mainCheckbox
                }
                data-testid="CheckAction"
                type="checkbox"
                inputRef={actionRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    actionRef.current.click();
                    e.stopPropagation();
                  }
                }}
              />
            }
          />
        </FormGroup>
      </div>
      {checkAction ? (
        <div data-testid="ActionDiv">
          <ActivityRules calledFromAction={true} actionData={actionItemData} />
        </div>
      ) : (
        <div className={styles.emptyStateDiv}>
          <img
            className={styles.emptyStateImg}
            src={EmptyStateIcon}
            alt={t("clickOnActionCheckbox")}
          />
          <p className={styles.emptyStateText}>{t("clickOnActionCheckbox")}</p>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
  };
};

export default connect(mapStateToProps, null)(Action);
