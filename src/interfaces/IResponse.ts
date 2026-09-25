export default interface IResponse<T> {
    status: number;
    response?: T;
    message?: string;
}
