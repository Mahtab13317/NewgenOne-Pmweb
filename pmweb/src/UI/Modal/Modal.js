import React, { useEffect } from "react";
import "./Modal.css";
import Backdrop from "../Backdrop/Backdrop";
import { FocusTrap } from "@mui/base";
const Modal = (props) => {
  useEffect(() => {
    document.addEventListener("keydown", logKeyDown);
    return () => {
      document.removeEventListener("keydown", logKeyDown);
    };
  }, []);

  const logKeyDown = (event) => {
    if (event.keyCode === 27) {
      // Check if Escape key w  as pressed
      if (props?.modalClosed) {
        props?.modalClosed(); // Call the close function passed as a prop
      }
    }
  };

  /* const meraModalRef = useRef(null);
  useEffect(() => {
    if (meraModalRef.current) {
      // add all the elements inside modal which you want to make focusable
      const focusableElements =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const modal = meraModalRef.current;

      const firstFocusableElement =
        modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
      const focusableContent = modal.querySelectorAll(focusableElements);
      const lastFocusableElement =
        focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

      document.addEventListener("keydown", function (e) {
        let isTabPressed = e.key === "Tab";

        // if (e.key == "Escape" || e.keyCode === 27) {
        //   if (props?.modalClosed) {
        //     props?.modalClosed(); // Call the close function passed as a prop
        //   }
        // }
        if (!isTabPressed) {
          return;
        }

        if (e.shiftKey) {
          // if shift key pressed for shift + tab combination
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement?.focus(); // add focus for the last focusable element
            e.preventDefault();
          }
        } else {
          // if tab key is pressed
          if (document.activeElement === lastFocusableElement) {
            // if focused has reached to last focusable element then focus first focusable element after pressing tab
            firstFocusableElement?.focus(); // add focus for the first focusable element
            e.preventDefault();
          }
        }
      });

      firstFocusableElement?.focus();
    }
  }, [meraModalRef.current]);*/

  return (
    <React.Fragment>
      <Backdrop
        show={props.hideBackdrop ? false : props.show}
        clicked={props.modalClosed}
        style={{ ...props.backDropStyle }}
      />
      {/**code changes added for 134073  on 28/08/2023*/}
      <FocusTrap
        open={!props.NoFocusTrap}
        /**code added for bug id 137922 */
        disableEnforceFocus={props.NoFocusTrap}
        disableAutoFocus={props.NoFocusTrap}
      >
        <div
          className="Modal"
          style={{
            transform: props.show ? "translateY(0)" : "translateY(-100vh)",
            opacity: props.show ? "1" : "0",
            ...props.style,
          }}
          role="dialog"
          tabIndex={-1}
          //  ref={meraModalRef}
        >
          {props.children}
        </div>
      </FocusTrap>
    </React.Fragment>
  );
};

export default Modal;
