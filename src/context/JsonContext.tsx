import {
  useState,
  useEffect,
  useContext,
  createContext,
  FC,
  ReactNode,
  useReducer,
} from "react";
import { IOperationType, IPatch, TContext } from "../commonInterfaces";
import { fetchBaseJson, fetchPatchJson } from "../requests/fakeApi";

interface IJson {
  json: Record<string, unknown>;
  patch: IPatch[];
}

const JsonContext = createContext<
  TContext<IJson> & { updateContext?: (update: Partial<IJson>) => void }
>({
  data: {
    json: {},
    patch: [],
  },
  isFetching: false,
});

export const useJsonContext = () => {
  return useContext(JsonContext);
};

const JsonProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<IJson>({ json: {}, patch: [] });
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const [json, patch] = await Promise.all([
          fetchBaseJson(),
          fetchPatchJson() as Promise<IPatch[]>,
        ]);
        setIsFetching(false);
        setData({
          json,
          patch,
        });
      } catch (error) {
        setIsFetching(false);
        console.log("Errah", error);
      }
    };
    fetchData();
  }, [setData, setIsFetching]);

  const updateContext = (update: Partial<IJson>) => {
    setData({...data, ...update});
  };

  return (
    <JsonContext.Provider value={{ data, isFetching, updateContext }}>
      {children}
    </JsonContext.Provider>
  );
};

export default JsonProvider;
