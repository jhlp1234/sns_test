import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserId = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if(!req.user || !req.user.sub) throw new BadRequestException('잘못됨');

    return req.user.sub;
});