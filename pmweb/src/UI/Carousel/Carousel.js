import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Carousel.css";
import { useTranslation } from "react-i18next";
import "./CarouselArabic.css";
import { RTL_DIRECTION } from "../../Constants/appConstants";
import SingleTemplateCard from "../SingleTemplateCard";
import { BTN_HIDE, BTN_SHOW } from "../../Constants/appConstants";

const Carousel = (props) => {
  let { t } = useTranslation();

  var data = props.data;
  var PairedData = data ? pairArray(data) : [];

  function pairArray(value) {
    var WholeData = value && value.slice();
    var arr = [];

    // while (WholeData && WholeData.length) {
    //   arr.push(WholeData.splice(0, 2));
    // }
    for (let i = 0; i < WholeData.length; i = i + 2) {
      let arrItem = WholeData.slice(i, i + 2);
      arr.push(arrItem);
    }
    return arr;
  }

  const direction = `${t("HTML_DIR")}`;

  return (
    <React.Fragment>
      <div
        className={
          direction === RTL_DIRECTION ? "containerArabic" : "container"
        }
        style={{ width: props.containerWidth }}
      >
        <Slider {...props.settings}>
          {PairedData &&
            PairedData.map((templates) => {
              return (
                <div>
                  {templates &&
                    templates.map((template) => {
                      return (
                        <SingleTemplateCard
                          item={template}
                          style={{
                            boxShadow: "none",
                          }}
                          templateComboStyle={{
                            minWidth: "13vw",
                          }}
                          cardWidth={props.cardWidth}
                          cardActivityMaxWidth={props.cardActivityMaxWidth}
                          disableSelect={
                            props.selectedTemplate
                              ? props.selectedTemplate.Id === template.Id
                              : false
                          }
                          previewFunc={
                            props.previewFunc ? props.previewFunc : null
                          }
                          selectTemplate={() => {
                            if (props.selectTemplateFunc) {
                              props.selectTemplateFunc(template);
                            }
                          }}
                          selectFunction={() => {
                            if (props.selectFunction) {
                              props.selectFunction(template);
                            }
                          }}
                          bSelectBtn={
                            props.bSelectBtn && props.bSelectBtn === BTN_SHOW
                              ? true
                              : false
                          }
                          bSelectTemplateBtn={
                            props.bSelectTemplateBtn &&
                            props.bSelectTemplateBtn === BTN_HIDE
                              ? false
                              : true
                          }
                          bPreviewBtn={
                            props.bPreviewBtn && props.bPreviewBtn === BTN_HIDE
                              ? false
                              : true
                          }
                          templateName={template.Name}
                          templateId={template.Id}
                        />
                      );
                    })}
                </div>
              );
            })}
        </Slider>
      </div>
    </React.Fragment>
  );
};

export default Carousel;
