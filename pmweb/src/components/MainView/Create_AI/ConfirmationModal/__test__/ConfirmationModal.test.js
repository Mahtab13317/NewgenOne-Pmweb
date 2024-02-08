import React from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CustomTestComponent from "../../utils/CustomTestComponent";
import ConfirmationModal from "../index";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("Confirmation Modal", () => {
  const mockProps = {
    modalHeading: "Confirmation Title",
    confirmationMessage: "Are you sure?",
    cancelButtonText: "Cancel",
    confirmButtonText: "Confirm",
    modalCloseHandler: jest.fn(),
    confirmFunc: jest.fn(),
    isWarning: false,
  };

  it("renders without crashing", () => {
    render(
      <CustomTestComponent>
        <ConfirmationModal {...mockProps} />
      </CustomTestComponent>
    );
  });

  describe("Confirmation Modal Title Heading", () => {
    it("render correct title heading", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );
      const typographyElement = screen.getByTestId(
        "confirmation-modal-title-heading"
      );
      expect(typographyElement).toBeInTheDocument();
    });

    it("title heading render correct styles", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );
      const typographyElement = screen.getByTestId(
        "confirmation-modal-title-heading"
      );

      const styles = window.getComputedStyle(typographyElement);
      expect(styles.font).toBe("var(--font_family) normal normal 600 normal");
      //   expect(styles.fontSize).toBe("19px");
    });
  });

  describe("Confirmation Modal Title Heading", () => {
    it("render correct body heading", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );
      const typographyElement = screen.getByTestId(
        "confirmation-modal-body-heading"
      );
      expect(typographyElement).toBeInTheDocument();
    });

    it("title heading render correct styles", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );
      const typographyElement = screen.getByTestId(
        "confirmation-modal-body-heading"
      );

      const styles = window.getComputedStyle(typographyElement);
      expect(styles.font).toBe("var(--font_family) normal normal 600 normal");
      //   expect(styles.fontSize).toBe("17px");
      //   expect(styles.marginBottom).toBe("0.25rem");
    });
  });

  describe("Cancel Button", () => {
    it("calls modalCloseHandler when the Cancel button is clicked", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );

      fireEvent.click(screen.getByRole("button", { name: "cancel button" }));
      expect(mockProps.modalCloseHandler).toHaveBeenCalled();
    });

    it("cancel button displays correct text", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );
      const buttonContent = screen.getByRole("button", {
        name: "cancel button",
      });
      expect(buttonContent).toHaveTextContent("Cancel");
    });

    it("cancel button renders correct className", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );

      const buttonContent = screen.getByRole("button", {
        name: "cancel button",
      });

      expect(buttonContent).toHaveClass("cancelBtn");
    });
  });

  describe("Confirm Button", () => {
    it("calls confirmFunc when the Confirm button is clicked", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );

      fireEvent.click(screen.getByRole("button", { name: "confirm button" }));
      expect(mockProps.confirmFunc).toHaveBeenCalled();
    });

    it("confirm button displays correct text", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );
      const buttonContent = screen.getByRole("button", {
        name: "confirm button",
      });
      expect(buttonContent).toHaveTextContent("Confirm");
    });

    it("confirm button renders correct className", () => {
      render(
        <CustomTestComponent>
          <ConfirmationModal {...mockProps} />
        </CustomTestComponent>
      );

      const buttonContent = screen.getByRole("button", {
        name: "confirm button",
      });

      expect(buttonContent).toHaveClass(
        mockProps.isWarning ? "okBtn" : "deleteVariableBtn"
      );
    });
  });
});
