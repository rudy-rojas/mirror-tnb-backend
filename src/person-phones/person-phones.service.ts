import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonEntity } from 'src/person/entities/person.entity';
import {PersonPhoneEntity} from "@/person-phones/entities/person-phone.entity";
import {CreatePersonPhoneDto} from "@/person-phones/dto/create-person-phone.dto";
import {ReadPersonPhoneDto} from "@/person-phones/dto/read-person-phone.dto";
import {PersonPhoneMapper} from "@/person-phones/mapper/person-phone.mapper";
import {ValidID} from "@/utils/validID";
import {UpdatePersonPhoneDto} from "@/person-phones/dto/update-person-phone.dto";
import {UserEntity} from "@/user/entities/user.entity";

@Injectable()
export class PersonPhoneService {
  constructor(
      @InjectRepository(PersonPhoneEntity)
      private readonly phoneRepo: Repository<PersonPhoneEntity>,
      @InjectRepository(UserEntity) 
      private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(dto: CreatePersonPhoneDto): Promise<ReadPersonPhoneDto> {
    const entity = this.phoneRepo.create(dto);
    entity.person = { pkPerson: dto.fkPerson } as PersonEntity;
    const saved = await this.phoneRepo.save(entity);
    return PersonPhoneMapper.entityToReadPersonPhoneDto(saved);
  }

  async findAll(): Promise<ReadPersonPhoneDto[]> {
    const phones = await this.phoneRepo.find({ relations: ["person"] });
    return phones.map((phone) => PersonPhoneMapper.entityToReadPersonPhoneDto(phone));
  }

  async findOne(validID: ValidID): Promise<ReadPersonPhoneDto> {
    const phone = await this.phoneRepo.findOne({
      where: { pkPhone: validID.id },
      relations: ["person"],
    });
    if (!phone) {
      throw new HttpException(`Phone with ID ${validID.id} not found`, HttpStatus.NOT_FOUND);
    }
    return PersonPhoneMapper.entityToReadPersonPhoneDto(phone);
  }

  async findByPerson(id: number): Promise<ReadPersonPhoneDto[]> {
    const phones = await this.phoneRepo.find({
      where: { person: { pkPerson: id } },
      relations: ["person"]
    });
    if (!phones) {
      throw new HttpException(`Phone with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return phones.map(PersonPhoneMapper.entityToReadPersonPhoneDto);
  }

  async findByUser(id: number): Promise<ReadPersonPhoneDto[]> {
    const user = await this.userRepo.findOne({
      where: { pkUser: id },
    });
  
    if (!user) {
      throw new HttpException(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
  
    const phones = await this.phoneRepo.find({
      where: { person: { user: { pkUser: id } } }, 
    });
  
    if (!phones) {
      return []; 
    }
    return phones.map(PersonPhoneMapper.entityToReadPersonPhoneDto);
  }

  async update(dto: UpdatePersonPhoneDto): Promise<{
    message: string;
    status: HttpStatus;
    phone: ReadPersonPhoneDto | null;
  }> {
    const found = await this.phoneRepo.findOneBy({ pkPhone: dto.pkPhone });
    if (!found) {
      throw new HttpException('Phone Not Found', HttpStatus.NOT_FOUND);
    }

    this.phoneRepo.merge(found, dto);
    const updated = await this.phoneRepo.save(found);

    return {
      message: 'Phone Updated',
      status: HttpStatus.OK,
      phone: PersonPhoneMapper.entityToReadPersonPhoneDto(updated),
    };
  }

  async remove(id: number): Promise<{ message: string; status: HttpStatus }> {
    const phone = await this.phoneRepo.findOneBy({ pkPhone: id });
    if (!phone) {
      throw new HttpException(`Phone with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    const removed = await this.phoneRepo.remove(phone);

    if (!removed) return { message: 'Phone Not Deleted', status: HttpStatus.NOT_MODIFIED };

    return {
      message: 'Phone Deleted',
      status: HttpStatus.OK,
    };
  }
}
