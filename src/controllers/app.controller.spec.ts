import { Test, TestingModule } from '@nestjs/testing';
import { BanksController } from './banks.controller';
import {
  BacenBanksService,
  BanksService,
  FallbackBanksService,
} from '../services';
import { HttpService } from '@nestjs/axios';

describe('AppController', () => {
  let subject: BanksController;
  let service: BanksService;

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
      const expected = Object.freeze([
        Object.freeze({
          code: 100,
          fullName: 'Mocky Bank',
          ispb: 'MOCK',
          name: 'Mock',
        }),
      ]);
      jest.spyOn(service, 'getAll').mockImplementation(async () => ({
        data: [expected[0]],
        provider: 'MOCK',
      }));

      const actual = await subject.getAll();
      expect([actual.data[0]]).toStrictEqual(expected);
      expect(actual.provider).toBe('MOCK');
    });
  });
});
