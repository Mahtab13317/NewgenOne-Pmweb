import React from "react";
import styles from "./index.module.css";
import CommonListItem from "../../../components/MainView/ProcessesView/Settings/ServiceCatalog/Common Components/CommonListItem";

function SapList(props) {
  let { list, selected, selectionFunc } = props;

  return (
    <div className={styles.webS_ListDiv} style={{ height: "24rem" }}>
      {list?.map((item) => {
        return (
          <React.Fragment>
            <CommonListItem
              itemName={item.configurationName}
              id={`webS_listItem${item.configurationName}`}
              onClickFunc={() => selectionFunc(item)}
              isSelected={selected?.iConfigurationId === item.iConfigurationId}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default SapList;
