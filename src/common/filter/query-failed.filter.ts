import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { QueryFailedError } from "typeorm";

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        console.log(exception.message);

        res.status(400).json({
            statusCode: 400,
            path: req.url,
        })
    }
}