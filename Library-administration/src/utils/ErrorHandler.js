class ErrorHandler extends Error{
    constructor(statusCode,message,errors=[]){
        super(message);
        this.statusCode=statusCode;
        this.errors = errors;
        if(Error.captureStackTrace){
            Error.captureStackTrace(this,this.constructor);
        }
        this.name = this.constructor.name;
        
    }
}

export default ErrorHandler