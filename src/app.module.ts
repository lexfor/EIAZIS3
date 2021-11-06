import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { poolFactory } from './configs/database.config';
import { AppRepository } from './app.repository';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    {
      provide: 'DATABASE_POOL',
      inject: [ConfigService],
      useFactory: poolFactory,
    },
    {
      provide: 'DATABASE_REPOSITORY',
      useClass: AppRepository,
    },
    AppService,
  ],
})
export class AppModule {}
