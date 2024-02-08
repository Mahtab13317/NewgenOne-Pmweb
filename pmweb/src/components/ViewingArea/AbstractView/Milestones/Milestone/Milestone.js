import React, { useState, useEffect, useLayoutEffect } from "react";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import "./Milestone.css";
import { ClickAwayListener } from "@material-ui/core";
import c_Names from "classnames";
import { useTranslation } from "react-i18next";
import { renameMilestone } from "../../../../../utility/CommonAPICall/RenameMilestone";
import "./MilestoneArabic.css";
import {
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  RTL_DIRECTION,
  userRightsMenuNames,
} from "../../../../../Constants/appConstants";
import { useDispatch, useSelector } from "react-redux";
import { UserRightsValue } from "../../../../../redux-store/slices/UserRightsSlice";
import { getMenuNameFlag } from "../../../../../utility/UserRightsFunctions";
import { useRef } from "react";
import { FieldValidations } from "../../../../../utility/FieldValidations/fieldValidations";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Modal from "../../../../../UI/ActivityModal/Modal";
import {
  deleteMilestoneActivity,
  deleteMilestoneArray,
} from "../../../../../utility/InputForAPICall/deleteMilestoneArray";
import { deleteMilestone } from "../../../../../utility/CommonAPICall/DeleteMilestone";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import okRename from "../../../../../assets/abstractView/okRename.svg";
import cancelRename from "../../../../../assets/abstractView/cancelRename.svg";
import { validateEntity } from "../../../../../utility/abstarctView/addWorkstepAbstractView";

