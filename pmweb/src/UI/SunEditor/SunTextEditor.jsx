//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly

//Changes made to solve Bug 123403 - pmweb - processes -> Project-> properties is not saved at first place and displayed something else at second place

import React, { useEffect, useState, useRef } from "react";
import SunEditor, { keymap } from "suneditor-react";
import {
  align,
  fontColor,
  hiliteColor,
  list,
  formatBlock,
  textStyle,
  image,
  table,
  fontSize,
  font,
  lineHeight,
  link,
  audio,
  video,
  math,
  paragraphStyle,
} from "suneditor/src/plugins";
import "suneditor/dist/css/suneditor.min.css";
import "./suneditor-custom.css";
import TextEditorToolbarJson from "./TextEditorToolbarJson";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../Constants/appConstants";

export default function SunTextEditor(props) {
  const { width, disabled } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  // code removed on 5 April 2023 for BugId 126368
  var toolbarOptions = [];
  Object.keys(TextEditorToolbarJson)?.forEach((key) => {
    if (Array.isArray(TextEditorToolbarJson[key])) {
      let optionsArray = [];
      TextEditorToolbarJson[key]?.forEach((subKey) => {
        if (TextEditorToolbarJson[subKey] === "true") {
          optionsArray.push(subKey);
        }
      });
      toolbarOptions.push(optionsArray);
    }
  });
  var emptyButtonList = [[]];
  const toolbarOptionsArray =
    props.previewmode === true ? emptyButtonList : toolbarOptions;
  const [content, setContent] = useState(
    props.value && props.value.length > 0 ? props.value : ""
  );

  useEffect(() => {
    if (props.value?.trim() !== "") {
      setContent(props.value);
    } else {
      setContent("");
    }
  }, [props.value]);

  const handleContent = (con) => {
    // if (props.descriptionInputcallBack) {
    //   props.descriptionInputcallBack(content, props.name);
    // }
    if (props.handleChange && typeof props.handleChange === "function") {
      props.handleChange(con);
    }
  };

  const handlePaste = (event, cleanData, maxCharCount) => {
    if (props.descriptionInputcallBack) {
      props.descriptionInputcallBack(cleanData, props.name);
    }
    if (props.getValue) {
      // let obj = { ...event, target: { innerText: cleanData } };
      props.getValue(cleanData);
    }
    //Modified on 17/10/2023, bug_id:135623
    if(props?.callHandleChangeOnPaste)
    {
      props.handleChange(event);
    }
    //till here
    return true;
  };

  const handleDrop = (event) => {
    return false;
  };
  const handleKey = (e) => {
    props.getValue(e);
  };

  const sunEditorRef = useRef(null);
  const myRef = useRef(null);

  const getSunEditorInstance = (suneditor) => {
    sunEditorRef.current = suneditor;
    // Set ARIA labels for toolbar buttons
    /*  const toolbarButtons = suneditor.container.querySelectorAll(
      ".sun-editor-id-toolbar button"
    );
    toolbarButtons.forEach((button) => {
      button.setAttribute("aria-label", button.getAttribute("title"));
    });

    // Improve keyboard navigation within the editor
    suneditor.container.setAttribute("tabindex", "0");

    // Set up event listeners for focus and blur to add focus indicators
    suneditor.container.addEventListener("focus", () => {
      suneditor.container.classList.add("editor-focused");
    });
    suneditor.container.addEventListener("blur", () => {
      suneditor.container.classList.remove("editor-focused");
    });*/
    /* const toolbarButtons = suneditor.toolbar.container.querySelectorAll(
      ".sun-editor-id-toolbar button"
    );
    toolbarButtons.forEach((button) => {
      button.setAttribute("aria-label", button.getAttribute("title"));
    });

    // Improve keyboard navigation within the editor
    suneditor.toolbar.container.setAttribute("tabindex", "0");

    // Set up event listeners for focus and blur to add focus indicators
    suneditor.toolbar.container.addEventListener("focus", () => {
      suneditor.toolbar.container.classList.add("editor-focused");
    });
    suneditor.toolbar.container.addEventListener("blur", () => {
      suneditor.toolbar.container.classList.remove("editor-focused");
    });*/
  };

  /* useEffect(() => {
    const handleTabKey = (e) => {
      if (e.key === "Tab" && sunEditorRef.current) {
        console.log("ali", document);
        console.log("ali", sunEditorRef.current.parent);

        const editorContainer = document.container;
        const focusableElements = editorContainer.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        const focusableElementArray = Array.from(focusableElements);

        const currentFocusedElement =
          editorContainer.ownerDocument.activeElement;
        const currentIndex = focusableElementArray.indexOf(
          currentFocusedElement
        );

        if (e.shiftKey) {
          // If shift key is pressed along with tab, focus on the previous element
          const prevIndex =
            (currentIndex - 1 + focusableElementArray.length) %
            focusableElementArray.length;
          focusableElementArray[prevIndex].focus();
        } else {
          // If only tab key is pressed, focus on the next element
          const nextIndex = (currentIndex + 1) % focusableElementArray.length;
          focusableElementArray[nextIndex].focus();
        }

        e.preventDefault();
      }
    };

    if (sunEditorRef.current) {
      document.addEventListener("keydown", handleTabKey);
    }

    return () => {
      if (sunEditorRef.current) {
        document.removeEventListener("keydown", handleTabKey);
      }
    };
  }, [sunEditorRef.current]);*/
  const handleKeyUp = (e) => {
    // console.log(e.key);
    //console.log(e);
    //console.log(myRef);

    if (e.key === "Tab") {
      //myRef?.current?.blur();
    }
  };

  useEffect(() => {
    return;
    // When the editor is initialized, set up accessibility features
    if (sunEditorRef.current) {
      const editorInstance = sunEditorRef.current;

      // Set ARIA labels for toolbar buttons
      const toolbarButtons = editorInstance.container.querySelectorAll(
        ".sun-editor-id-toolbar button"
      );
      toolbarButtons.forEach((button) => {
        button.setAttribute("aria-label", button.getAttribute("title"));
      });

      // Improve keyboard navigation within the editor
      editorInstance.container.setAttribute("tabindex", "0");

      // Set up event listeners for focus and blur to add focus indicators
      editorInstance.container.addEventListener("focus", () => {
        editorInstance.container.classList.add("editor-focused");
      });
      editorInstance.container.addEventListener("blur", () => {
        editorInstance.container.classList.remove("editor-focused");
      });
    }
  }, [sunEditorRef.current]);

  return (
    <div className="App" style={{ position: "relative", overflow: "hidden" }}>
      <div
        aria-label="textArea"
        style={{
          height: "100%",
          width: "100%",
          zIndex: props.zIndex || 0, //Bug117909 - [23-02-2023] Provided a zIndex
          position: "absolute",
          direction: direction === RTL_DIRECTION ? RTL_DIRECTION : "ltr",
          cursor: "context-menu", // Code added on 15-09-2023 for bug 135137  [provided cursor]
        }}
        className={direction === RTL_DIRECTION ? "rtlClass" : "ltrClass"} //Added on 25/09/2023, bug_id:137228
      >
        {/* <form> */}
        <SunEditor
          // ref={myRef}
          name="myEditor"
          autoFocus={false}
          lang="en"
          placeholder={
            props.placeholder ? props.placeholder : `${t("typesomethinghere")}`
          }
          setOptions={{
            mode: "classic",
            showPathLabel: false,
            // rtl: direction === RTL_DIRECTION,
            //katex: katex,
            plugins: [
              align,
              formatBlock,
              fontColor,
              hiliteColor,
              list,
              table,
              textStyle,
              image,
              fontSize,
              font,
              lineHeight,
              audio,
              video,
              link,
              math,
              paragraphStyle,
            ],
            buttonList: toolbarOptionsArray,
            font: ["Arial", "tahoma", "New Courier", "Verdana"], // Edited code for Bug 130952 on date 06-09-23
            fontSize: [5, 8, 10, 14, 18, 24, 36],
            fontSizeUnit: "px",
            keymap: {
              // Define custom keymap, including the tab key behavior
              tab: null, // Disable the default tab key behavior
            },
          }}
          id="sunEE"
          onInput={handleKey}
          setContents={content}
          defaultValue={props.value} //Changes made to solve Bug127162 and Bug127156
          onChange={handleContent}
          onPaste={handlePaste}
          onDrop={handleDrop}
          width={width ? width : "100%"}
          disable={disabled} // code edited on 5 April 2023 for BugId 126368
          getSunEditorInstance={getSunEditorInstance}
          onKeyUp={handleKeyUp}
        />
        {/* </form> */}
      </div>
    </div>
  );
}
