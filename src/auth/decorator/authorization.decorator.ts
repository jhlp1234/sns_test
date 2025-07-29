import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Authorization = createParamDecorator((data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    if(!req.headers || !req.headers['authorization']) throw new BadRequestException('정보 없음');
    
    return req.headers['authorization'];
});