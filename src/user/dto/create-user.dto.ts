import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'username',
        example: "test",
    })
    name: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsNumber()
    @IsNotEmpty()
    age: number;

    @IsIn(['male', 'female'])
    @IsNotEmpty()
    gender: 'male' | 'female';

    // @IsString()
    // @IsNotEmpty()
    // @IsOptional()
    // profilePic?: string;
}
