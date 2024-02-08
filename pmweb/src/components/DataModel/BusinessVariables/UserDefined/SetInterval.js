import React, { useState } from "react";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";

function SetInterval(props) {
  let { t } = useTranslation();
  const [year, setYear] = useState("1");
  const [month, setmonth] = useState("1");
  const [day, setDay] = useState("1");
  const [hour, setHour] = useState("1");
  const [minute, setMinute] = useState("1");
  const [second, setSecond] = useState("1");
  const yearHandler = (e) => {
    setYear(e.target.value);
  };
  const monthHandler = (e) => {
    setmonth(e.target.value);
  };
  const dayHandler = (e) => {
    setDay(e.target.value);
  };
  const hourHandler = (e) => {
    setHour(e.target.value);
  };
  const minuteHandler = (e) => {
    setMinute(e.target.value);
  };
  const secondHandler = (e) => {
    setSecond(e.target.value);
  };

  const addHandler = () => {
    let data =
      t("p") +
      year +
      t("y") +
      month +
      t("m") +
      day +
      t("d") +
      hour +
      t("h") +
      minute +
      t("m") +
      second +
      t("s");
    props.selectedDuration(data);
    props.setModalClicked(false);
  };

  return (
    <React.Fragment>
      <h4 style={{ margin: "0 0 3% 0" }}>{t("setInterval")}</h4>
      <div className="row">
        <div className={styles.group}>
          <input
            type="number"
            className={styles.inputWidth}
            value={year}
            onChange={yearHandler}
          />
          <p className={styles.labelIntervals}>{t("years")}</p>
        </div>
        <div className={styles.group}>
          <input
            type="number"
            className={styles.inputWidth}
            value={month}
            onChange={monthHandler}
          />
          <p className={styles.labelIntervals}>{t("months")} </p>
        </div>
        <div className={styles.group}>
          <input
            type="number"
            className={styles.inputWidth}
            value={day}
            onChange={dayHandler}
          />
          <p className={styles.labelIntervals}>{t("days")}</p>
        </div>
      </div>
      <div className="row" style={{ marginTop: "1rem" }}>
        <div className={styles.group}>
          <input
            type="number"
            className={styles.inputWidth}
            value={hour}
            onChange={hourHandler}
          />
          <p className={styles.labelIntervals}>{t("hours")}</p>
        </div>
        <div className={styles.group}>
          <input
            type="number"
            className={styles.inputWidth}
            value={minute}
            onChange={minuteHandler}
          />
          <p className={styles.labelIntervals}>{t("minutes")}</p>
        </div>
        <div className={styles.group}>
          <input
            type="number"
            className={styles.inputWidth}
            value={second}
            onChange={secondHandler}
          />
          <p className={styles.labelIntervals}>{t("seconds")}</p>
        </div>
      </div>
      <div className={styles.intervalFooter}>
        <button className={styles.add} onClick={() => addHandler()}>
          {t("add")}
        </button>
        <button
          className={styles.cancel}
          onClick={() => props.setModalClicked(false)}
        >
          {t("cancel")}
        </button>
      </div>
    </React.Fragment>
  );
}

export default SetInterval;
