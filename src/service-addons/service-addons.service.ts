import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {AddonsEntity} from "@/service-addons/entity/addons.entity";
import {Repository} from "typeorm";
import {ServiceAddonMapper} from "@/service-addons/mapper/serviceAddon.mapper";
import {ValidID} from "@/utils/validID";
import {UpdateAddonsDto} from "@/service-addons/dto/update-addons.dto";
import {ReadAddonsDto} from "@/service-addons/dto/read-addons.dto";
import {CreateAddonsDto} from "@/service-addons/dto/create-addons.dto";

import { SubCategoryService } from '@/sub-category/sub-category.service';
import { SubCategoryEntity } from '@/sub-category/entity/sub-category.entity';


@Injectable()
export class ServiceAddonService {

  constructor(
      @InjectRepository(AddonsEntity)
      private readonly serviceAddonRepository: Repository<AddonsEntity>,
      private readonly subCategoryService : SubCategoryService
  ) {}

  async create (createServiceAddonDto : CreateAddonsDto): Promise<ReadAddonsDto> {
    let entity = this.serviceAddonRepository.create(createServiceAddonDto);

    let subCategory = await this.subCategoryService.findOne(new ValidID(createServiceAddonDto.fkService));

    if(!subCategory){ throw new HttpException(`Service  with ID ${createServiceAddonDto.fkService} not found`, HttpStatus.NOT_FOUND);}

    entity.subCategory = { pkSubCategory : subCategory.pkSubCategory  } as SubCategoryEntity;


    return ServiceAddonMapper.entityToReadServiceAddonDto(
        await this.serviceAddonRepository.save(
            ServiceAddonMapper.createServiceAddonDtoToEntity(createServiceAddonDto)
        )
    );
  }

  async findOne (validId : ValidID): Promise<ReadAddonsDto> {
    const entity = await this.serviceAddonRepository.findOne({
      where: { pkAddon: validId.id },
    });
    if(!entity){
      throw new HttpException(`Service Addon with ID ${validId.id} not found`, HttpStatus.NOT_FOUND);
    }
    return ServiceAddonMapper.entityToReadServiceAddonDto(entity);
  }

  async findAll (): Promise<ReadAddonsDto[]> {
    const entities = await this.serviceAddonRepository.find({
      relations: ['service'],
    });
    return entities.map(entity => ServiceAddonMapper.entityToReadServiceAddonDto(entity));
  }

  async remove (validID : ValidID): Promise<{ message: string; status: HttpStatus }> {
    const found = await this.findOne(validID);

    const responseDeleted = await this.serviceAddonRepository.remove(
        this.serviceAddonRepository.create(found)
    );

    if(!responseDeleted) {
      return { message: "Service Addon Not Deleted", status: HttpStatus.NOT_MODIFIED };
    }

    return {
      message: "Service Addon Deleted",
      status: HttpStatus.OK
    };
  }

  // Considerar la actualizaci´n con los FKS existentes / testear
  async update (updateServiceAddonDto: UpdateAddonsDto): Promise<{
    message: string; status: HttpStatus , addon: ReadAddonsDto | null
  }> {
    const entity = await this.serviceAddonRepository.findOne({
      where: { pkAddon: updateServiceAddonDto.pkAddon },
    });

    if(!entity){ throw new HttpException(`Service Addon with ID ${updateServiceAddonDto.pkAddon} not found`, HttpStatus.NOT_FOUND);}

    const updatedEntity = ServiceAddonMapper.updateServiceAddonDtoToEntity(updateServiceAddonDto);
    const mergedEntity = this.serviceAddonRepository.merge(entity, updatedEntity);


    const updateResult = await this.serviceAddonRepository.save(mergedEntity);

    if(!updateResult) {
      return { message: "Service Addon Not Updated", status: HttpStatus.NOT_MODIFIED, addon:null };
    }

    return {
      message: "Service Addon Updated",
      status: HttpStatus.OK,
      addon: ServiceAddonMapper.entityToReadServiceAddonDto(updateResult)
    };
  }


  async findOAllByService (pkService:number){

    const serviceWithAddons = await this.subCategoryService.findOneWithAddons(pkService);

    if(!serviceWithAddons){throw new HttpException(`Service with ID ${pkService} not found`, HttpStatus.NOT_FOUND);}

    return serviceWithAddons;

  }


}