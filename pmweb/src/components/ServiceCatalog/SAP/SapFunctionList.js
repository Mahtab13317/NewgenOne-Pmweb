import React from "react";
import styles from "./index.module.css";
import CommonListItem from "../../../components/MainView/ProcessesView/Settings/ServiceCatalog/Common Components/CommonListItem";

function SapFunctionList(props) {
  let { list, selected, selectionFunc } = props;

  return (
    <div className={styles.webS_ListDiv} style={{ height: "24rem" }}>
      {list?.map((item) => {
        return (
          <React.Fragment>
            <CommonListItem
              itemName={item.FunctionName}
              id={`webS_listItem${item.FunctionName}`}
              onClickFunc={() => {
                selectionFunc(item);
              }}
              isSelected={selected?.FunctionID === item.FunctionID}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default SapFunctionList;
