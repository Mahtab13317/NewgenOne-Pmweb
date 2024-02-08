import React, { useState } from "react";
import { MoreVertOutlined } from "@material-ui/icons";
import FileIcon from "../../../assets/HomePage/processIcon.svg";
import styles from "./template.module.css";
import arabicStyles from "./templateArabicStyles.module.css";
import { useTranslation } from "react-i18next";
import {
  RTL_DIRECTION,
  SYSTEM_DEFINED_SCOPE,
} from "../../../Constants/appConstants";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import MortVertModal from "../../../UI/ActivityModal/Modal";
import LockIcon from "@material-ui/icons/Lock";
import DeleteModal from "./DeleteModal";
import RenameModal from "./RenameModal";
import Modal from "../../../UI/Modal/Modal.js";
import AddCategoryModal from "./AddCategoryModal";
import { decode_utf8 } from "../../../utility/UTF8EncodeDecoder";
import { LightTooltip } from "../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function CategoryHeader(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [action, setAction] = useState(null);

  const TemplateTooltip = withStyles(() => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      border: "1px solid #70707075",
      font: "normal normal normal 12px/17px Open Sans",
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

  const getActionName = (actionName, category) => {
    setSelectedCategory(category);
    setAction(actionName);
  };

  // Function that checks if the string sent as param is multiline or not.
  const isDescriptionMultiLine = (categoryDesc) => {
    let isMultiLine = false;
    let description = categoryDesc;
    let tempArr = description.split("\n");
    let newArr = tempArr
      .map((element) => (element = element.trim()))
      .filter((element) => element !== "");
    if (newArr?.length > 1) {
      isMultiLine = true;
    }
    return isMultiLine;
  };

  return (
    <div className={styles.categoryHeader}>
      <div
        className={styles.categoryHeaderDisplay}
        id="pmweb_templates_categoryDiv"
      >
        <img
          src={FileIcon}
          alt="file"
          style={{
            marginTop: "4px",
            width: "1.25rem",
            height: "1.25rem",
            marginRight: "1vw",
            transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
          }}
        />
        <div
        // style={{ width: "50vw" }}
        >
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.categoryHeading
                : styles.categoryHeading
            }
          >
            {props.selectedCategoryDetails?.CategoryName}
            {props.selectedCategoryDetails?.CategoryScope ===
            SYSTEM_DEFINED_SCOPE ? (
              <TemplateTooltip
                arrow
                title={t("predefinedCategory")}
                placement={
                  direction === RTL_DIRECTION ? "bottom-end" : "bottom-start"
                }
              >
                <LockIcon className={styles.templatePredefinedIcon} />
              </TemplateTooltip>
            ) : null}
          </p>
          {props.selectedCategoryDetails?.Description?.trim() !== "" && (
            <div className="inlineFlex">
              <p
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.categoryHeadingDesc
                    : styles.categoryHeadingDesc
                }
              >
                {isDescriptionMultiLine(
                  decode_utf8(props.selectedCategoryDetails?.Description)
                ) ? (
                  // modified on 7-10-2023 for bug-id: 138357
                  <div className="inlineFlex">
                    {decode_utf8(props.selectedCategoryDetails?.Description)
                      ?.slice(
                        0,
                        decode_utf8(
                          props.selectedCategoryDetails?.Description
                        )?.indexOf("\n")
                      )
                      ?.trim()}

                    <span>
                      <LightTooltip
                        id="pmweb_multiline_desc_tooltip"
                        arrow={true}
                        placement="bottom-start"
                        title={
                          <div
                            style={{
                              whiteSpace: "pre-line",
                            }}
                          >
                            {decode_utf8(
                              props.selectedCategoryDetails?.Description
                            )}
                          </div>
                        }
                      >
                        <span className={styles.showMore}>
                          {`...${t("showMore")}`}
                        </span>
                      </LightTooltip>
                    </span>
                  </div>
                ) : // modified on 7-10-2023 for bug-id: 138357
                props.selectedCategoryDetails?.Description?.length < 120 ? (
                  // modified on 7-10-2023 for bug-id: 138357
                  <div className="inlineFlex">
                    {decode_utf8(props.selectedCategoryDetails?.Description)}
                    {/* <span
                      className={styles.showMore}
                      onClick={() => setShowMoreDesc(!showMoreDesc)}
                    >
                      {showMoreDesc ? t("showLess") : `...${t("showMore")}`}
                    </span> */}
                  </div>
                ) : (
                  <div className="inlineFlex">
                    <span>
                      {/* {showMoreDesc
                      // ? decode_utf8(props.selectedCategoryDetails?.Description)
                      // : decode_utf8(
                      //     props.selectedCategoryDetails?.Description?.split(" ")
                      //       ?.splice(0, WORD_LIMIT_DESC)
                      //       ?.join(" ")
                      //   )}
                      ? decode_utf8(props.selectedCategoryDetails?.Description)
                      : shortenRuleStatement(decode_utf8(props.selectedCategoryDetails?.Description), WORD_LIMIT_DESC)
                    }
                    <span
                      className={styles.showMore}
                      onClick={() => setShowMoreDesc(!showMoreDesc)}
                    >
                      {showMoreDesc ? t("showLess") : `${t("showMore")}`}
                    </span> */}
                      {shortenRuleStatement(
                        decode_utf8(props.selectedCategoryDetails?.Description),
                        120
                      )}
                      <LightTooltip
                        id="pmweb_multiline_desc_tooltip"
                        arrow={true}
                        placement="bottom-start"
                        title={
                          <div
                            style={{
                              whiteSpace: "pre-line",
                              maxHeight: "40rem",
                              textWrap: "wrap",
                              overflowY: "auto",
                            }}
                          >
                            {decode_utf8(
                              props.selectedCategoryDetails?.Description
                            )}
                          </div>
                        }
                      >
                        <span className={styles.showMore}>
                          {`${t("showMore")}`}
                        </span>
                      </LightTooltip>
                    </span>
                    {/* <TemplateTooltip
                      arrow
                      enterDelay={100}
                      placement={
                        direction === RTL_DIRECTION
                          ? "bottom-end"
                          : "bottom-start"
                      }
                      title={props.selectedCategoryDetails?.Description}
                    >*/}
                    {/* <span
                      className={styles.showMore}
                      onClick={() => setShowMoreDesc(!showMoreDesc)}
                    >
                      {showMoreDesc ? t("showLess") : `${t("showMore")}`}
                    </span> */}
                    {/*</TemplateTooltip>*/}
                  </div>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className={styles.templateButtonArea} tabIndex={0}>
        {props.selectedCategoryDetails?.CategoryScope ===
        SYSTEM_DEFINED_SCOPE ? null : (
          <MortVertModal
            backDrop={false}
            getActionName={(actionName) =>
              getActionName(actionName, props.selectedCategoryDetails)
            }
            modalPaper={
              direction === RTL_DIRECTION
                ? arabicStyles.moreVertHeaderModal
                : styles.moreVertHeaderModal
            }
            modalDiv={styles.moreVertDiv}
            sortByDiv={styles.moreVertModalDiv}
            sortByDiv_arabic="sortByDiv_arabicActivity"
            oneSortOption={styles.moreVertModalOption}
            showTickIcon={false}
            sortSectionOne={[t("edit"), t("delete")]}
            buttonToOpenModal={
              <MoreVertOutlined className={styles.moreVertIcon} />
            }
            dividerLine="dividerLineActivity"
            isArabic={direction === RTL_DIRECTION}
            hideRelative={direction === RTL_DIRECTION}
            id="pmweb_template_popupEDIT/DEL"
            tabIndex={0}
          />
        )}
      </div>
      {action === t("edit") ? (
        <Modal
          show={action === t("edit")}
          style={{
            width: "28vw",
            height: "20rem",
            left: "40%",
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
              category={true}
              elemToBeDeleted={selectedCategory}
            />
          }
        />
      ) : null}
    </div>
  );
}

export default CategoryHeader;
