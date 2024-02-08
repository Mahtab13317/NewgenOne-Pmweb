import React from "react";
import SingleTemplateCard from "../../../UI/SingleTemplateCard";
import styles from "./template.module.css";
import arabicStyles from "./templateArabicStyles.module.css";
import { useTranslation } from "react-i18next";
import NoRecordsScreen from "./NoRecordsScreen";
import MortVertModal from "../../../UI/ActivityModal/Modal";
import { MoreVertOutlined } from "@material-ui/icons";
import {
  RTL_DIRECTION,
  SYSTEM_DEFINED_SCOPE,
} from "../../../Constants/appConstants";
import * as actionCreators from "../../../redux-store/actions/processView/actions";
import * as actionCreators_template from "../../../redux-store/actions/Template";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import {
  PREVIOUS_PAGE_GRID,
  TEMPLATE_GRID_VIEW,
} from "../../../Constants/appConstants";

function TemplateGridView(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const history = useHistory();

  const getActionName = (actionName, template) => {
    if (actionName === t("open")) {
      previewTemplate(template);
    } else {
      props.setActedTemplate(template);
      props.setAction(actionName);
    }
  };

  const previewTemplate = (template) => {
    localStorage.setItem("useThisTemplate", JSON.stringify(template));
    localStorage.setItem("categoryDetail", JSON.stringify(props.category));
    props.setTemplatePage(PREVIOUS_PAGE_GRID);
    props.setTemplateDetails(props.category, TEMPLATE_GRID_VIEW);
    props.openTemplate(template.Id, template.Name, true);
    // code edited on 10 Oct 2022 for BugId 112343 and BugId 112684
    props.openProcessClick("", "", "", "", "");
    history.push("/process");
  };

  return (
    <div className={styles.templateGridView}>
      {props.templateList?.length > 0 ? (
        props.templateList.map((template, index) => {
          return (
            <SingleTemplateCard
              id={`pmweb_templateCard_${index}`}
              item={template}
              cardWidth="49.5%"
              cardActivityMaxWidth="25%"
              style={{
                marginTop: 0,
                marginInlineEnd: index % 2 === 0 ? "0.5vw" : "0",
                marginBottom: "1rem",
                width: "36.5vw",
                boxShadow: "none",
              }}
              templateComboStyle={{
                minWidth: "12vw",
              }}
              cardHeadingStyle={{
                font: "normal normal 600 var(--title_text_font_size)/23px var(--font_family)",
              }}
              bOpenBtn={true}
              bCreateProcessBtn={true}
              createProcessFunc={() => {
                props.createProcessFunc();
                props.setSelectedTemplate(template);
              }}
              previewFunc={() => {
                props.setTemplatePage(PREVIOUS_PAGE_GRID);
                props.setTemplateDetails(props.category, TEMPLATE_GRID_VIEW);
              }}
              templateName={template.Name}
              templateId={template.Id}
              moreVertIcon={
                <MortVertModal
                  backDrop={false}
                  getActionName={(actionName) =>
                    getActionName(actionName, template)
                  }
                  modalPaper={
                    direction === RTL_DIRECTION
                      ? arabicStyles.moreVertGridTemplateModal
                      : styles.moreVertGridTemplateModal
                  }
                  modalDiv={styles.moreVertDiv}
                  sortByDiv={styles.moreVertModalDiv}
                  sortByDiv_arabic="sortByDiv_arabicActivity"
                  oneSortOption={styles.moreVertModalOption}
                  showTickIcon={false}
                  sortSectionOne={
                    template.Scope === SYSTEM_DEFINED_SCOPE
                      ? [t("open")]
                      : [
                          t("open"),
                          // t("edit"),
                          // t("Rename"),//code edited on 21 Oct 2022 for  BugId 117380
                          t("delete"),
                        ]
                  }
                  buttonToOpenModal={
                    <MoreVertOutlined className={styles.moreVertGridIcon} />
                  }
                  dividerLine="dividerLineActivity"
                  isArabic={direction === RTL_DIRECTION}
                  hideRelative={true}
                  tabIndex={0}
                />
              }
            />
          );
        })
      ) : (
        <NoRecordsScreen />
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    openTemplate: (id, name, flag) =>
      dispatch(actionCreators.openTemplate(id, name, flag)),
    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        actionCreators.openProcessClick(id, name, type, version, processName)
      ),
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
    setTemplateDetails: (category, view, createBtnClick, template) =>
      dispatch(
        actionCreators_template.setTemplateDetails(
          category,
          view,
          createBtnClick,
          template
        )
      ),
  };
};

export default connect(null, mapDispatchToProps)(TemplateGridView);
