import React from "react";
import Carousel from "./Carousel.js";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../Constants/appConstants.js";

const CarouselWidget = (props) => {
  let { t } = useTranslation();
  const data = props.data;
  const direction = `${t("HTML_DIR")}`;

  const settings = {
    dots: true,
    rtl: direction === RTL_DIRECTION,
  };
  return (
    <div>
      <Carousel
        settings={settings}
        data={data}
        tabIndex={props.tabIndex}
        containerWidth={props.containerWidth}
        cardWidth={props.cardWidth}
        bSelectBtn={props.bSelectBtn}
        bSelectTemplateBtn={props.bSelectTemplateBtn}
        bPreviewBtn={props.bPreviewBtn}
        selectFunction={props.selectFunction}
        selectedTemplate={props.selectedTemplate}
        templatePage={props.templatePage}
        previewFunc={props.previewFunc}
        selectTemplate={props.selectTemplate}
        modalClicked={props.modalClicked}
        setModalClicked={props.setModalClicked}
        selectTemplateFunc={props.selectTemplateFunc}
      />
    </div>
  );
};

export default CarouselWidget;
