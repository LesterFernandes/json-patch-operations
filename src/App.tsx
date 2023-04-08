import cloneDeep from "lodash.clonedeep";
import { FC, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import "./App.css";
import { IOperationType, IPatch } from "./commonInterfaces";
import AdditionalEntries from "./components/AdditionalEntries";
import DisplayDifference from "./components/DisplayDifference";
import { OriginalJson } from "./components/OriginalJson";
import { SingleIndent } from "./components/styled";
import { useJsonContext } from "./context/JsonContext";

interface IOperation {
  value: string | Record<string, unknown>;
  op: IOperationType;
}

const OpenBracket: FC<{ isArray?: boolean }> = ({ isArray }) => {
  return isArray ? <span>{"["}</span> : <span>{"{"}</span>;
};

const CloseBracket: FC<{ isArray?: boolean }> = ({ isArray }) => {
  return isArray ? <span>{"]"}</span> : <span>{"}"}</span>;
};

const applyFullIndentation: (
  indentation: number,
  keyPrefix: string
) => JSX.Element[] = (indentation, keyPrefix) => {
  return Array(indentation)
    .fill(null)
    .map((_, index) => <SingleIndent key={keyPrefix + index} />);
};

const editBaseJson = (
  obj: Record<string, unknown>,
  path: string[],
  value: any
) => {
  if (path.length == 1) {
    let [key] = path;
    obj[key] = value;
  } else {
    let key = path.shift();
    editBaseJson(obj[`${key}`], path, value);
  }
};

const App: FC<{}> = () => {
  const [baseJson, setJson] = useState<Record<string, unknown>>({});
  const [patchJson, setPatchJson] = useState<IPatch[]>([]);

  const { isFetching: isFetchingJsonz, data, updateContext } = useJsonContext();

  useEffect(() => {
    if (isFetchingJsonz == false) {
      const { json, patch } = cloneDeep(data);
      const allAddOps: IPatch[] = patch.filter(
        ({ op }) => op == "add"
      ) as IPatch[];

      allAddOps.forEach(({ path, value }) => {
        const [_, ...pathz] = path.split("/");
        editBaseJson(json, pathz, value);
      });
      setJson(json);
      setPatchJson(patch);
    }
  }, [isFetchingJsonz]);

  const acceptClickHandler = (path: string[], operation: IOperation) => {
    if (operation.op == "replace") {
      const baseClone = cloneDeep(baseJson);
      editBaseJson(baseClone, [...path], operation.value);
      setJson(baseClone);
    }

    patchJson.splice(
      patchJson.findIndex((p) => p.path === "/" + path?.join("/")),
      1
    );
    setPatchJson([...patchJson]);

    if (updateContext) {
      const contextJsonClone = cloneDeep(data.json);
      editBaseJson(contextJsonClone, [...path], operation.value);
      updateContext({json: contextJsonClone, patch: patchJson})
    }
  };

  const rejectClickHandler = (path: string[]) => {
    patchJson.splice(
      patchJson.findIndex((p) => p.path === "/" + path?.join("/")),
      1
    );
    setPatchJson([...patchJson]);
    if (updateContext) {
      updateContext({patch: patchJson})
    }
  };

  const acceptRejectHandlers = (path: string[], operation: IOperation) => {
    return (
      <>
        <Button
          size="sm"
          variant="link"
          onClick={() => acceptClickHandler(path, operation)}
        >
          Accept
        </Button>

        <Button
          size="sm"
          variant="link"
          onClick={() => rejectClickHandler(path)}
        >
          Reject
        </Button>
      </>
    );
  };

  const renderRow = ({
    key,
    value,
    indentation,
    path,
  }: {
    key: string;
    value: React.ReactNode;
    indentation: number;
    path?: string[];
  }): JSX.Element => {
    const { op, value: newValue } =
      patchJson.find((p) => {
        return p.path === "/" + path?.join("/");
      }) || {};

    if (op && newValue && op == "add") {
      return (
        <Stack
          key={key + value}
          direction="horizontal"
          gap={1}
          className="align-items-start"
        >
          {applyFullIndentation(indentation, key + value)}
          <AdditionalEntries
            newKey={key}
            newValue={newValue}
            acceptRejectHandlers={() =>
              acceptRejectHandlers(path!, { op, value: newValue })
            }
          />
        </Stack>
      );
    }

    if (op && newValue && op == "replace") {
      return (
        <Stack
          key={key + value}
          direction="horizontal"
          gap={1}
          className="align-items-start"
        >
          {applyFullIndentation(indentation, key + value)}
          <div key={key + value + (indentation + 1)}>{key} :</div>
          <div key={key + value + (indentation + 2)}>
            <DisplayDifference
              newValue={newValue}
              oldValue={value as string}
              acceptRejectHandlers={() =>
                acceptRejectHandlers(path!, { op, value: newValue })
              }
            />
          </div>
        </Stack>
      );
    }

    return (
      <Stack
        key={key + value}
        direction="horizontal"
        gap={1}
        className="align-items-start"
      >
        {applyFullIndentation(indentation, key + value)}
        <div key={key + value + (indentation + 1)}>{key} :</div>
        <div key={key + value + (indentation + 2)}>{value}</div>
      </Stack>
    );
  };

  const renderJson = ({
    obj,
    indentation = 0,
    path = [],
  }: {
    obj: Record<string, unknown>;
    indentation?: number;
    path?: string[];
  }): JSX.Element[] => {
    let rez: JSX.Element[] = [];
    for (let key in obj) {
      if (typeof obj[key] == "object") {
        rez.push(
          renderRow({
            key,
            value: <OpenBracket isArray={Array.isArray(obj[key])} />,
            indentation,
          })
        );
        rez = [
          ...rez,
          ...renderJson({
            obj: obj[key] as Record<string, unknown>,
            indentation: indentation + 1,
            path: [...path, key],
          }),
        ];
        rez.push(
          <Stack key={key + indentation} direction="horizontal" gap={1}>
            {applyFullIndentation(indentation, key)}
            <div>
              <CloseBracket isArray={Array.isArray(obj[key])} />
            </div>
          </Stack>
        );
      } else {
        rez.push(
          renderRow({
            key,
            value: obj[key] as string,
            indentation,
            path: [...path, key],
          })
        );
      }
    }
    return rez;
  };

  return (
    <div className="container-lg mt-4">
      <div className="diff-viewer bg-dark text-light my-3 p-3">
        <OpenBracket />
        <div className="ps-3">{renderJson({ obj: baseJson })}</div>
        <CloseBracket />
      </div>
      <OriginalJson />
    </div>
  );
};

export default App;
