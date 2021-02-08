import { Logo, DocumentTools } from "./Toolbars";
import React from "react";

import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("renders logo without crashing", () => {
  render(<Logo />);
});

it("renders doc tools without crashing", () => {
  render(
    <DocumentTools
      enableOptim={true}
      onOptimChange={jest.fn()}
      width={20}
      onWidthChange={jest.fn()}
      onWidthUpdate={jest.fn()}
      onTextNorm={jest.fn()}
      onTextUpdate={jest.fn()}
      onSave={jest.fn()}
      onJSONImport={jest.fn()}
      onThesaurusHide={jest.fn()}
    />
  );
});
