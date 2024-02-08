import React, { useState, useEffect } from "react";
import styles from "./rights.module.css";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { useTranslation } from "react-i18next";
import { isArabicLocaleSelected } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function PaginateVar({ showPerPageVar, onPaginationVarChange, total }) {
  let { t } = useTranslation();
  const [counter, setCounter] = useState(1);
  const [data, setData] = useState(null);

  useEffect(() => {
    const value = showPerPageVar * counter;
    let range = onPaginationVarChange(value - showPerPageVar, value);
    //Modified on 22/09/2023, bug_id:137574
    setData({
      count: counter,
      val: value,
      show: showPerPageVar,
      tot: total,
      first: range.start > total ? 1 : range.start,
      last: range.end,
    });
    /*till here for bug id 137574*/
    /*  setData({
      count: counter,
      val: value,
      show: showPerPageVar,
      tot: total,
      first: range.start > total ? 1 : range.start,
      last: range.end,
    }); */
  }, [counter]);

  // code added on 15 Feb 2023 for BugId 123838
  useEffect(() => {
    if (data?.first && data?.first > total) {
      setCounter(1);
    }
  }, [total]);

  const onButtonClick = (type) => {
    if (type === "prev") {
      if (counter === 1) {
        setCounter(1);
      } else {
        setCounter(counter - 1);
      }
    } else if (type === "next") {
      if (Math.ceil(total / showPerPageVar) === counter) {
        setCounter(counter);
      } else {
        setCounter(counter + 1);
      }
    }
  };
  return (
    <>
      {isArabicLocaleSelected() ? (
        <ArrowForwardIosIcon
          className={`${styles.next} ${styles.arrow}`}
          onClick={() => onButtonClick("next")}
          id="pmweb_paginateVar_nextArrow"
        />
      ) : (
        <ArrowBackIosIcon
          className={`${styles.prev} ${styles.arrow}`}
          onClick={() => onButtonClick("prev")}
          id="pmweb_paginateVar_prevArrow"
        />
      )}
      {/* <ArrowBackIosIcon
        className={`${styles.prev} ${styles.arrow}`}
        onClick={() => onButtonClick("prev")}
        id="pmweb_paginateVar_prevArrow"
      /> */}
      <span>
        {" "}
        {t("toolbox.dataRights.showing")} {data?.first}-
        {data?.last > total ? total : data?.last} {t("of")}{" "}
        {
          //Modified on 22/09/2023, bug_id:137574
        }
        {total}
        {/*till here for bug id 137574*/}
      </span>{" "}
      {isArabicLocaleSelected() ? (
        <ArrowBackIosIcon
          className={`${styles.prev} ${styles.arrow}`}
          onClick={() => onButtonClick("prev")}
          id="pmweb_paginateVar_prevArrow"
        />
      ) : (
        <ArrowForwardIosIcon
          className={`${styles.next} ${styles.arrow}`}
          onClick={() => onButtonClick("next")}
          id="pmweb_paginateVar_nextArrow"
        />
      )}
      {/*  <ArrowForwardIosIcon
        className={`${styles.next} ${styles.arrow}`}
        onClick={() => onButtonClick("next")}
        id="pmweb_paginateVar_nextArrow"
      /> */}
    </>
  );
}

export default PaginateVar;
