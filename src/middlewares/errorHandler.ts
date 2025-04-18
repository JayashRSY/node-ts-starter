// import { logEvents } from './logger.ts';
import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    // logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
    console.log(err.stack);

    const status = res.statusCode || 500; // server error 

    res.status(status).json({ message: err.message, isError: true });
}

export default errorHandler;
