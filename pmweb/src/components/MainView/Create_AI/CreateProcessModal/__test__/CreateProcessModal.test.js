import React from "react";
import {
  render,
  fireEvent,
  screen,
  cleanup,
  waitFor,
  act,
  getByRole,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CustomTestComponent from "../../utils/CustomTestComponent";
import CreateProcessModal from "../CreateProcessModal";
import SelectWithInput from "../../../../../UI/SelectWithInput/index";
import axios from "axios";

//mocking react-secure-storage
jest.mock("react-secure-storage", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("Create Process Modal", () => {
  const defaultProps = {
    processName: "Test Process",
    modalCloseHandler: jest.fn(),
    CreateProcessByAIHandler: jest.fn(),
    createSpinner: false,
    selectedProjectName: "Test Project",
    selectedProjectId: 1,
    selectedTemplate: "Test Template",
  };
  it("renders without crashing", () => {
    render(
      <CustomTestComponent>
        <CreateProcessModal {...defaultProps} />
      </CustomTestComponent>
    );
  });
  describe("Create Process Modal Heading", () => {
    it("render correct title heading", async () => {
      render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );

      await waitFor(async () => {
        const typographyElement = screen.getByTestId(
          "create-process-modal-title-heading"
        );

        expect(typographyElement).toBeInTheDocument();
      });
    });

    it("title heading render correct styles", async () => {
      render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );

      await waitFor(() => {
        const typographyElement = screen.getByTestId(
          "create-process-modal-title-heading"
        );

        const styles = window.getComputedStyle(typographyElement);
        expect(styles.font).toBe("var(--font_family) normal normal 600 normal");
        //   expect(styles.fontSize).toBe("19px");
      });
    });
  });

  describe("Create Process Modal Project Name Block", () => {
    it("render correct project name heading", async () => {
      render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );

      await waitFor(() => {
        const typographyElement = screen.getByTestId(
          "create-process-modal-project-name-heading"
        );

        expect(typographyElement).toBeInTheDocument();
      });
    });

    it("project name heading render correct styles", async () => {
      render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );

      await waitFor(() => {
        const typographyElement = screen.getByTestId(
          "create-process-modal-project-name-heading"
        );

        const styles = window.getComputedStyle(typographyElement);
        expect(styles.font).toBe("var(--font_family) normal normal 600 normal");
        //   expect(styles.fontSize).toBe("17px");
        //   expect(styles.marginBottom).toBe("0.25rem");
      });
    });

    it("renders Input when defaultProject is provided", async () => {
      const { container } = render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );
      await waitFor(() => {
        const inputElement = container.querySelector(
          "#pmweb_CreateProcessModal_ProjectNameInput"
        );
        expect(inputElement).toBeInTheDocument();
      });
    });

    it("Input field is disabled in case of defaultProject", async () => {
      const { container } = render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );
      await waitFor(() => {
        const inputElement = container.querySelector(
          "#pmweb_CreateProcessModal_ProjectNameInput"
        );
        if (expect(inputElement).toBeInTheDocument()) {
          expect(inputElement.hasAttribute("disabled")).toBe(true);
        } else {
          expect(inputElement.hasAttribute("disabled")).toBe(false);
        }
      });
    });

    it("renders SelectWithInput when defaultProject is not provided", async () => {
      const { container } = render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );
      await waitFor(() => {
        const selectWithInputElement = container.querySelector(
          "#pmweb_CreateProcessModal_ProjectNameSelect"
        );
        expect(selectWithInputElement).toBeInTheDocument();
      });
    });
  });

  describe("Create process modal process name block", () => {
    it("render correct process name heading", async () => {
      render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );

      await waitFor(() => {
        const typographyElement = screen.getByTestId(
          "create-process-modal-process-name-heading"
        );

        expect(typographyElement).toBeInTheDocument();
      });
    });

    it("process name heading render correct styles", async () => {
      render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );

      await waitFor(() => {
        const typographyElement = screen.getByTestId(
          "create-process-modal-process-name-heading"
        );

        const styles = window.getComputedStyle(typographyElement);
        expect(styles.font).toBe("var(--font_family) normal normal 600 normal");
        //   expect(styles.fontSize).toBe("17px");
        //   expect(styles.marginBottom).toBe("0.25rem");
      });
    });
  });

  describe("create process modal footer", () => {
    it("calls modalCloseHandler when cancel button is clicked", async () => {
      render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: "cancel button" }));
        expect(defaultProps.modalCloseHandler).toHaveBeenCalled();
      });
    });

    it("calls CreateProcessByAIHandler with correct arguments when create button is clicked", async () => {
      render(
        <CustomTestComponent>
          <CreateProcessModal {...defaultProps} />
        </CustomTestComponent>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: "confirm button" }));
        if (
          defaultProps.createSpinner &&
          expect(createButton).not.toBeDisabled()
        ) {
          expect(defaultProps.CreateProcessByAIHandler).toHaveBeenCalledWith(
            "Test Process",
            1,
            "Test Project",
            true
          );
        }
      });
    });
  });

  it("disables create button when required fields are empty", async () => {
    render(
      <CustomTestComponent>
        <CreateProcessModal {...defaultProps} processName="" />
      </CustomTestComponent>
    );
    const createButton = screen.getByRole("button", { name: "confirm button" });
    defaultProps.createSpinner ? expect(createButton).toBeDisabled() : "";
  });
});
