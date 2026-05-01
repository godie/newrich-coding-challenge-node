import { Controller, Get, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ListItemsQuery } from './items-query.mapper';
import { ItemRecord } from './item-record';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('/items')
  getItems(@Query() query: ListItemsQuery): { data: ItemRecord[]; total: number } {
    const data = this.itemsService.listItems(query);
    return {
      data,
      total: data.length,
    };
  }
}
