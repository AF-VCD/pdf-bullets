import SynonymViewer from "./Thesaurus";
import React from "react";

import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const abbrData = [
  {
    enabled: true,
    value: "abbreviations",
    abbr: "abbrs",
  },
  {
    enabled: false,
    value: "table",
    abbr: "tbl",
  },
  {
    enabled: true,
    value: "optimize",
    abbr: "optim",
  },
  {
    enabled: false,
    value: "with ",
    abbr: "w/",
  },
  {
    enabled: true,
    value: "parentheses",
    abbr: "parens",
  },
];

it("renders without crashing", () => {
  render(
    <SynonymViewer
      word={"test"}
      onSelReplace={jest.fn()}
      abbrDict={abbrData}
      abbrReplacer={jest.fn((word) => word)}
      onHide={jest.fn()}
    />
  );
});
