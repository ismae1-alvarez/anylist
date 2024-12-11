import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  
  @PrimaryGeneratedColumn('uuid')
  @Field( () => ID )  // Esto hace que 'id' sea parte del esquema GraphQL
  id: string;  

  @Column()
  @Field( () => String )  // Esto hace que 'name' sea parte del esquema GraphQL
  name: string;

  // @Column('float')
  // @Field( () => Float )  // Esto hace que 'quantity' sea parte del esquema GraphQL
  // quantity: number;

  @Column({ nullable: true })
  @Field( () => String, { nullable: true })  // Esto hace que 'quantityUnits' sea parte del esquema GraphQL
  quantityUnits?: string;


  // store

  // user 
  @ManyToOne( () => User, ( user )=> user.items, { nullable: false, lazy: true})
  @Index('userID-index')
  @Field( () => User)
  user:User;


  @OneToMany( () => ListItem, (listItem) => listItem.item, { lazy : true })
  @Field( () => [ListItem])
  listItem:ListItem[]
}
