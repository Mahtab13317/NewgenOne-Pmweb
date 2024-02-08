import React, { useEffect, useState } from "react";
import "./ProjectProperties.css";
import DoneIcon from "@material-ui/icons/Done";
import { useTranslation } from "react-i18next";

function SortByModal(props) {
  let { t } = useTranslation();
  const [sortByOptions, setSortByOptions] = useState([
    t("LastModifiedByMe"),
    t("LastModified"),
    t("Name"),
  ]);
  const [sortOrderOptionsOne, setSortOrderOptionsOne] = useState([
    t("OldestToNewest"),
    t("NewestToOldest"),
  ]);
  const [sortOrderOptionsTwo, setSortOrderOptionsTwo] = useState([
    t("Ascending"),
    t("Descending"),
  ]);
  const [sortBySelected, setSortBySelected] = useState(2);
  const [sortOrderSelected, setSortOrderSelected] = useState(0);

  useEffect(() => {
    setSortOrderSelected(0);
    if (sortBySelected == 2) {
      setSortOrderOptionsOne(sortOrderOptionsTwo);
    } else {
      setSortOrderOptionsOne([t("OldestToNewest"), t("NewestToOldest")]);
    }
  }, [sortBySelected]);

  useEffect(() => {
    props.getSortingOptions(sortBySelected, sortOrderSelected);
  }, [sortBySelected, sortOrderSelected]);

  return (
    <div>
      <p style={{ color: "#606060", fontSize: "14px", cursor: "default" }}>
        {t("SortBy")}
      </p>
      <ul className="upperSection">
        {sortByOptions?.map((el, index) => {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => setSortBySelected(index)}
              tabIndex={0}
              onKeyDown={(e)=>{
                if(e.key === "Enter"){
                  setSortBySelected(index);
                  e.stopPropagation();
                }
              }}
              className="sortModal"
              id={`pmweb_SortByModal_${replaceSpaceToUnderScore(el)}`}
            >
              {index == sortBySelected && (
                <DoneIcon
                  className={props.isArabic ? "tickIcon_arabic" : "tickIcon"}
                />
              )}
              <li className="upperSubSection">{el}</li>
            </div>
          );
        })}
      </ul>
      <p style={{ color: "#606060", fontSize: "14px", cursor: "default" }}>
        {t("SortOrder")} 
      </p>
      <ul className="lowerSection">
        {sortOrderOptionsOne?.map((el, index) => {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => setSortOrderSelected(index)}
              id={`pmweb_SortByModal_${el}`}
              tabIndex={0}
              onKeyDown={(e)=>{
                if(e.key === "Enter"){
                  setSortOrderSelected(index);
                  e.stopPropagation();
                }
              }}
              className="sortModal"
            >
              {index === sortOrderSelected && (
                <DoneIcon
                  className={props.isArabic ? "tickIcon_arabic" : "tickIcon"}
                />
              )}
              <li className="upperSubSection">{el}</li>
            </div>
          );
        })}
      </ul>
    </div>
  );
}
const replaceSpaceToUnderScore = (str) => {
  return str.replaceAll(" ","_");
} 
export default SortByModal;
