import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SearchBox from "../../../UI/Search Component";
import SortButton from "../../../UI/SortingModal/Modal";
import FilterImage from "../../../assets/ProcessView/Sort_ASC.svg"; //Modified on 12/09/2023, bug_id:136595
//import FilterImage from "../../../assets/ProcessView/PT_Sorting.svg";
import TableData from "../../../UI/ProjectTableData/TableData";
import FileIcon from "../../../assets/HomePage/processIcon.svg";
import styles from "./template.module.css";
import arabicStyles from "./templateArabicStyles.module.css";
import {
  RTL_DIRECTION,
  SYSTEM_DEFINED_SCOPE,
} from "../../../Constants/appConstants";
import Modal from "../../../UI/Modal/Modal.js";
import AddCategoryModal from "./AddCategoryModal";
import processIcon from "../../../assets/HomePage/templateIcon.svg";
import { InfoOutlined, MoreVertOutlined } from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import MortVertModal from "../../../UI/ActivityModal/Modal";
import LockIcon from "@material-ui/icons/Lock";
import DeleteModal from "./DeleteModal";
import RenameModal from "./RenameModal";
import { decode_utf8 } from "../../../utility/UTF8EncodeDecoder";
import { useSelector } from "react-redux";

function CategoryListView(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [categoryArr, setCategoryArr] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [action, setAction] = useState(null);
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  const TemplateTooltip = withStyles((theme) => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      border: "1px solid #70707075",
      fontSize: "var(--base_text_font_size)",
      fontWeight: "400 !important",
      letterSpacing: "0px",
      color: "#000000",
      transform: "translate3d(0px, -0.25rem, 0px) !important",
    },
    arrow: {
      "&:before": {
        backgroundColor: "#FFFFFF !important",
        border: "1px solid #70707075 !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  const TemplateCountTooltip = withStyles((theme) => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      fontSize: "var(--base_text_font_size)",
      border: "1px solid #70707075",
      letterSpacing: "0px",
      fontWeight: "400 !important",
      color: "#000000",
      transform: "translate3d(0px, -0.25rem, 0px) !important",
      width: "11vw",
    },
    arrow: {
      "&:before": {
        backgroundColor: "#FFFFFF !important",
        border: "1px solid #70707075 !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  const getActionName = (actionName, category) => {
    setSelectedCategory(category);
    setAction(actionName);
  };

  useEffect(() => {
    if (props.categoryList) {
      setCategoryArr(props.categoryList);
    }
  }, [props.categoryList]);

  const headCells = [
    {
      id: "fileIcon",
      styleTdCell: {
        minWidth: "0px",
        width: "2vw",
        textAlign: direction === RTL_DIRECTION ? "left" : "right",
        transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
      },
    },
    {
      id: "categoryName",
      styleTdCell: { width: "12vw", height: "30px" },
    },
    {
      id: "categoryDesc",
      styleTdCell: { width: "0.5vw", height: "30px" },
    },
    {
      id: "categoryTemplateCount",
      styleTdCell: { width: "1vw", height: "30px" },
    },
    {
      id: "categoryExtras",
      styleTdCell: { width: "0.5vw", height: "30px" },
    },
  ];

  const onSearchSubmit = (searchVal) => {
    let arr = [];
    props.categoryList?.forEach((elem) => {
      // code edited on 3 Nov 2022 for BugId 110833
      if (
        elem.CategoryName.toLowerCase().includes(
          searchVal?.trim().toLowerCase()
        )
      ) {
        arr.push(elem);
      }
    });
    setCategoryArr(arr);
  };

  const clearResult = () => {
    setCategoryArr(props.categoryList);
  };

  const sortSelection = (selection) => {
    // sort alphabetically
    if (selection === t("alphabeticalOrder")) {
      let localArr = [...categoryArr];
      localArr.sort((a, b) => {
        return a.CategoryName.toLowerCase() < b.CategoryName.toLowerCase()
          ? -1
          : 1;
      });
      setCategoryArr(localArr);
    }
    //sort on basis of number of templates
    else if (selection === t("noOfTemplates")) {
      let localArr = [...categoryArr];
      localArr.sort((a, b) => {
        if (a.Templates && b.Templates) {
          return b.Templates.length - a.Templates.length;
        } else if (a.Templates) {
          return 0 - a.Templates.length;
        } else if (b.Templates) {
          return b.Templates.length - 0;
        } else {
          return 0;
        }
      });
      setCategoryArr(localArr);
    }
  };

  let rows = categoryArr?.map((category) => ({
    rowId: category.CategoryId,
    fileIcon: (
      <img src={FileIcon} style={{ marginTop: "4px" }} alt="file"></img>
    ),
    categoryDesc:
      category.Description?.trim() !== "" ? (
        <TemplateTooltip
          arrow
          title={
            <div
              style={{
                whiteSpace: "pre-line",
              }}
            >
              {decode_utf8(category.Description)}
            </div>
          }
          placement={
            direction === RTL_DIRECTION ? "bottom-end" : "bottom-start"
          }
        >
          <InfoOutlined className={styles.infoIcon} />
        </TemplateTooltip>
      ) : (
        ""
      ),
    categoryName: (
      <div className={styles.categoryName}>
        {category.CategoryName}
        {category.CategoryScope === SYSTEM_DEFINED_SCOPE ? (
          <TemplateTooltip
            arrow
            title={t("predefinedCategory")}
            placement={
              direction === RTL_DIRECTION ? "bottom-end" : "bottom-start"
            }
          >
            <LockIcon className={styles.categoryPredefinedIcon} />
          </TemplateTooltip>
        ) : null}
      </div>
    ),
    categoryTemplateCount: (
      <TemplateCountTooltip
        arrow
        title={
          category.Templates?.length > 0
            ? category.Templates.length === 1
              ? `${category.Templates.length} ${t("singleTemplateAvailable")}`
              : `${category.Templates.length} ${t("multipleTemplateAvailable")}`
            : t("noTemplateAvailable")
        }
        placement="bottom"
      >
        <div className={styles.templateCount}>
          <img
            src={processIcon}
            className={styles.templateLogo}
            alt="Process Icon"
            style={{
              transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
            }}
          />
          <span>{category.Templates ? category.Templates.length : 0}</span>
        </div>
      </TemplateCountTooltip>
    ),
    /*****************************************************************************************
     * @author asloob_ali BUG ID: 114663  Templates- categories - rename not working if in the same session
     * Reason:duplicate/similar functionalities edit and rename .
     * Resolution : removed rename option.
     * Date : 30/09/2022
     ****************/
    categoryExtras:
      category.CategoryScope === SYSTEM_DEFINED_SCOPE ? null : (
        <MortVertModal
          backDrop={false}
          getActionName={(actionName) => getActionName(actionName, category)}
          modalPaper={styles.moreVertCategoryModal}
          sortByDiv={styles.moreVertModalDiv}
          modalDiv={styles.moreVertDiv}
          sortByDiv_arabic="sortByDiv_arabicActivity"
          oneSortOption={styles.moreVertModalOption}
          showTickIcon={false}
          sortSectionOne={[t("edit"), t("delete")]}
          buttonToOpenModal={
            <MoreVertOutlined className={styles.moreVertIcon} />
          }
          dividerLine="dividerLineActivity"
          isArabic={direction === RTL_DIRECTION}
          hideRelative={true}
          tabIndex={0}
        />
      ),
    // added on 04/09/2023 for BugId 135251
    rowData: {
      ...category,
      TemplateCount: category?.Templates ? category?.Templates?.length : 0,
    },
  }));

  return (
    <React.Fragment>
      <div className={styles.templateSearchHeader} style={{ height: "7rem" }}>
        <div className={styles.templateHeadingArea}>
          <p className={styles.templateHeading}>
            {t("categories")} ({categoryArr ? categoryArr.length : 0})
          </p>
          <p
            className={styles.templateHeadingPlusBtn}
            onClick={() => {
              setAction(t("add"));
              setSelectedCategory(null);
            }}
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                setAction(t("add"));
                setSelectedCategory(null);
                e.stopPropagation();
              }
            }}
            id="pmweb_template_addCategory"
            aria-label="Add category button"
          >
            +
          </p>
        </div>
        <div className={styles.searchBoxArea}>
          <div
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.searchBox
                : styles.searchBox
            }
          >
            <SearchBox
              width="100%"
              title={"categoryListView"}
              onSearchChange={onSearchSubmit}
              clearSearchResult={clearResult}
              name="search"
              placeholder={t("search")}
            />
          </div>
          <SortButton
            backDrop={true}
            buttonToOpenModal={
              // Changes on 05-09-2023 to resove the bug Id 135242
              <div className="filterButton1" aria-description="Sort By">
                <img
                  src={FilterImage}
                  style={{
                    width: "100%",
                    transform:
                      direction === RTL_DIRECTION ? "scaleX(-1)" : null,
                  }}
                  alt="filter"
                  id="pmweb_template_sortButton"
                />
              </div>
            }
            showTickIcon={true}
            getActionName={sortSelection}
            sortBy={t("sortBy")}
            sortSectionOne={[t("alphabeticalOrder"), t("noOfTemplates")]}
            modalPaper={styles.categoryFilterBtn}
            isArabic={direction === RTL_DIRECTION}
          />
        </div>
      </div>
      <div
        style={{
          /* changes added for bug_id: 134226 */
          overflow: "scroll",
          height: `calc(${windowInnerHeight}px - 15rem)`,
          marginBottom: "4rem",
        }}
      >
        <div className={styles.templateTable}>
          <TableData
            extendHeight={true}
            hideHeader={true}
            defaultScreen={
              <div className={styles.noRecordDiv}>{t("noRecords")}</div>
            }
            selectionPossible={true}
            divider={false}
            tableHead={headCells}
            getSelectedRow={(data) => {
              props.setSelectedCategory(data.rowId);
            }}
            selectedRow={props.selectedCategory}
            rows={rows}
            noClickOnRow={true}
            // added on 04/09/2023 for BugId 135251
            nameKey="CategoryName"
            countKey="TemplateCount"
            clickableHeadCell={[
              "fileIcon",
              "categoryName",
              "categoryDesc",
              "categoryTemplateCount",
            ]}
          />
        </div>
      </div>
      {/*code edited on 21 June 2022 for BugId 111115*/}
      {action === t("edit") || action === t("add") ? (
        <Modal
          show={action === t("edit") || action === t("add")}
          style={{
            // width: "auto",
            // left: "40%",
            top: "25%",
            padding: "0",
          }}
          modalClosed={() => setAction(null)}
          children={
            <AddCategoryModal
              categoryList={props.categoryList}
              setCategoryList={props.setCategoryList}
              setModalClosed={() => setAction(null)}
              categoryToBeEdited={selectedCategory}
            />
          }
        />
      ) : null}
      {action === t("delete") ? (
        <Modal
          show={action === t("delete")}
          style={{
            // width: "30vw",
            // left: "37%",
            top: "25%",
            padding: "0",
          }}
          modalClosed={() => setAction(null)}
          children={
            <DeleteModal
              categoryList={props.categoryList}
              setCategoryList={props.setCategoryList}
              setModalClosed={() => setAction(null)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  setAction(null);
                  e.stopPropagation();
                }
              }}
              category={true}
              elemToBeDeleted={selectedCategory}
            />
          }
        />
      ) : null}
      {action === t("Rename") ? (
        <Modal
          show={action === t("Rename")}
          style={{
            // width: "30vw",
            height: "11.5rem",
            // left: "37%",
            top: "25%",
            padding: "0",
          }}
          modalClosed={() => setAction(null)}
          children={
            <RenameModal
              categoryList={props.categoryList}
              setCategoryList={props.setCategoryList}
              setModalClosed={() => setAction(null)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  setAction(null);
                  e.stopPropagation();
                }
              }}
              category={true}
              elemToBeRenamed={selectedCategory}
            />
          }
        />
      ) : null}
    </React.Fragment>
  );
}
export default CategoryListView;
