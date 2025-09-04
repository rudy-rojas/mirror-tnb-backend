import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  HttpStatus,
  Post,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  HttpException,
  Req, 
} from '@nestjs/common';
import { Request } from 'express'; 
import { ValidID } from '@/utils/validID';
import { UpdateMobileCampaignDto } from './dto/update-campaigns.dto';
import { ReadMobileCampaignDto } from './dto/read-campaigns.dto';
import { CreateMobileCampaignDto } from './dto/create-campaigns.dto';
import { UploadCampaignImageDto } from './dto/upload-image.dto';
import { MobileCampaignService } from './campaigns.service';
import { CampaignInterestService } from '../campaign-interest/campaign-interest.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ReadCampaignInterestDto } from '../campaign-interest/dto/read-campaigns-interest.dto';



@ApiTags('Campañas App Mobile')
@Controller('mobile-campaigns')
export class MobileCampaignController {
  constructor(
    private readonly mobileCampaignService: MobileCampaignService,
    private readonly CampaignInterestService: CampaignInterestService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva campaña móvil' })
  @ApiResponse({ status: 201, description: 'Campaña móvil creada exitosamente.', type: ReadMobileCampaignDto })
  @ApiResponse({ status: 400, description: 'Datos de la campaña inválidos.' })
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createMobileCampaignDto: CreateMobileCampaignDto,
  ): Promise<ReadMobileCampaignDto> {
    return this.mobileCampaignService.create(createMobileCampaignDto);
  }

  @ApiOperation({ summary: 'Obtener todas las campañas móviles' })
  @ApiResponse({ status: 200, description: 'Lista de todas las campañas móviles.', type: [ReadMobileCampaignDto] })
  @Get()
  async findAll(): Promise<ReadMobileCampaignDto[]> {
    return this.mobileCampaignService.findAll();
  }

  @ApiOperation({ summary: 'Obtener todas las campañas móviles activas' })
  @ApiResponse({ status: 200, description: 'Lista de todas las campañas móviles que están activas y dentro de su rango de fechas.', type: [ReadMobileCampaignDto] })
  @Get('active')
  async findActiveCampaigns(): Promise<ReadMobileCampaignDto[]> {
    return this.mobileCampaignService.findActiveCampaigns();
  }

  @ApiOperation({ summary: 'Obtener una campaña móvil por ID' })
  @ApiResponse({ status: 200, description: 'Campaña móvil encontrada.', type: ReadMobileCampaignDto })
  @ApiResponse({ status: 404, description: 'Campaña móvil no encontrada.' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReadMobileCampaignDto> {
    return this.mobileCampaignService.findOne(new ValidID(id));
  }

  @Post(':id/express-interest')
  @ApiOperation({ summary: 'Registrar interés de un usuario en una campaña' })
  @ApiResponse({ status: 200, description: 'Interés registrado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Campaña no encontrada.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 123 }, 
      },
    },
  })
  async expressInterest(
    @Param('id', ParseIntPipe) campaignId: number,
    @Body('userId', ParseIntPipe) userId: number, 
    @Req() request: Request, 
  ) {
    if (userId === undefined || userId === null) { 
      throw new HttpException('El ID de usuario es obligatorio.', HttpStatus.BAD_REQUEST);
    }

    const ipAddress = request.ip || request.headers['x-forwarded-for']?.toString();
    const userAgent = request.headers['user-agent']; 

    await this.mobileCampaignService.expressInterest(campaignId, userId, ipAddress, userAgent); 
    return { message: 'Interés registrado y notificado al backoffice.' };
  }

  @ApiOperation({ summary: 'Actualizar una campaña móvil' })
  @ApiResponse({ status: 200, description: 'Campaña móvil actualizada exitosamente.', type: ReadMobileCampaignDto })
  @ApiResponse({ status: 404, description: 'Campaña móvil no encontrada.' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateMobileCampaignDto: UpdateMobileCampaignDto,
  ): Promise<ReadMobileCampaignDto> {
    return this.mobileCampaignService.update(id, updateMobileCampaignDto);
  }

  @ApiOperation({ summary: 'Eliminar una campaña móvil por ID' })
  @ApiResponse({ status: 200, description: 'Campaña móvil eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Campaña móvil no encontrada.' })
  @Delete(":id")
  async remove(@Param("id",ParseIntPipe) id: number): Promise<{ message: string, status: HttpStatus }> {
    return this.mobileCampaignService.remove(id);
  }

  @Get('interests/last-10')
  @ApiOperation({ summary: 'Obtener los 10 intereses de campaña más recientes' })
  @ApiResponse({ status: 200, description: 'Lista de los últimos 10 intereses registrados.', type: [ReadCampaignInterestDto] })
  async findLast10Interests(): Promise<ReadCampaignInterestDto[]> {
    return this.CampaignInterestService.findLast10Interests();
  }

  @Post('upload-image/:campaignId')
  @ApiOperation({ summary: 'Subir una imagen para una campaña móvil existente' })
  @ApiResponse({ status: 200, description: 'Imagen de campaña cargada exitosamente y URL actualizada.', type: ReadMobileCampaignDto })
  @ApiResponse({ status: 400, description: 'Error al cargar la imagen o ID de campaña inválido.' })
  @ApiResponse({ status: 404, description: 'Campaña no encontrada.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen para la campaña. Se actualizará el campo `imageUrl` de la campaña.',
    type: UploadCampaignImageDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '../../../../images/campaigns');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = `campaign-${uniqueSuffix}${extname(file.originalname)}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return cb(new HttpException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)!', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCampaignImage(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ReadMobileCampaignDto> {
    if (!file) {
      throw new HttpException('No se ha subido ningún archivo.', HttpStatus.BAD_REQUEST);
    }

    const imageUrl = `/images/campaigns/${file.filename}`;

    return this.mobileCampaignService.updateCampaignImageUrl(campaignId, imageUrl);
  }
}