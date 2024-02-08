import React from "react";
import "./ProcessTemplate.css";
import SliderCarousel from "../Carousel/index";
import { useTranslation } from "react-i18next";
import c_Names from "classnames";
import "./ProcessTemplateArabic.css";
import {
  PREVIOUS_PAGE_CREATE_FROM_NO_PROCESS,
  PREVIOUS_PAGE_NO_PROCESS,
} from "../../Constants/appConstants";
import * as actionCreators_template from "../../redux-store/actions/Template";
import { connect } from "react-redux";

function ProcessTemplate(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  return (
    <React.Fragment>
      {props.data &&
        props.data.map((value) => {
          return (
            <div
              className={c_Names({
                allTempInRow: direction !== "rtl",
                allTempInRowArabic: direction == "rtl",
              })}
              style={{ direction: `${t("HTML_DIR")}` }}
            >
              <p
                className={c_Names({
                  tempTypeTitle: direction !== "rtl",
                  tempTypeTitleArabic: direction == "rtl",
                })}
              >
                {value.CategoryName}
              </p>

              <div>
                <SliderCarousel
                  data={
                    value.Templates &&
                    value.Templates.map((ShownValue) => {
                      return ShownValue;
                    })
                  }
                  templatePage={PREVIOUS_PAGE_CREATE_FROM_NO_PROCESS}
                  previewFunc={() => {
                    props.setTemplatePage(PREVIOUS_PAGE_NO_PROCESS);
                  }}
                  modalClicked={props.modalClicked}
                  setModalClicked={props.setModalClicked}
                  selectTemplateFunc={props.selectTemplateFunc}
                ></SliderCarousel>
              </div>
            </div>
          );
        })}
    </React.Fragment>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
  };
};

export default connect(null, mapDispatchToProps)(ProcessTemplate);
