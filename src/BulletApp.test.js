import BulletApp from "./BulletApp";

import React from "react";

import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("./components/Bullets/utils.js", () => {
  const Tools = jest.requireActual("./components/Bullets/utils.js");
  const widthMap = jest.requireActual("./static/12pt-times.json");
  const getWidthMock = (text) => {
    return text
      .split("")
      .reduce((sum, char) => sum + widthMap[char.charCodeAt(0)], 0);
  };
  return {
    ...Tools,
    renderBulletText: (text, getWidth, width) =>
      Tools.renderBulletText(text, getWidthMock, width),
  };
});

it("renders without crashing", () => {
  render(<BulletApp />);
});
