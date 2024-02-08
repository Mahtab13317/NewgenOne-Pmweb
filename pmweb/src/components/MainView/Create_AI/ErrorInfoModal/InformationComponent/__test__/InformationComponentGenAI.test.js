import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import InformationComponentGenAI from "../index";

afterEach(cleanup);

describe("Information Component GenAI", () => {
  const information = [{ name: "info 1" }, { name: "info 2" }];
  it("renders without crashing", () => {
    render(<InformationComponentGenAI />);
  });

  it("renders with errors", () => {
    render(<InformationComponentGenAI information={information} />);

    information?.forEach((info, index) => {
      const infoText = screen.getByTestId(index + 1);
      expect(infoText).toBeInTheDocument();
    });
  });

  it("renders with custom height", () => {
    render(<InformationComponentGenAI height="12rem" />);

    const gridElement = screen.getByRole("grid", { name: "Error List" });
    const styles = window.getComputedStyle(gridElement);
    expect(styles.height).toBe("12rem");
  });

  it("render correct error note", () => {
    render(<InformationComponentGenAI />);

    const typographyElement = screen.getByTestId("IC_Error_Note");
    expect(typographyElement).toBeInTheDocument();
  });
});
