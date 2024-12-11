import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { Repository } from 'typeorm';
import { List } from 'src/lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository( ListItem )
    private readonly listItemRespository:  Repository<ListItem>
  ){}

  async create(createListItemInput: CreateListItemInput):Promise<ListItem> {

    const { itemId, listId, ...res } = createListItemInput;

    const newListItem = this.listItemRespository.create({
      ...res, 
      item: { id: itemId },
      list: { id: listId }
    })

    await  this.listItemRespository.save( newListItem )

    return this.findOne( newListItem.id )
  }

  findAll(list:List, paginationArgs:PaginationArgs,searchArgs: SearchArgs):Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    // TODO: filtrar, paginar, por ususrio...
    const queryBuilder = this.listItemRespository.createQueryBuilder('listItem') // <-- Nombre para las relaciones
      .innerJoin('listItem.item','item') // <--- Lo añadí después, fue un problema que no grabé
      .take( limit )
      .skip( offset )
      .where(`"listId" = :listId`, { listId: list.id });

    if ( search ) {
      queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${ search.toLowerCase() }%` });
    }

    return queryBuilder.getMany();


  }

  async findOne(id: string):Promise<ListItem> {
    const lisItem = await this.listItemRespository.findOneBy({ id })

    if ( !lisItem ) throw new NotFoundException(`List item with id ${ id } no found`)

    return lisItem
  }

  async update(id: string, updateListItemInput: UpdateListItemInput):Promise<ListItem> {

    const { listId, itemId, ...rest } = updateListItemInput;

    const queryBuilder = this.listItemRespository.createQueryBuilder()
      .update()
      .set( rest )
      .where('id = :id', { id });

    if ( listId ) queryBuilder.set({ list: { id: listId }});
    if ( itemId ) queryBuilder.set({ item: { id: itemId }});

    await queryBuilder.execute()

    return this.findOne( id )
  
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  async countListItemsByList( list:List ) :Promise<number>{

    return this.listItemRespository.count({
      where: { list: { id: list.id }}
    })
    
  }
}
