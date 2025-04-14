export default class ApiResponse<T> {
    statusCode: any;
    message: string;
    data: T;
    success: boolean;
    constructor(statusCode:number, message: string, data: T){
        this.statusCode = statusCode,
        this.message = message,
        this.data = data,
        this.success = statusCode<400
    }
}