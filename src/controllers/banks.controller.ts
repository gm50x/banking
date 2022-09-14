import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BankResponse, BanksResponse } from '../models';
import { BanksService } from '../services';

@Controller('banks')
@ApiTags('Banks')
export class BanksController {
  constructor(private readonly service: BanksService) {}

  @Get()
  @ApiQuery({
    name: 'search',
    type: String,
    description: 'Optional Search String',
    required: false,
  })
  async getAll(@Query('search') search?: string): Promise<BanksResponse> {
    if (!search) {
      return this.service.getAll();
    }

    return this.service.findByName(search);
  }

  @Get(':codeOrISPB')
  @ApiParam({
    name: 'codeOrISPB',
    type: String,
    description: 'Prefixed bank code or ispb',
    example: 'code:237',
    examples: {
      ISPB: {
        summary: 'ISPB',
        description: 'Attempt to search with ISPB',
        value: 'ispb:00000000',
      },
      CODE: {
        summary: 'CODE',
        description: 'Attempt to search with COMPE Code',
        value: 'code:237',
      },
    },
    required: true,
  })
  async getByCodeOrISPB(
    @Param('codeOrISPB') prefixedParam: string,
  ): Promise<BankResponse> {
    const [type, codeOrISPB] = prefixedParam.includes(':')
      ? prefixedParam.split(':').map((x) => x.toLowerCase())
      : ['code', prefixedParam]; // assumption: search by code

    if (!['code', 'ispb'].includes(type)) {
      throw new BadRequestException(`unknown type ${type}`);
    }

    const executor = {
      ispb: this.service.getByISPB.bind(this.service),
      code: this.service.getByCode.bind(this.service),
    };

    const parsedCodeOrISPB = type === 'code' ? Number(codeOrISPB) : codeOrISPB;

    const output: BankResponse = await executor[type](parsedCodeOrISPB);

    if (!output || !output.data) {
      throw new NotFoundException(
        `Bank with code ${codeOrISPB} could not be found!`,
      );
    }

    return output;
  }
}
