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

  async findByName(name: string): Promise<BanksResponse> {
    const normalize = (value: string) =>
      value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const upperIncludes = (elm = '', search = '') =>
      elm.toUpperCase().includes(search.toUpperCase());

    const allBanks = await this.getAll();

    const normalizedName = normalize(name);

    const data = allBanks.data.filter(
      (x) =>
        upperIncludes(normalize(x.fullName), normalizedName) ||
        upperIncludes(x.name, normalizedName),
    );

    const output = {
      data,
      provider: allBanks.provider,
    };

    return output;
  }
}
