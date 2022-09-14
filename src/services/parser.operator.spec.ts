import { of } from 'rxjs';
import { Bank } from '../models';
import { parseBacenCSV } from './parser.operator';

const csvSample = `
ISPB,Nome_Reduzido,Número_Código,Participa_da_Compe,Acesso_Principal,Nome_Extenso,Início_da_Operação
00000000,BCO DO BRASIL S.A.,001,Sim,RSFN,Banco do Brasil S.A.                                                            ,22/04/2002
00000208,BRB - BCO DE BRASILIA S.A.,070,Sim,RSFN,BRB - BANCO DE BRASILIA S.A.                                                    ,22/04/2002
00038121,Selic                              ,n/a,Não,RSFN,Banco Central do Brasil - Selic                                                 ,22/04/2002
00038166,Bacen                              ,n/a,Não,RSFN,Banco Central do Brasil                                                         ,22/04/2002
00204963,CCR SEARA,430,Não,RSFN,COOPERATIVA DE CREDITO RURAL SEARA - CREDISEARA                                 ,27/08/2021
`;

const expectedOutput = Object.freeze([
  new Bank({
    ispb: '00000000',
    name: 'BCO DO BRASIL S.A.',
    code: 1,
    fullName: 'Banco do Brasil S.A.',
  }),
  new Bank({
    ispb: '00000208',
    name: 'BRB - BCO DE BRASILIA S.A.',
    code: 70,
    fullName: 'BRB - BANCO DE BRASILIA S.A.',
  }),
  new Bank({
    ispb: '00038121',
    name: 'Selic',
    code: NaN,
    fullName: 'Banco Central do Brasil - Selic',
  }),
  new Bank({
    ispb: '00038166',
    name: 'Bacen',
    code: NaN,
    fullName: 'Banco Central do Brasil',
  }),
  new Bank({
    ispb: '00204963',
    name: 'CCR SEARA',
    code: 430,
    fullName: 'COOPERATIVA DE CREDITO RURAL SEARA - CREDISEARA',
  }),
]);

describe('parseBacenCSV', () => {
  it('parse BACEN banks list csv', () => {
    parseBacenCSV(of(csvSample)).subscribe((result) => {
      expect(result).toStrictEqual(expectedOutput);
      expect(result.length).toBe(expectedOutput.length);
    });
  });
});
