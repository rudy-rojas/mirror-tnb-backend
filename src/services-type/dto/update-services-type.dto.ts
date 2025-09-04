import { PartialType } from '@nestjs/swagger';
import {IsNumber, IsString, IsOptional} from 'class-validator';
import {ServicesTypeEntity} from "@/services-type/entity/services-type.entity";

export class UpdateServicesTypeDto extends PartialType(ServicesTypeEntity) {
    @IsNumber()
    pkType: number;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber()
    @IsOptional()
    status: number;

    @IsString()
    @IsOptional()
    createdAt: Date;

    @IsString()
    @IsOptional()
    updatedAt: Date;
}