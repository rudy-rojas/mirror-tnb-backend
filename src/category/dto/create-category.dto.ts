import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import {ApiProperty, OmitType} from "@nestjs/swagger";
import {CategoryEntity} from "@/category/entities/category.entity";

export class CreateCategoryDto extends OmitType(CategoryEntity, [
  'pkCategory','status','createdAt','updatedAt'
]){

  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @ApiProperty()
  name: string;

  @IsString({ message: 'Description is required' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @ApiProperty()
  description: string;

}