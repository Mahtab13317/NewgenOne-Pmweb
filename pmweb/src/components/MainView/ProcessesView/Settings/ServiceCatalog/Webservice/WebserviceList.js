import React from "react";
import styles from "./index.module.css";
import CommonListItem from "../Common Components/CommonListItem";
import {
  GLOBAL_SCOPE,
  WEBSERVICE_SOAP,
} from "../../../../../../Constants/appConstants";
import { useMediaQuery } from "@material-ui/core";


function WebserviceList(props) {
  const smallScreen = useMediaQuery("(max-width:1282px)");
  const smallScreen2 = useMediaQuery("(max-width:810px)");

  let { list, selected, selectionFunc, scope } = props;

  return (
    <div
      className={styles.webS_ListDiv}
      style={{
        height:
          scope === GLOBAL_SCOPE
            ? "63vh"
            : props.callLocation === "webServicePropTab"
            ? "42vh"
            // : "46vh",
            // Changes to resolve the bug Id 134119
            :smallScreen2?"63vh":smallScreen?"52vh":"56vh"
      }}
    >
      {list?.map((item) => {
        return (
          <React.Fragment>
            {item.webserviceType === WEBSERVICE_SOAP ? (
              <CommonListItem
                itemName={item.AliasName}
                itemDomain={item.Domain}
                itemScope={item.MethodType}
                itemAppName={item.AppName}
                itemMethodName={item.MethodName}
                id={`pmweb_webS_listItem${replaceDotToUnderScore(
                  item.AliasName
                )}`}
                onClickFunc={() => selectionFunc(item)}
                onkeyDownFunc={(e) => {
                  if (e.key === "Enter") {
                    selectionFunc(item);
                    e.stopPropagation();
                  }
                }}
                isSelected={selected?.MethodIndex === item.MethodIndex}
              />
            ) : (
              <CommonListItem
                itemName={item.AliasName}
                itemDomain={item.Domain}
                itemScope={item.RestScopeType}
                itemAppName={item.OperationType}
                itemMethodName={item.MethodName}
                id={`pmweb_webS_listItem${replaceDotToUnderScore(
                  item.AliasName
                )}`}
                onClickFunc={() => selectionFunc(item)}
                onkeyDownFunc={(e) => {
                  if (e.key === "Enter") {
                    selectionFunc(item);
                    e.stopPropagation();
                  }
                }}
                isSelected={selected?.MethodIndex === item.MethodIndex}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
const replaceDotToUnderScore = (str) => {
  return str.replaceAll(".", "_");
};

export default WebserviceList;
