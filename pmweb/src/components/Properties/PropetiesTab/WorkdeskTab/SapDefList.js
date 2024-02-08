import React from "react";
import styles from "./Sap.module.css";
import CommonListItem from "../../../MainView/ProcessesView/Settings/ServiceCatalog/Common Components/CommonListItem";

function SapDefList(props) {
  let { list, selected, setSelected } = props;
  return (
    <>
      <div className={styles.sapDef_ListDiv}>
        {list?.map((item, i) => {
          return (
            <>
              <CommonListItem
                itemName={item.strSAPdefName}
                id={`webS_listItem${item.strSAPdefName}`}
                onClickFunc={() => {
                  setSelected(item);
                }}
                isSelected={selected?.idefId === item.idefId}
              />
            </>
          );
        })}
      </div>
    </>
  );
}

export default SapDefList;
