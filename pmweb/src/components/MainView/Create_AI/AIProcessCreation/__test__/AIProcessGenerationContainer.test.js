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
import AIProcessGenerationContainer from "../AIProcessGenerationContainer";

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("AI Process Generation", () => {
  const mockProps = {
    stopGenerateFunc: jest.fn(),
  };
  it("renders component without crashing", () => {
    render(
      <CustomTestComponent>
        <AIProcessGenerationContainer {...mockProps} />
      </CustomTestComponent>
    );
    expect(screen.getByTestId("pmweb_AIPG_generating")).toBeInTheDocument();
    expect(screen.getByTestId("pmweb_AIPG_generatingMsg")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Stop Generating" })
    ).toBeInTheDocument();
  });

  it("renders loader", () => {
    render(
      <CustomTestComponent>
        <AIProcessGenerationContainer {...mockProps} />
      </CustomTestComponent>
    );
    expect(
      screen.getByRole("grid", { name: "AIPGC_genAILoaderContainer" })
    ).toBeInTheDocument();
  });

  it("handles button click correctly", () => {
    render(
      <CustomTestComponent>
        <AIProcessGenerationContainer {...mockProps} />
      </CustomTestComponent>
    );

    fireEvent.click(screen.getByRole("button", { name: "Stop Generating" }));

    expect(mockProps.stopGenerateFunc).toHaveBeenCalled();
  });

  it("handles button click on Enter key press", () => {
    render(
      <CustomTestComponent>
        <AIProcessGenerationContainer {...mockProps} />
      </CustomTestComponent>
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Stop Generating" }), {
      key: "Enter",
    });

    expect(mockProps.stopGenerateFunc).toHaveBeenCalled();
  });

  it("should not call createHandler on key press other than Enter", () => {
    render(
      <CustomTestComponent>
        <AIProcessGenerationContainer {...mockProps} />
      </CustomTestComponent>
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Stop Generating" }), {
      key: "Space",
    });

    expect(mockProps.stopGenerateFunc).not.toHaveBeenCalled();
  });
});
