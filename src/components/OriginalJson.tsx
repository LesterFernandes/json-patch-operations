import React from "react";
import { Stack } from "react-bootstrap";
import { useJsonContext } from "../context/JsonContext";
import { OriginalJsonContainer } from "./styled";

interface OriginalJsonProps {}

export const OriginalJson: React.FC<OriginalJsonProps> = ({}) => {
  const {
    data: { json, patch },
    isFetching,
  } = useJsonContext();
  if (isFetching) {
    return <></>;
  }
  return (
    <OriginalJsonContainer>
      <Stack
        direction="horizontal"
        className="justify-content-around align-items-start"
      >
        <div>
          <h2>Base Object</h2>
          <pre>{JSON.stringify(json, null, 2)}</pre>
        </div>
        <div>
          <h2>JSON Patch</h2>
          <pre>{JSON.stringify(patch, null, 2)}</pre>
        </div>
      </Stack>
    </OriginalJsonContainer>
  );
};
