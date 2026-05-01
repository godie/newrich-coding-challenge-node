import { Module } from '@nestjs/common';
import { ItemsController } from './items/items.controller';
import { ItemsService } from './items/items.service';
import { ItemsRepository } from './items/items.repository';

@Module({
  imports: [],
  controllers: [ItemsController],
  providers: [ItemsRepository, ItemsService],
})
export class AppModule {}
