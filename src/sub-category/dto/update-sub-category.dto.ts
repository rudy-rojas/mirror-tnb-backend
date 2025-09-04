import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { SubCategoryEntity } from '@/sub-category/entity/sub-category.entity';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateSubCategoryDto extends OmitType(SubCategoryEntity,
    ['createdAt','updatedAt','addons']
) {

    @ApiProperty()
    @IsNumber()
    pkSubCategory: number;

    @ApiProperty()@IsString()@IsNotEmpty()
    name: string;

    @ApiProperty()@IsString()@IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    priceFrom: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    priceTo: number;

    @ApiProperty()@IsNumber()
    status: number;

    @ApiProperty()@IsNumber()
    fkCategory: number;

    @IsNumber()@ApiProperty()
    @IsNotEmpty({ message: 'Fk client type cannot be empty' })
    fkClientType : number;

    @IsNumber()@ApiProperty()
    @IsNotEmpty({ message: 'Fk service type cannot be empty' })
    fkServiceType : number;
}
