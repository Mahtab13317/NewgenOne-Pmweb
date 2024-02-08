import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ErrorComponentGenAI from "../index";

afterEach(cleanup);

describe("Error Component GenAI", () => {
  const errors = [{ name: "Error 1" }, { name: "Error 2" }];
  it("renders without crashing", () => {
    render(<ErrorComponentGenAI />);
  });

  it("renders with errors", () => {
    render(<ErrorComponentGenAI errors={errors} />);

    errors.forEach((error, index) => {
      const errorText = screen.getByTestId(index + 1);
      expect(errorText).toBeInTheDocument();
    });
  });

  it("renders with custom height", () => {
    render(<ErrorComponentGenAI height="12rem" />);

    const gridElement = screen.getByRole("grid", { name: "Error List" });
    const styles = window.getComputedStyle(gridElement);
    expect(styles.height).toBe("12rem");
  });

  it("render correct error note", () => {
    render(<ErrorComponentGenAI />);

    const typographyElement = screen.getByTestId("Error_Note");
    expect(typographyElement).toBeInTheDocument();
  });
});
