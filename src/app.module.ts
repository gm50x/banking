import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BanksController } from './controllers';
import { banksFallback, BanksService } from './services';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [BanksController],
  providers: [
    BanksService,
    {
      provide: 'BACEN_BANKS_URL',
      useValue:
        'https://www.bcb.gov.br/pom/spb/estatistica/port/ParticipantesSTRport.csv',
    },
    {
      provide: 'BANKS_FALLBACK',
      useValue: banksFallback,
    },
  ],
})
export class AppModule {}
