import { Bank } from '../models';

export type BankWhereUnique = {
  code?: number;
  ispb?: string;
};

export interface BankProvider {
  getAll(): Promise<Bank[]>;
  getBy(unique: BankWhereUnique): Promise<Bank>;
}
