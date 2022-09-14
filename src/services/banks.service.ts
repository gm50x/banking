import { Injectable } from '@nestjs/common';
import { BankResponse, BanksResponse } from 'src/models';
import { BacenBanksService } from './bacen-banks.service';
import { BankWhereUnique } from './bank-provider.interface';
import { FallbackBanksService } from './fallback-banks.service';

@Injectable()
export class BanksService {
  constructor(
    private readonly bacen: BacenBanksService,
    private readonly fallback: FallbackBanksService,
  ) {}

  async getAll(): Promise<BanksResponse> {
    return this.bacen
      .getAll()
      .then((data) => ({
        provider: 'BACEN',
        data,
      }))
      .catch(() =>
        this.fallback.getAll().then((data) => ({
          provider: 'FALLBACK',
          data,
        })),
      );
  }

  async getBy(where: BankWhereUnique): Promise<BankResponse> {
    return this.bacen
      .getBy(where)
      .then((data) => ({
        provider: 'BACEN',
        data,
      }))
      .catch(() =>
        this.fallback.getBy(where).then((data) => ({
          provider: 'FALLBACK',
          data,
        })),
      );
  }
}
