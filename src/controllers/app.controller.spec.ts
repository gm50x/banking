import { Test, TestingModule } from '@nestjs/testing';
import { BanksController } from './banks.controller';
import {
  BacenBanksService,
  BanksService,
  FallbackBanksService,
} from '../services';
import { HttpService } from '@nestjs/axios';
import { Bank } from '../models';
import { NotFoundException } from '@nestjs/common';

const banks = Object.freeze(
  ['foo', 'bar', 'fizz', 'buzz', 'bin', 'baz'].map((x, i) =>
    Object.freeze(
      new Bank({
        code: i + 1,
        fullName: x,
        name: x,
        ispb: `ISPB4${x}`,
      }),
    ),
  ),
);

describe('AppController', () => {
  let subject: BanksController;
  let service: BanksService;
  let bacen: BacenBanksService;
  let fallback: FallbackBanksService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BanksController],
      providers: [
        BanksService,
        BacenBanksService,
        FallbackBanksService,
        { provide: HttpService, useValue: {} },
        { provide: 'BACEN_BANKS_URL', useValue: 'NULL' },
        { provide: 'BANKS_FALLBACK', useValue: [] },
      ],
    }).compile();

    subject = app.get(BanksController);
    service = app.get(BanksService);
    bacen = app.get(BacenBanksService);
    fallback = app.get(FallbackBanksService);

    const mockGetAll = (target: any) =>
      jest
        .spyOn(target, 'getAll')
        .mockImplementation(async () => Promise.resolve(banks as Bank[]));

    mockGetAll(bacen);
    mockGetAll(fallback);
  });

  describe('GET banks', () => {
    it('should not ring the bell', async () => {
      jest
        .spyOn(service, 'getAll')
        .mockImplementation(async () => ({ data: [], provider: 'MOCK' }));

      const actual = await subject.getAll();
      expect(actual.provider).toBe('MOCK');
    });

    it('should return a list of banks', async () => {
      const expected = banks.find((x) => x.name === 'foo');

      const actual = await subject.getAll();
      expect(actual.data[0]).toStrictEqual(expected);
    });

    it('should allow passage of a search string', async () => {
      const expected = banks.find((x) => x.name === 'foo');

      jest.spyOn(service, 'findByName');
      const actual = await subject.getAll(expected.name);

      expect(service.findByName).toHaveBeenCalled();
      expect(actual.data).toBeDefined();
      expect(actual.data[0]).toStrictEqual(expected);
    });
  });

  describe('GET banks/:codeOrISPB', () => {
    it('should not ring the bell', async () => {
      const expected = banks.find((x) => x.name === 'foo');
      jest.spyOn(service, 'getBy').mockImplementation(async () => ({
        data: expected,
        provider: 'MOCK',
      }));

      const actual = await subject.getByCodeOrISPB(expected.code.toString());
      expect(actual.provider).toBe('MOCK');
    });

    ['code:1', 'ispb:ISPB4foo', '1'].forEach((s) => {
      it(`should return bank for ${s} scenario`, async () => {
        const [, value] = s.includes(':') ? s.split(':') : ['code', s];
        const expected = banks.find(
          (x) => x.code === Number(value) || x.ispb === value,
        );
        const actual = await subject.getByCodeOrISPB(s);
        expect(actual.data).toStrictEqual(expected);
      });
    });
    it('should return bank by code only', async () => {
      const expected = banks.find((x) => x.name === 'foo');
      const actual = await subject.getByCodeOrISPB(expected.code.toString());
      expect(actual.data).toStrictEqual(expected);
    });

    it('should accept prefixed code:', async () => {
      const expected = banks.find((x) => x.name === 'foo');
      const actual = await subject.getByCodeOrISPB(`code:${expected.code}`);
      expect(actual.data).toStrictEqual(expected);
    });

    it('should accept prefixed ispb:', async () => {
      const expected = banks.find((x) => x.name === 'foo');
      const actual = await subject.getByCodeOrISPB(`ispb:${expected.ispb}`);
      expect(actual.data).toStrictEqual(expected);
    });

    ['code:nonexistant', 'ispb:nonexistant', 'nonexistant'].forEach((s) => {
      it(`should return not found error for ${s} scenario`, async () => {
        await subject.getByCodeOrISPB(s).catch((err) => {
          const [type, value] = s.includes(':') ? s.split(':') : ['code', s];

          const errMessage = `Bank with ${type} ${value} could not be found!`;
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe(errMessage);
        });
      });
    });
  });
});
