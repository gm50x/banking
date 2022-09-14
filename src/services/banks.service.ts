import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { Bank, BankResponse, BanksResponse } from '../models';
import { parseBacenCSV } from './parser.operator';

@Injectable()
export class BanksService {
  private bacenCache: { data: Bank[]; expireAt: number };
  constructor(
    private readonly http: HttpService,
    @Inject('BACEN_BANKS_URL') private readonly bacenUrl: string,
    @Inject('BANKS_FALLBACK') private readonly fallback: Bank[],
  ) {}

  private async getFromBacen(): Promise<Bank[]> {
    return firstValueFrom(
      this.http.get<string>(this.bacenUrl).pipe(
        map((response) => response.data),
        parseBacenCSV,
      ),
    );
  }

  private async getFromBacenCached(): Promise<BanksResponse> {
    const isCacheValid =
      this.bacenCache && this.bacenCache.expireAt > Date.now();

    if (!isCacheValid) {
      const data = await this.getFromBacen();
      const fiveMinutesInMillisseconds = 1000 * 60 * 5;
      this.bacenCache = {
        expireAt: Date.now() + fiveMinutesInMillisseconds,
        data,
      };
    }

    return {
      provider: 'BACEN',
      data: this.bacenCache.data,
    };
  }

  private getFromFallback(): BanksResponse {
    const data = this.fallback.map((x) => new Bank(x));
    return {
      data,
      provider: 'FALLBACK',
    };
  }

  async getAll(): Promise<BanksResponse> {
    return this.getFromBacenCached().catch(() => this.getFromFallback());
  }

  async findByName(name: string): Promise<BanksResponse> {
    const upperIncludes = (elm = '', search = '') =>
      elm.toUpperCase().includes(search.toUpperCase());

    const allBanks = await this.getAll();

    const data = allBanks.data.filter(
      (x) => upperIncludes(x.fullName, name) || upperIncludes(x.name, name),
    );

    const output = {
      data,
      provider: allBanks.provider,
    };

    return output;
  }

  async getByCode(code: number): Promise<BankResponse> {
    const { provider, data: allBanks } = await this.getAll();
    const data = allBanks.find((bank) => bank.code === code);

    return {
      provider,
      data,
    };
  }
}
