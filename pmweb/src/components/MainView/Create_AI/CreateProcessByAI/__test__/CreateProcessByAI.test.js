import React from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CustomTestComponent from "../../utils/CustomTestComponent";
import CreateProcessByAI from "../CreateProcessByAI";
import userEvent from "@testing-library/user-event";

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("Create Process By AI", () => {
  const defaultProps = {
    processName: "Test Process",
    category: "Test Category",
    geography: "Test Geography",
    additional: "Test additional data",
    IsRegenerate: false,
    ClickProcess: jest.fn(),
    createHandler: jest.fn(),
    disableBtn: "true",
    setShowRegenerateModal: jest.fn(),
    processData: {},
  };
  it("renders without crashing in its default state", () => {
    render(
      <CustomTestComponent>
        <CreateProcessByAI {...defaultProps} />
      </CustomTestComponent>
    );
    if (defaultProps.IsRegenerate) {
      const typographyElement = screen.getByTestId(
        "pmweb_CPAI_generateusingtext"
      );
      expect(typographyElement).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Generate Process/i })
      ).toBeDisabled();
    }
  });

  describe("Process Name Field", () => {
    it("renders process name field", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI {...defaultProps} />
        </CustomTestComponent>
      );
      const textfieldElement = screen.getByTestId(
        "pmweb_CreateProcessByAI_processName_test"
      );
      expect(textfieldElement).toBeInTheDocument();
    });

    it("handles input changes correctly", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI />
        </CustomTestComponent>
      );

      const inputElement = screen.getByRole("textbox", {
        name: /processName/i,
      });
      userEvent.type(inputElement, "Test Process");
      expect(inputElement).toHaveValue("Test Process");
    });

    it("Generate process button is disabled if process name input field is empty", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI />
        </CustomTestComponent>
      );
      const inputElement = screen.getByRole("textbox", {
        name: /processName/i,
      });
      fireEvent.change(inputElement, { target: { value: "" } });
      if (defaultProps.IsRegenerate) {
        expect(
          screen.getByRole("button", { name: /Generate Process/i })
        ).toBeDisabled();
      }
    });
  });

  describe("Category Name Field", () => {
    it("renders category field", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI {...defaultProps} />
        </CustomTestComponent>
      );
      const textfieldElement = screen.getByTestId(
        "pmweb_CreateProcessByAI_category_test"
      );
      expect(textfieldElement).toBeInTheDocument();
    });

    it("handles input changes correctly", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI />
        </CustomTestComponent>
      );

      const inputElement = screen.getByRole("textbox", {
        name: /category/i,
      });
      userEvent.type(inputElement, "Test Category");
      expect(inputElement).toHaveValue("Test Category");
    });
  });

  describe("Geography Name Field", () => {
    it("renders geography field", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI {...defaultProps} />
        </CustomTestComponent>
      );
      const textfieldElement = screen.getByTestId(
        "pmweb_CreateProcessByAI_geography_test"
      );
      expect(textfieldElement).toBeInTheDocument();
    });

    it("handles input changes correctly", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI />
        </CustomTestComponent>
      );

      const inputElement = screen.getByRole("textbox", {
        name: /geography/i,
      });
      userEvent.type(inputElement, "Test Geography");
      expect(inputElement).toHaveValue("Test Geography");
    });
  });

  describe("Additional Comments Name Field", () => {
    it("renders additional field", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI {...defaultProps} />
        </CustomTestComponent>
      );
      const textfieldElement = screen.getByTestId(
        "pmweb_CreateProcessByAI_additionalComments_test"
      );
      expect(textfieldElement).toBeInTheDocument();
    });

    it("handles input changes correctly", () => {
      render(
        <CustomTestComponent>
          <CreateProcessByAI />
        </CustomTestComponent>
      );

      const inputElement = screen.getByRole("textbox", {
        name: /additional/i,
      });
      userEvent.type(inputElement, "Test additional data");
      expect(inputElement).toHaveValue("Test additional data");
    });
  });
});
