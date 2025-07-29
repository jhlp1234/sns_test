import { IsNotEmpty, IsString } from "class-validator";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
