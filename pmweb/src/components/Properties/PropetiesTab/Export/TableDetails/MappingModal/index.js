import React, { useState } from "react";
import styles from "../index.module.css";
import Modal from "../../../../../../UI/Modal/Modal";
import MappingDataModal from "../MappingDataModal";
import MappingIcon from "../../../../../../assets/MappingIcon.svg";

function MappingModal(props) {
  const {
    index,
    activityData,
    setActivityData,
    fieldName,
    isReadOnly,
    documentList,
    variablesList,
    setGlobalData,
    fieldType,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.moreOptionsInput}>
      <img
        src={MappingIcon}
        tabIndex={0}
        id={`pmweb_MappingModal_MoreOptions${index}`}
        onClick={() => setIsOpen(true)}
        fontSize="small"
        alt="Map"
        className={styles.moreOptionIcon}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsOpen(true);
            e.stopPropagation();
          }
        }}
      />
      {/* Modified on 29-09-23 for Bug 138682  */}
      {isOpen && (
        <Modal
          show={isOpen}
          // modalClosed={() => setIsOpen(false)} //Commented as per requirement for Bug 116642
          style={{
            // width: "28%",
            height: "54%",
            // left: "35%",
            top: "27%",
            padding: "0px",
          }}
        >
          <MappingDataModal
            index={index}
            isOpen={isOpen}
            fieldName={fieldName}
            activityData={activityData}
            setActivityData={setActivityData}
            handleClose={() => setIsOpen(false)}
            isReadOnly={isReadOnly}
            documentList={documentList}
            variablesList={variablesList}
            setGlobalData={setGlobalData}
            fieldType={fieldType}
          />
        </Modal>
      )}
      {/* Till here for Bug 138682 */}
    </div>
  );
}
export default MappingModal;
