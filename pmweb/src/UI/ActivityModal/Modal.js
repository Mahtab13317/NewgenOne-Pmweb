import React, { useState, useEffect } from "react";
import "./Modal.css";
import Backdrop from "../Backdrop/Backdrop";
import { ClickAwayListener } from "@material-ui/core";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  RTL_DIRECTION,
} from "../../Constants/appConstants";
import { LightTooltip } from "../StyledTooltip";
import { shortenRuleStatement } from "../../utility/CommonFunctionCall/CommonFunctionCall";
import { useTranslation } from "react-i18next";

export default function SimpleModal(props) {
  const [open, setOpen] = useState(props.open ? true : false);
  let sortSectionOne = props.sortSectionOne;
  let sortSectionThree = props.sortSectionThree;
  let sortSectionFour = props.sortSectionFour;
  let sortSectionTwo = props.sortSectionTwo;
  let sortSectionLocalProcess = props.sortSectionLocalProcess;
  let selectedSortByIndex = 0;
  let selectedSortOrderIndex = 0;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  // code changes on 05-09-2023 for bug Id 135241
  useEffect(() => {
    setOpen(props.open ? true : false);
  }, [props.open]);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    if (props.handleClose) {
      props.handleClose();
    }
  };

  const commonDiv = (index, option, selectedIndex) => {
    if (!option) {
      return;
    }
    return (
      <div
        onClick={(event) => {
          event.stopPropagation();
          if (
            option.props &&
            // modified on 08/10/23 for BugId 137229
            // option.props.children === "New Group" &&
            option.props.children === t("newGroup") &&
            props.addNewGroupFunc
          ) {
            props.addNewGroupFunc();
          } else if (props.getActionName) {
            props.getActionName(option);
            handleClose();
          } else if (
            props.closeOnClick &&
            props.exceptionOpt?.includes(option)
          ) {
            // code added on 2 Dec 2022 for BugId 109970
            handleClose();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            if (
              option.props &&
              // modified on 08/10/23 for BugId 137229
              // option.props.children === "New Group" &&
              option.props.children === t("newGroup") &&
              props.addNewGroupFunc
            ) {
              props.addNewGroupFunc();
            } else if (props.getActionName) {
              props.getActionName(option);
              handleClose();
            } else if (
              props.closeOnClick &&
              props.exceptionOpt?.includes(option)
            ) {
              // code added on 2 Dec 2022 for BugId 109970
              handleClose();
            }
            e.stopPropagation();
          }
        }}
        id={
          (props.sortByDiv ? props.sortByDiv : "sortByDiv") +
          (props.isArabic ? "_arabic" : "")
        }
        tabIndex={0}
        aria-label="More button"
      >
        {option !== "Ungrouped" && typeof option !== "object" ? (
          <LightTooltip
            id="pmweb_doc_Tooltip"
            arrow={true}
            placement="bottom-start"
            title={
              option !== "Ungrouped" && typeof option !== "object" && option
            }
          >
            <li
              className={
                (props.oneSortOption ? props.oneSortOption : "oneSortOption") +
                (props.isArabic && !props.oneSortOption ? "_arabic" : "")
              }
              style={{
                fontWeight:
                  index === selectedIndex && props.showTickIcon ? "600" : "400",
                color:
                  props.disableOptionValue === option && props.disableOption
                    ? "grey"
                    : "black",
              }}
              id={`pmweb_${option}`}
            >
              {shortenRuleStatement(option, 15)}
            </li>
          </LightTooltip>
        ) : (
          <li
            className={
              (props.oneSortOption ? props.oneSortOption : "oneSortOption") +
              (props.isArabic && !props.oneSortOption ? "_arabic" : "")
            }
            style={{
              fontWeight:
                index === selectedIndex && props.showTickIcon ? "600" : "400",
              color:
                props.disableOptionValue === option && props.disableOption
                  ? "grey"
                  : "black",
            }}
            id={`pmweb_${option}`}
          >
            {option}
          </li>
        )}
      </div>
    );
  };

  const commonPara = (label, array, selectedIndex) => {
    return (
      <React.Fragment>
        {label && (
          <p className={props.isArabic ? "sortByPara_arabic" : "sortByPara"}>
            {label}
          </p>
        )}
        {array &&
          array.map((option, index) => commonDiv(index, option, selectedIndex))}
      </React.Fragment>
    );
  };

  const body = (
    <div
      style={{
        padding: props.isArabic
          ? "0.5rem"
          : props.removePaddings
          ? "sortByWithoutPadding"
          : "0rem 0rem 0.25rem 0rem",
      }}
      className={
        props.modalPaper
          ? props.modalPaper
          : props.isArabic
          ? "modalArabic"
          : ""
      }
    >
      {props.processType &&
      props.processType !== PROCESSTYPE_LOCAL &&
      props.processType !== PROCESSTYPE_LOCAL_CHECKED &&
      props.processData?.CheckedOut === "N" &&
      !props.isParentLaneCheckedOut ? (
        <div>
          {props.sortSectionLocalProcess && (
            <ul className={props.modalDiv ? props.modalDiv : "sortBy"}>
              {commonPara(null, sortSectionLocalProcess)}
            </ul>
          )}
        </div>
      ) : (
        <div>
          {/* Changes made to solve Bug 131869 */}
          <ul
            className={
              props.modalDiv
                ? props.modalDiv
                : props.removePaddings
                ? "sortByWithoutPadding"
                : "sortBy"
            }
          >
            {commonPara(props.sortBy, sortSectionOne, selectedSortByIndex)}
          </ul>
          {props.sortSectionTwo && (
            <ul className={props.modalDiv ? props.modalDiv : "sortBy"}>
              <hr
                className={
                  (props.dividerLine ? props.dividerLine : "dividerLine") +
                  (props.isArabic && !props.dividerLine ? "_arabic" : "")
                }
              ></hr>
              {commonPara(
                props.sortOrder,
                sortSectionTwo,
                selectedSortOrderIndex
              )}
            </ul>
          )}
          {props.sortSectionThree && (
            <ul className={props.modalDiv ? props.modalDiv : "sortBy"}>
              <hr
                className={
                  (props.dividerLine ? props.dividerLine : "dividerLine") +
                  (props.isArabic && !props.dividerLine ? "_arabic" : "")
                }
              ></hr>

              {commonPara(null, sortSectionThree)}
            </ul>
          )}
          {props.sortSectionFour && (
            <ul className={props.modalDiv ? props.modalDiv : "sortBy"}>
              <hr
                className={
                  (props.dividerLine ? props.dividerLine : "dividerLine") +
                  (props.isArabic && !props.dividerLine ? "_arabic" : "")
                }
              ></hr>
              {commonPara(null, sortSectionFour)}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  return (
    //Bug 121540 [28-02-2023] Added internalDiv class
    <div
      className={props.hideRelative ? "" : "relative internalDiv"}
      tabIndex={props.tabIndex}
      style={props.style}
      direction={direction == RTL_DIRECTION ? "rtl" : "ltr"}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          handleOpen();
          e.stopPropagation();
        }
      }}
    >
      <div onClick={handleOpen} className="internalDiv">
        {props.buttonToOpenModal}
      </div>
      {open ? (
        <React.Fragment>
          {props.backDrop && <Backdrop show={open} clicked={handleClose} />}
          <ClickAwayListener
            onClickAway={() => {
              if (props.backDrop === false) handleClose();
            }}
          >
            <div>{body}</div>
          </ClickAwayListener>
        </React.Fragment>
      ) : null}
    </div>
  );
}
