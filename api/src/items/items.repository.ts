import { Injectable } from '@nestjs/common';
import { ItemRecord } from './item-record';
import { ITEMS_DATA } from './data';

@Injectable()
export class ItemsRepository {
  private readonly items: ItemRecord[] = [...ITEMS_DATA];

  findAll(): ItemRecord[] {
    return [...this.items];
  }
}
