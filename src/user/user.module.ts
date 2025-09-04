import { PersonAddressEntity } from "@/person-address/entities/person-address.entity";
import { PersonPhoneEntity } from "@/person-phones/entities/person-phone.entity";
import { PersonEntity } from "@/person/entities/person.entity";
import { PersonMapperModule } from "@/person/mapper/person.mapper.module";
import { ProfileMapperModule } from "@/profile/mapper/profile.mapper.module";
import { UserEntity } from "@/user/entities/user.entity";
import { UserMapperModule } from "@/user/mapper/user.mapper.module";
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Module({
  imports: [
      TypeOrmModule.forFeature([UserEntity, PersonEntity, PersonPhoneEntity, PersonAddressEntity]),
      UserMapperModule,
      PersonMapperModule,
      ProfileMapperModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET'), 
          signOptions: { expiresIn: '12h' }, 
      }),
    })
  ],
  controllers: [UserController],
  providers: [UserService],
  exports:[ProfileMapperModule, UserService]
})
export class UserModule {}