/*code added on 8 August 2022 for BugId 112903*/
const Mile = (props) => {
  const userRightsValue = useSelector(UserRightsValue);
  //t is our translation function
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [showDragIcon, setShowDragIcon] = useState(false);
  const { provided, MileName, isReadOnly } = props;
  /* code added on 14 July 2023 for BugId 130845 - oracle>>renaming and deletion of segment should be 
  restricted in Enabled/deployed version */
  let isReadOnlyVal =
    isReadOnly ||
    props.processData.ProcessType === PROCESSTYPE_REGISTERED ||
    props.processData.ProcessType === PROCESSTYPE_DEPLOYED;
  const [mileNameValue, setMileNameValue] = useState("");
  const [mileRenamed, setMileRenamed] = useState(null);
  const mileNameRef = useRef();
  const dispatch = useDispatch();

  // Boolean that decides whether create milestone button will be visible or not.
  const createMilestoneRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createMilestone
  );
  // Boolean that decides whether user can modify milestone.
  const modifyMilestoneRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.modifyMilestone
  );
  // Boolean that decides whether user can delete milestone.
  const deleteMilestoneRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.deleteMilestone
  );

  useLayoutEffect(() => {
    if (isReadOnlyVal || !modifyMilestoneRightsFlag) {
      mileNameRef.current.style.setProperty("border", "none", "important");
      mileNameRef.current.style.setProperty(
        "background-color",
        "transparent",
        "important"
      );
      mileNameRef.current.style.setProperty("color", "black", "important");
    }
  }, []);

  useEffect(() => {
    if (MileName) {
      setMileNameValue(MileName);
    }
  }, [MileName]);

  const mileNameChangeHandler = (e, index) => {
    setMileNameValue(e.target.value);
  };

  const mileNameonKeydown = () => {
    if (mileNameValue !== props.MileName && mileNameValue?.trim() !== "") {
      let [isValid, errMsg] = validateEntity(
        mileNameValue,
        t,
        t("SegmentName")
      );
      if (isValid) {
        // code edited on 6 Dec 2022 for BugId 119955
        let mileNameExists = false,
          errorMsg;
        props.processData.MileStones?.forEach((milestone) => {
          if (
            milestone.MileStoneName?.toLowerCase() ===
              mileNameValue?.toLowerCase() &&
            !mileNameExists
          ) {
            mileNameExists = true;
            errorMsg = t("entitySameNameError", {
              entityName: t("milestoneName"),
            });
          } else if (!mileNameExists) {
            milestone?.Activities?.forEach((act) => {
              if (
                act.ActivityName?.toLowerCase() ===
                  mileNameValue?.toLowerCase() &&
                !mileNameExists
              ) {
                mileNameExists = true;
                errorMsg = t("entity1_SameEntity2NameError", {
                  Entity1: t("SegmentName"),
                  Entity2: t("Activity"),
                });
              }
            });
          }
        });
        if (!mileNameExists) {
          props.processData.Lanes?.forEach((swimlane) => {
            if (
              swimlane.LaneName?.toLowerCase() ===
                mileNameValue?.toLowerCase() &&
              !mileNameExists
            ) {
              mileNameExists = true;
              errorMsg = t("entity1_SameEntity2NameError", {
                Entity1: t("SegmentName"),
                Entity2: t("swimlaneName"),
              });
            }
          });
        }
        if (!mileNameExists) {
          renameMilestone(
            props.MileId,
            props.processData.MileStones[props.index].MileStoneName,
            mileNameValue,
            props.setprocessData,
            props.processData.ProcessDefId,
            false
          );
        } else {
          setMileNameValue(props.MileName);
          dispatch(
            setToastDataFunc({
              message: errorMsg,
              severity: "error",
              open: true,
            })
          );
        }
      } else {
        dispatch(
          setToastDataFunc({
            message: errMsg,
            severity: "error",
            open: true,
          })
        );
      }
    } else if (mileNameValue?.trim() === "") {
      setMileNameValue(props.MileName);
      dispatch(
        setToastDataFunc({
          message: t("EntityCantBeBlank", {
            entityName: t("SegmentName"),
          }),
          severity: "error",
          open: true,
        })
      );
    }
  };

  const getActionName = (actionName) => {
    if (actionName === t("delete")) {
      let mileArray,
        mileAct,
        isDefaultMile = false;
      mileArray = deleteMilestoneArray(props.processData, props.MileId);
      mileAct = deleteMilestoneActivity(props.processData, props.MileId);
      //code added on 14 Oct 2022 for BugId 117104
      props.processData.MileStones?.forEach((item) => {
        if (+item.iMileStoneId === +props.MileId) {
          item.Activities?.forEach((act) => {
            if (act.PrimaryActivity === "Y") {
              isDefaultMile = true;
            }
          });
        }
      });
      if (isDefaultMile) {
        dispatch(
          setToastDataFunc({
            message: t("milestone/swimlaneCantBeDeleted"),
            severity: "error",
            open: true,
          })
        );
      } else {
        deleteMilestone(
          props.MileId,
          props.setprocessData,
          props.processData.ProcessDefId,
          mileArray.array,
          mileArray.index,
          props.processData.ProcessType,
          mileAct.activityNameList,
          mileAct.activityIdList,
          dispatch
        );
      }
    } else if (actionName === t("Rename")) {
      mileNameRef.current.select();
      mileNameRef.current.focus();
    }
  };

  const getOptionsForMoreIconMilestone = () => {
    let milestoneActionOptions = [];
    /* code added on 14 July 2023 for BugId 130845 - oracle>>renaming and deletion of segment should be 
    restricted in Enabled/deployed version */
    if (
      props.processData.ProcessType === PROCESSTYPE_LOCAL ||
      props.processData.ProcessType === PROCESSTYPE_LOCAL_CHECKED
    ) {
      if (modifyMilestoneRightsFlag) {
        milestoneActionOptions.push(t("Rename"));
      }
      if (deleteMilestoneRightsFlag) {
        milestoneActionOptions.push(t("delete"));
      }
    }
    return milestoneActionOptions;
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        setMileNameValue(props.MileName);
        setMileRenamed(null);
      }}
    >
      <div
        className={c_Names({
          milestoneArrowFull: props.index === 0 && direction !== RTL_DIRECTION,
          milestoneArrow: props.index !== 0 && direction !== RTL_DIRECTION,
          milestoneArrowEnd:
            +props.index === props.length - 1 && direction !== RTL_DIRECTION,

          milestoneArrowFullArabic:
            props.index === 0 && direction === RTL_DIRECTION,
          milestoneArrowArabic:
            props.index !== 0 && direction === RTL_DIRECTION,
          milestoneArrowEndArabic:
            +props.index === props.length - 1 && direction === RTL_DIRECTION,
        })}
        id={`pmweb_mileMain_${props.MileId}`}
        onClick={() => props.selectMileHandler(props.Mile)}
        title={props.MileName}
      >
        <div
          className={
            direction === RTL_DIRECTION ? "beforeDivArabic" : "beforeDiv"
          }
        ></div>
        <div
          className={
            direction === RTL_DIRECTION
              ? "milestonePositionArabic"
              : "milestonePosition"
          }
          id={`pmweb_mileMainContent_${props.MileId}`}
          onMouseOver={() => {
            //ifReadOnly -> dragDrop must not work
            if (!isReadOnlyVal) {
              setShowDragIcon(true);
            }
          }}
          onMouseLeave={() => {
            //ifReadOnly -> dragDrop must not work
            if (!isReadOnlyVal) {
              setShowDragIcon(false);
            }
          }}
        >
          {showDragIcon &&
          modifyMilestoneRightsFlag &&
          (props.processType === PROCESSTYPE_LOCAL ||
            props.processType === PROCESSTYPE_LOCAL_CHECKED) ? (
            <div
              className="dragIconHandle"
              {...provided.dragHandleProps}
              tabIndex={-1}
            >
              <DragIndicatorIcon
                style={{
                  height: "1.75rem",
                  width: "1.75rem",
                }}
              />
            </div>
          ) : (
            <div
              className={c_Names({
                mileIndexDiv: direction !== RTL_DIRECTION,
                mileIndexDivArabic: direction === RTL_DIRECTION,
              })}
              style={{
                width: mileRenamed === props.MileId ? "2rem" : "1.75rem",
              }}
            >
              {props.index + 1 + "."}
            </div>
          )}
          <input
            className="milestoneInput"
            placeholder={t("milestone.placeholder")}
            aria-label={props.MileName}
            onChange={(e) => {
              if (mileRenamed === null) {
                setMileRenamed(props.MileId);
              }
              mileNameChangeHandler(e, props.index);
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" && e.target.value?.trim()?.length > 0) {
                mileNameonKeydown();
              }
              if (e.code === "Tab") {
                setMileNameValue(props.MileName);
                setMileRenamed(null);
              }
            }}
            id={`mileNameDiv_${props.MileId}`}
            value={mileNameValue}
            ref={mileNameRef}
            onKeyPress={(e) => {
              FieldValidations(e, 180, mileNameRef.current, 30);
            }}
            disabled={isReadOnlyVal || !modifyMilestoneRightsFlag}
          />
          {mileRenamed === props.MileId ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5vw",
                marginInlineEnd: "1vw",
                marginInlineStart: "0.5vw",
              }}
            >
              <img
                src={cancelRename}
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  cursor: "pointer",
                }}
                id={`pmweb_mileCancelRename_${props.MileId}`}
                onClick={() => {
                  setMileNameValue(props.MileName);
                  setMileRenamed(null);
                }}
                alt="Cancel Rename"
              />
              <img
                src={okRename}
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  cursor: "pointer",
                }}
                id={`pmweb_mileOkRename_${props.MileId}`}
                alt="Ok Rename"
                onClick={mileNameonKeydown}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                // modified on 11/09/2023 for BugId 136725
                flexDirection: "row",
                height: "100%",
              }}
            >
              {(modifyMilestoneRightsFlag || deleteMilestoneRightsFlag) &&
                !isReadOnlyVal &&
                getOptionsForMoreIconMilestone()?.length > 0 && (
                  <Modal
                    backDrop={false}
                    getActionName={getActionName}
                    modalPaper="modalPaperMile"
                    sortByDiv="sortByDivActivity"
                    sortByDiv_arabic="sortByDiv_arabicActivity"
                    oneSortOption="oneSortOptionActivity"
                    showTickIcon={false}
                    sortSectionOne={getOptionsForMoreIconMilestone()}
                    buttonToOpenModal={
                      <div
                        className={
                          direction === RTL_DIRECTION
                            ? "threeDotsButtonMileArabic"
                            : "threeDotsButtonMile"
                        }
                        id={`pmweb_mileMoreBtn_${props.MileId}`}
                        tabIndex={0}
                      >
                        <MoreVertIcon
                          style={{
                            color: "#606060",
                            height: "1.25rem",
                            width: "1.25rem",
                            marginLeft: "auto",
                          }}
                        />
                      </div>
                    }
                    modalWidth="180"
                    dividerLine="dividerLineActivity"
                    isArabic={false}
                    processType={props.processType}
                  />
                )}
              {isReadOnlyVal
                ? null
                : createMilestoneRightsFlag && (
                    <button
                      className="addBetween icon-button"
                      id={`pmweb_mileAddBtn_${props.MileId}`}
                      onClick={() => props.addInBetweenNewMile(props.index)}
                      //Resolve the bug ID 125295
                      style={{ cursor: "pointer" }}
                      tabIndex={-1}
                    >
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? "addIconArabic"
                            : "addIcon"
                        }
                        tabIndex={0}
                      >
                        +
                      </p>
                    </button>
                  )}
            </div>
          )}
        </div>
        <div className="spaceAfterMile"></div>
        <div
          className={
            direction === RTL_DIRECTION ? "afterDivArabic" : "afterDiv"
          }
        ></div>
      </div>
    </ClickAwayListener>
  );
};

export default Mile;
