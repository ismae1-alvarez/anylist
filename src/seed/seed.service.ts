import {  flatten, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { List } from 'src/lists/entities/list.entity';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        private readonly configService: ConfigService,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,
        @InjectRepository(List)
        private readonly listsRepository: Repository<List>,

        private readonly usersService : UsersService,
        private readonly itemsService: ItemsService,
        private readonly listsService: ListsService,
        private readonly listItemService: ListItemService,
    ){
        this.isProd = configService.get('STATE') === 'prod'
    }

    async executeSeed(){

        if( this.isProd ){
            throw new UnauthorizedException('We cannot run SEED on Prod')
        }


        // Limpira la base de dato BORRAR TODO
        await this.deleteDatabase();

        // crear los usuarios
        const user =  await this.loadUsers()

        // crear los items

        await this.loadItems( user )


        // Crear listas

        const list = await this.loadList( user )


        // Crear lisItems

        const items = await this.itemsService.findAll( user, { limit: 15, offset: 0}, {})
        await this.loadListItems( list, items )



        return true;
    }

    async deleteDatabase() {


        // ListItems
        await this.listItemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Lists
        await this.listsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();


        // borrar items
        await this.itemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // borrar user
        await this.usersRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();
    }

    async loadUsers():Promise<User>{
        const users = []

        for ( const user of SEED_USERS) {
            users.push( await this.usersService.create( user ))
        }

        return users[0]
    }

    async loadItems(user:User):Promise<void> {
        const items = []

        for ( const item of SEED_ITEMS) {
            items.push( this.itemsService.create( item, user  ))
        }

        await Promise.all( items )
    }

    async loadList( user:User):Promise<List>{
        const lists = []

        for ( const list of SEED_LISTS) {
            lists.push( await this.listsService.create( list, user ))
        }

        return lists[0]
    }

    async loadListItems( list: List, items: Item[] ) {
        for(const item of items ) {
            this.listItemService.create({
                quantity: Math.round( Math.random() * 10 ),
                completed: Math.round( Math.random() * 1 ) === 0 ? false : true,
                listId: list.id,
                itemId: item.id
            })
        }
    }
}
