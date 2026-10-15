// jest.setup.js
import "@testing-library/jest-dom";
import React from "react";

// SanityImage pulls next-sanity/@sanity ESM (and next/image) which are hard to
// run under jsdom; it's a leaf component, so mock it as a plain <img> in tests.
jest.mock("@/components/SanityImage", () => ({
  __esModule: true,
  default: (props) =>
    React.createElement("img", {
      alt: props?.alt || "",
      "data-testid": "sanity-image",
    }),
}));
