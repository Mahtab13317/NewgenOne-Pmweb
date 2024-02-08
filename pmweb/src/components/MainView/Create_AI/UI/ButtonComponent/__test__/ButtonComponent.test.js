import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ButtonComponent from "../ButtonComponent";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe("ButtonComponent", () => {
  it("renders without crashing", () => {
    render(<ButtonComponent />);
  });
  it("should call onClick once when the button is clicked", () => {
    const onClickMock = jest.fn();
    const { getByText } = render(
      <ButtonComponent onClick={onClickMock}>Click me</ButtonComponent>
    );

    fireEvent.click(getByText("Click me"));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
  it("should call createHandler on Enter key press", () => {
    const createHandlerMock = jest.fn();
    const { getByText } = render(
      <ButtonComponent
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            createHandlerMock();
            e.stopPropagation();
          }
        }}
      >
        Click me
      </ButtonComponent>
    );

    fireEvent.keyUp(getByText("Click me"), { key: "Enter" });

    expect(createHandlerMock).toHaveBeenCalled();
  });
  it("should not call createHandler on key press other than Enter", () => {
    const createHandlerMock = jest.fn();
    const { getByText } = render(
      <ButtonComponent
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            createHandlerMock();
            e.stopPropagation();
          }
        }}
      >
        Click Me
      </ButtonComponent>
    );

    fireEvent.keyUp(getByText("Click Me"), { key: "Space" });

    expect(createHandlerMock).not.toHaveBeenCalled();
  });
  it("should have the correct className applied", () => {
    const expectedClassName = "custom-class";
    const { container } = render(
      <ButtonComponent className={expectedClassName}>Click me</ButtonComponent>
    );

    const buttonElement = container.querySelector(".common-button-test");
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass(expectedClassName);
  });
  it("should be enabled when spinner is false", () => {
    const { getByText } = render(
      <ButtonComponent disabled={false}>Click Me</ButtonComponent>
    );

    expect(getByText("Click Me")).not.toBeDisabled();
  });
});
