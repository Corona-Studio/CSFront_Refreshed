import { Params } from "react-router";

export default interface IMatches {
    id: string;
    pathname: string;
    params: Params<string>;
    loaderData: unknown;
    handle: unknown;
}
