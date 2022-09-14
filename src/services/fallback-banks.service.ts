import { Inject, Injectable } from '@nestjs/common';
import { Bank } from '../models';
import { BankProvider, BankWhereUnique } from './bank-provider.interface';

@Injectable()
export class FallbackBanksService implements BankProvider {
  constructor(@Inject('BANKS_FALLBACK') private readonly data: Bank[]) {}

  async getAll(): Promise<Bank[]> {
    return this.data.map((x) => new Bank(x));
  }

  async getBy({ code, ispb }: BankWhereUnique): Promise<Bank> {
    return this.data.find((x) => x.code === code || x.ispb === ispb);
  }
}
