import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class ItemsService {


  constructor(
    @InjectRepository( Item )
    private readonly itemsRespository: Repository<Item>
  ){};


  async create(createItemInput: CreateItemInput, user:User): Promise<Item>{

    const newItem =  this.itemsRespository.create({ ...createItemInput, user });

    return await this.itemsRespository.save( newItem );
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs):Promise<Item[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    // TODO: filtrar, paginar, por ususrio...
    const queryBuilder =  this.itemsRespository.createQueryBuilder()
      .take( limit )
      .skip( offset )
      .where(`"userId" = :userId`, { userId : user.id })

    if( search ) {
      queryBuilder.andWhere('LOWER(name) like :name', { name: `%${ search.toLowerCase() }%`})
    }

    return queryBuilder.getMany();



    // return this.itemsRespository.find({

    //   take: limit,
    //   skip: offset,
    //   where:{
    //     user : {
    //       id: user.id
    //     }, 
    //     name: Like(`%${ search }%`)
    //   }
    // });

    
  }

  async findOne(id: string, user: User):Promise<Item> {
    const item = await this.itemsRespository.findOneBy({ 
      id, 
      user: {
        id: user.id
      }
    });

    if( !item ) throw new NotFoundException(`Item wit id: ${ id } not found`);

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User):Promise<Item> {

    await this.findOne( id, user );
    
    // por eso es necesario el lazy, sino tendriamos que hacer el objeto, con los valores
    // const item = await this.itemsRespository.preload( { ...updateItemInput, user} )
    
    const item = await this.itemsRespository.preload( updateItemInput )


    if ( !item ) throw new NotFoundException(`Item with id: ${ id } not found`);

    return this.itemsRespository.save( item )
  }

  async remove(id: string, user:User):Promise<Item> {

    // TODO: soft delete, integrida referencial
    const item = await this.findOne( id, user )

    await this.itemsRespository.remove( item )
    

    return { ...item, id }
  }


  async itemCountByUser( user:User) :Promise<number>{

    return this.itemsRespository.count({
      where:  {
        user: {
          id: user.id
        }
      }
    })
  }
}
