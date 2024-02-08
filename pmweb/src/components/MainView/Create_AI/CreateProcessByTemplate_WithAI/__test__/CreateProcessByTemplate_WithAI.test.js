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
import CreateProcessByTemplate_WithAI from "../CreateProcessByTemplate_WithAI";
import axios from "axios";

//mocking react-secure-storage
jest.mock("react-secure-storage", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

// Mocking Sun Editor
jest.mock("suneditor-react", () => ({
  create: jest.fn(),
}));

// Mock the entire "suneditor/src/plugins" module
jest.mock("suneditor/src/plugins", () => ({
  align: jest.fn(),
  fontColor: jest.fn(),
  hiliteColor: jest.fn(),
  list: jest.fn(),
  formatBlock: jest.fn(),
  textStyle: jest.fn(),
  image: jest.fn(),
  table: jest.fn(),
  fontSize: jest.fn(),
  font: jest.fn(),
  lineHeight: jest.fn(),
  link: jest.fn(),
  audio: jest.fn(),
  video: jest.fn(),
  math: jest.fn(),
  paragraphStyle: jest.fn(),
}));

jest.mock("react-slick", () => ({
  __esModule: true,
  default: jest.fn(),
}));

//mocking react-i18next
jest.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
  }));

// jest.mock("axios");

afterEach(cleanup);

describe("Create process by template with AI", () => {
  it("renders without crashing", () => {
    render(
      <CustomTestComponent>
        <CreateProcessByTemplate_WithAI />
      </CustomTestComponent>
    );
  });

  // describe("Header Component", () => {
  //   it("render back button", async () => {
  //     render(
  //       <CustomTestComponent>
  //         <CreateProcessByTemplate_WithAI />
  //       </CustomTestComponent>
  //     );
  //     await waitFor(async () => {
  //       const BackButtonElement = screen.getByTestId(
  //         "pmweb_CreateProcessByTemplateWithAI_BackBtn"
  //       );

  //       expect(BackButtonElement).toBeInTheDocument();
  //     });
  //   });
  // });
});
