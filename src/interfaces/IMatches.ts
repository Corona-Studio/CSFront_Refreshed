import { Params } from "react-router";

export default interface IMatches {
    id: string;
    pathname: string;
    params: Params<string>;
    data: unknown;
    handle: unknown;
}
