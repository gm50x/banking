import { map, Observable } from 'rxjs';
import { Bank } from '../models';

export function parseBacenCSV(source: Observable<string>) {
  const CRLF = '\r\n';
  const LF = '\n';

  return source.pipe(
    map((rawCsv) => rawCsv.trim().replace(new RegExp(CRLF, 'g'), LF)),
    map((rawCsv) => rawCsv.split(LF)),
    map((csvRows) => csvRows.slice(1)),
    map((csvRows) => csvRows.map((x) => x.split(','))),
    map((csvRowsData) =>
      csvRowsData.map(
        ([ispb, name, code, , , fullName]) =>
          new Bank({
            ispb: ispb?.trim(),
            name: name?.trim(),
            code: Number(code?.trim()),
            fullName: fullName?.trim(),
          }),
      ),
    ),
  );
}
