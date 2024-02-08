import React from "react";
import TabsHeading from "../../../../UI/TabsHeading";
import Options from "../Options";

function index(props) {
  return (
    <>
      <TabsHeading heading={props?.heading} />
      <Options tabName="Timer" />
    </>
  );
}

export default index;
