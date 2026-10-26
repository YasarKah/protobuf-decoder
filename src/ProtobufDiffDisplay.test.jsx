import { render, screen } from "@testing-library/react";
import ProtobufDiffDisplay from "./ProtobufDiffDisplay";
import { diffProtos } from "./protobufDiff";
import { parseInput } from "./hexUtils";

const exampleHex =
  "0a 2f 0a 08 4a 6f 68 6e 20 44 6f 65 10 01 1a 10 6a 6f 68 6e 40 65 78 61 6d 70 6c 65 2e 63 6f 6d 22 0f 0a 0b 31 31 31 2d 32 32 32 2d 33 33 33 10 01 0a 1e 0a 08 4a 61 6e 65 20 44 6f 65 10 02 1a 10 6a 61 6e 65 40 65 78 61 6d 70 6c 65 2e 63 6f 6d";
const a = parseInput(exampleHex);
const b = parseInput(exampleHex.replace("10 01", "10 07"));

describe("ProtobufDiffDisplay", () => {
  it("identical inputs render no highlighted rows", () => {
    const { container } = render(
      <ProtobufDiffDisplay value={diffProtos([a, a], false)} />
    );

    expect(container.querySelectorAll("tr.warning")).toHaveLength(0);
  });

  it("changed varint is highlighted and shows both values", () => {
    const { container } = render(
      <ProtobufDiffDisplay value={diffProtos([a, b], false)} />
    );

    const changedRows = [...container.querySelectorAll("tr.warning")];
    const idRow = changedRows.find(
      row =>
        row.textContent.includes("As uint: 1") &&
        row.textContent.includes("As uint: 7")
    );
    expect(idRow).toBeDefined();
  });

  it("missing field shows placeholder", () => {
    render(
      <ProtobufDiffDisplay
        value={diffProtos([parseInput("08010802"), parseInput("0801")], false)}
      />
    );

    expect(screen.getAllByText("(missing)")).toHaveLength(1);
  });

  it("nested message renders nested table", () => {
    const { container } = render(
      <ProtobufDiffDisplay value={diffProtos([a, b], false)} />
    );

    expect(container.querySelectorAll("table").length).toBeGreaterThan(1);
  });

  it("shows left over bytes per input", () => {
    render(
      <ProtobufDiffDisplay value={diffProtos([a, parseInput("ffff")], false)} />
    );

    expect(screen.getByText("Left over bytes (B): ff ff")).toBeDefined();
  });
});
