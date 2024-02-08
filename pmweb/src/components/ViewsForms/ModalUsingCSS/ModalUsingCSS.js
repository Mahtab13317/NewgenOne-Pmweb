import React from "react";
import styles from "./ModalUsingCSS.module.css";

const ModalUsingCSS = (props) => {
  return (
    <>
      <div className={styles.darkBG} onClick={() => props.closeModal()} />
      <div className={styles.centered} style={props.style}>
        {props.children}
      </div>
    </>
  );
};

export default ModalUsingCSS;
