export class Bank {
  ispb: string;
  name: string;
  code: number;
  fullName: string;

  constructor(opts: Partial<Bank>) {
    Object.assign(this, opts);
  }
}

export class BanksResponse {
  provider: string;
  data: Bank[];
}

export class BankResponse {
  provider: string;
  data: Bank;
}
