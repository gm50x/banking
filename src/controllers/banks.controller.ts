import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
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

  @Get(':code')
  async getByCode(@Param('code') code: string): Promise<BankResponse> {
    const output = await this.service.getByCode(Number(code));
    if (!output.data) {
      throw new NotFoundException(`Bank with code ${code} could not be found!`);
    }

    return output;
  }
}
