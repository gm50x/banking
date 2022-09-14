import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { Bank } from '../models';
import { parseBacenCSV } from './parser.operator';
import { BankProvider, BankWhereUnique } from './bank-provider.interface';

@Injectable()
export class BacenBanksService implements BankProvider {
  private bacenCache: { data: Bank[]; expireAt: number };

  constructor(
    private readonly http: HttpService,
    @Inject('BACEN_BANKS_URL') private readonly bacenUrl: string,
  ) {}

  private async getFromBacen(): Promise<Bank[]> {
    return firstValueFrom(
      this.http.get<string>(this.bacenUrl).pipe(
        map((response) => response.data),
        parseBacenCSV,
      ),
    );
  }

  private async getFromBacenCached(): Promise<Bank[]> {
    const isCacheValid =
      this.bacenCache && this.bacenCache.expireAt > Date.now();

    if (!isCacheValid) {
      const data = await this.getFromBacen();
      const fiveMinutesInMillisseconds = 1000 * 60 * 5;
      this.bacenCache = {
        expireAt: Date.now() + fiveMinutesInMillisseconds,
        data: data.map((x) => Object.freeze(x)),
      };
    }

    return [...this.bacenCache.data];
  }

  async getAll(): Promise<Bank[]> {
    return this.getFromBacenCached();
  }

  async getBy({ code, ispb }: BankWhereUnique): Promise<Bank> {
    return this.getAll().then((allBanks) =>
      allBanks.find((x) => x.code === code || x.ispb === ispb),
    );
  }
}
