import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import "./Modal.css";
import FilterImage from "../../assets//ProcessView/SortIcon.svg";
import DoneIcon from "@material-ui/icons/Done";
import Backdrop from "../Backdrop/Backdrop";
import {
  Box,
  Card,
  CardContent,
  Grid,
  ClickAwayListener,
  Button,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({}));

export default function SimpleModal(props) {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [open, setOpen] = React.useState(false);
  let sortSectionOne = props.sortSectionOne;
  let sortSectionThree = props.sortSectionThree;
  let sortSectionFour = props.sortSectionFour;
  let [sortOrderOptions, setSortOrderOptions] = useState(props.sortSectionTwo);
  let [selectedSortByIndex, setSelectedSortByIndex] = useState();
  let [selectedSortOrderIndex, setSelectedSortOrderIndex] = useState(0);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleSortByOption = (index) => {
    setSelectedSortByIndex(index);
    setSelectedSortOrderIndex(0);
    props.sortSelection && props.sortSelection(index, 0);
    if (index == props.indexToSwitchSortOptions) {
      setSortOrderOptions(props.sortOrderOptionsForName);
    } else {
      setSortOrderOptions(props.sortSectionTwo);
    }
    setOpen(false);
  };

  const handleSortOrderOption = (index) => {
    setSelectedSortOrderIndex(index);
    props.sortSelection && props.sortSelection(selectedSortByIndex, index);
    setOpen(false);
  };
  const replaceSpaceToUnderScore = (str) => {
    return str.replaceAll(" ", "_");
  };

  const commonDiv = (index, option, selectedIndex, handleFunc) => {
    if (!option) {
      return;
    }
    return (
      <div
        className={
          (props.sortByDiv ? props.sortByDiv : "sortByDiv") +
          (props.isArabic ? "_arabic" : "")
        }
        // tabIndex={0}
      >
        {props.showTickIcon ? (
          index == selectedIndex ? (
            <DoneIcon
              className={props.isArabic ? "tickIcon_arabic" : "tickIcon"}
            />
          ) : (
            <div className="emptyCheck"></div>
          )
        ) : null}
        {option ? (
          <li
            className={
              (props.oneSortOption ? props.oneSortOption : "oneSortOption") +
              (props.isArabic ? "_arabic" : "")
            }
            style={{
              fontWeight:
                index == selectedIndex && props.showTickIcon ? "600" : "400",
            }}
            onClick={() => {
              handleFunc(index);
              if (props.getActionName) {
                props.getActionName(option);
              }
            }}
            tabIndex={0}
            onKeyUp={(e)=>{
              if(e.key === "Enter"){
                handleFunc(index);
                if (props.getActionName) {
                  props.getActionName(option);
                }
                e.stopPropagation();
              }
            }}
            id={`pmweb_sortingModal_${replaceSpaceToUnderScore(option)}`}
          >
            {option}
          </li>
        ) : null}
      </div>
    );
  };

  const commonPara = (label, array, selectedIndex, handleFunc) => {
    return (
      <React.Fragment>
        {label ? (
          <p className={props.isArabic ? "sortByPara_arabic" : "sortByPara"}>
            {label}
          </p>
        ) : null}
        {array &&
          array.map((option, index) =>
            commonDiv(index, option, selectedIndex, handleFunc)
          )}
      </React.Fragment>
    );
  };

  const body = (
    <div style={{ paddingBottom: "5px" }} className={props.modalPaper}>
      <ul className="sortBy">
        {commonPara(
          props.sortBy,
          sortSectionOne,
          selectedSortByIndex,
          handleSortByOption
        )}
      </ul>
      {props.sortSectionTwo || props.sortOrderOptionsForName ? (
        <ul className="sortBy">
          <hr
            style={{ marginBottom: "0.25rem" }}
            className={
              (props.dividerLine ? props.dividerLine : "dividerLine") +
              (props.isArabic ? "_arabic" : "")
            }
          ></hr>
          {commonPara(
            props.sortOrder,
            sortOrderOptions,
            selectedSortOrderIndex,
            handleSortOrderOption
          )}
        </ul>
      ) : null}
      {props.sortSectionThree ? (
        <ul className="sortBy">
          <hr
            style={{ marginBottom: "0.25rem" }}
            className={
              (props.dividerLine ? props.dividerLine : "dividerLine") +
              (props.isArabic ? "_arabic" : "")
            }
          ></hr>
          {commonPara(null, sortSectionThree)}
        </ul>
      ) : null}
      {props.sortSectionFour ? (
        <ul className="sortBy">
          <hr
            style={{ marginBottom: "0.25rem" }}
            className={
              (props.dividerLine ? props.dividerLine : "dividerLine") +
              (props.isArabic ? "_arabic" : "")
            }
          ></hr>
          {commonPara(null, sortSectionFour)}
        </ul>
      ) : null}
    </div>
  );

  return (
    <div
      tabIndex={0}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          handleOpen();
          e.stopPropagation();
        }
      }}
    >
      <div onClick={handleOpen}>{props.buttonToOpenModal}</div>
      {open ? (
        <React.Fragment>
          {props.backDrop ? (
            <Backdrop show={open} clicked={handleClose} />
          ) : null}
          <ClickAwayListener
            onClickAway={() => {
              if (props.backDrop == false) handleClose();
            }}
          >
            <div>{body}</div>
          </ClickAwayListener>
        </React.Fragment>
      ) : null}
    </div>
  );
}
