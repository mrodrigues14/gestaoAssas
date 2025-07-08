import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AsaasController } from './asaas.controller';
import { AsaasService } from './asaas.service';

@Module({
  imports: [ConfigModule],
  controllers: [AsaasController],
  providers: [AsaasService],
  exports: [AsaasService],
})
export class AsaasModule {}
