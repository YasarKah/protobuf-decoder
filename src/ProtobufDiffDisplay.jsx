import React, { Fragment } from "react";
import { Message, Table } from "semantic-ui-react";
import { getProtobufPart } from "./ProtobufPart";
import { typeToString } from "./protobufDecoder";
import { bufferToPrettyHex } from "./hexUtils";

function DiffCells(props) {
  const { cell, hideContent } = props;

  if (!cell) {
    return (
      <Table.Cell className="diff-input-start" colSpan={3} negative>
        (missing)
      </Table.Cell>
    );
  }

  const [contents, subType] = getProtobufPart(cell.part);

  return (
    <Fragment>
      <Table.Cell className="diff-input-start diff-range">
        {cell.part.byteRange.join("-")}
      </Table.Cell>
      <Table.Cell className="diff-type">
        {typeToString(cell.part.type, subType)}
      </Table.Cell>
      <Table.Cell className="diff-value">
        {hideContent ? null : contents}
      </Table.Cell>
    </Fragment>
  );
}

function DiffTable(props) {
  const { rows, labels } = props;
  const columnCount = 1 + labels.length * 3;

  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell rowSpan={2}>Field Number</Table.HeaderCell>
          {labels.map(label => (
            <Table.HeaderCell
              key={label}
              className="diff-input-start"
              colSpan={3}
            >
              {label}
            </Table.HeaderCell>
          ))}
        </Table.Row>
        <Table.Row>
          {labels.map(label => (
            <Fragment key={label}>
              <Table.HeaderCell className="diff-input-start">
                Byte Range
              </Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Content</Table.HeaderCell>
            </Fragment>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row, i) => (
          <Fragment key={i}>
            <Table.Row className="diff-row" warning={row.status !== "same"}>
              <Table.Cell>{row.index}</Table.Cell>
              {row.cells.map((cell, j) => (
                <DiffCells
                  key={j}
                  cell={cell}
                  hideContent={row.children !== null && row.index !== -1}
                />
              ))}
            </Table.Row>
            {row.children && (
              <Table.Row>
                <Table.Cell colSpan={columnCount}>
                  <DiffTable rows={row.children} labels={labels} />
                </Table.Cell>
              </Table.Row>
            )}
          </Fragment>
        ))}
      </Table.Body>
    </Table>
  );
}

function ProtobufDiffDisplay(props) {
  const { value } = props;
  const labels = value.leftOvers.map((_, i) => String.fromCharCode(65 + i));

  const leftOvers = value.leftOvers.map((leftOver, i) =>
    leftOver.length ? (
      <p key={i}>
        {`Left over bytes (${labels[i]}): ${bufferToPrettyHex(leftOver)}`}
      </p>
    ) : null
  );

  return (
    <Fragment>
      <DiffTable rows={value.rows} labels={labels} />
      {value.leftOverChanged ? (
        <Message negative>{leftOvers}</Message>
      ) : (
        leftOvers
      )}
    </Fragment>
  );
}

export default ProtobufDiffDisplay;
