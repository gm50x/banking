import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BanksController } from './controllers';
import {
  BacenBanksService,
  banksFallback,
  BanksService,
  FallbackBanksService,
} from './services';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [BanksController],
  providers: [
    BanksService,
    BacenBanksService,
    FallbackBanksService,
    {
      provide: 'BACEN_BANKS_URL',
      useValue:
        'https://www.bcb.gov.br/pom/spb/estatistica/port/ParticipantesSTRport.csv',
    },
    {
      provide: 'BANKS_FALLBACK',
      useValue: Object.freeze(banksFallback.map((x) => Object.freeze(x))),
    },
  ],
})
export class AppModule {}
