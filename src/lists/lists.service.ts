import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CreateListInput, UpdateListInput } from './dto/inputs';
import { List } from './entities/list.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { promises } from 'dns';

@Injectable()
export class ListsService {

  constructor(
    @InjectRepository( List )
    private readonly listsRepository: Repository<List>
  ){}

  async create(createListInput: CreateListInput, user: User):Promise<List> {
    
    const newList =  this.listsRepository.create({ ...createListInput, user })

    return await this.listsRepository.save( newList ); 
  }


  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs):Promise<List[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    // TODO: Filtrar, paginar, por uusuario

    const queryBuilder = this.listsRepository.createQueryBuilder()
      .take( limit )
      .skip( offset )
      .where(`"userId" = :userId`, { userId: user.id })
    
    if( search ) {
      queryBuilder.andWhere('LOWER(name) like :name', {name: `%${ search.toLowerCase() }%`})
    }

    return queryBuilder.getMany()
  }

  async findOne(id: string, user:User) :Promise<List> {

    const list = await this.listsRepository.findOneBy({
      id, 
      user:{
        id: user.id
      }
    })

    if ( !list ) throw new NotFoundException(`List whith: ${ id } not found`)

    return list;
      
  }

  async update(id: string, updateListInput: UpdateListInput, user: User):Promise<List> {
    await this.findOne( id, user);
    
    const list =  await this.listsRepository.preload( updateListInput )

    if ( !list ) throw new NotFoundException(`List whit id: ${ id } not found`);

    return this.listsRepository.save( list )
  }

  async remove(id: string, user:User):Promise<List> {
    // TODO: soft delete, integrida referencial
    const item = await this.findOne( id, user )

    await this.listsRepository.remove( item )
    

    return { ...item, id }
  }


  async listCountByUser( user:User) :Promise<number>{

    return this.listsRepository.count({
      where:  {
        user: {
          id: user.id
        }
      }
    })
  }
}
