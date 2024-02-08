import React, { useState, useEffect } from "react";
import styles from "./rights.module.css";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { useTranslation } from "react-i18next";
import { isArabicLocaleSelected } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function Paginate({ showPerPage, onPaginationChange, total }) {
  let { t } = useTranslation();
  const [counter, setCounter] = useState(1);
  const [data, setData] = useState(null);

  useEffect(() => {
    const value = showPerPage * counter;
    let range = onPaginationChange(value - showPerPage, value);
    //Modified on 22/09/2023, bug_id:137574
    setData({
      count: counter,
      val: value,
      show: showPerPage,
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
      if (Math.ceil(total / showPerPage) === counter) {
        setCounter(counter);
      } else {
        setCounter(counter + 1);
      }
    }
  };

  return (
    <>
      {
        //Modified on 22/09/2023, bug_id:137574
      }
      {isArabicLocaleSelected() ? (
        <ArrowForwardIosIcon
          className={`${styles.next} ${styles.arrow}`}
          onClick={() => onButtonClick("next")}
        />
      ) : (
        <ArrowBackIosIcon
          className={`${styles.prev} ${styles.arrow}`}
          onClick={() => onButtonClick("prev")}
        />
      )}
      {/*till here for bug id 137574*/}
      {/*  <ArrowBackIosIcon
          className={`${styles.prev} ${styles.arrow}`}
          onClick={() => onButtonClick("prev")}
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
      {
        //Modified on 22/09/2023, bug_id:137574
      }
      {isArabicLocaleSelected() ? (
        <ArrowBackIosIcon
          className={`${styles.prev} ${styles.arrow}`}
          onClick={() => onButtonClick("prev")}
        />
      ) : (
        <ArrowForwardIosIcon
          className={`${styles.next} ${styles.arrow}`}
          onClick={() => onButtonClick("next")}
        />
      )}
      {/*till here for bug id 137574*/}
      {/*  <ArrowForwardIosIcon
          className={`${styles.next} ${styles.arrow}`}
          onClick={() => onButtonClick("next")}
        /> */}
    </>
  );
}

export default Paginate;
