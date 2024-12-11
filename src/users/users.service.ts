import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'

import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { from } from 'rxjs';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {
  // block(id: string, user: User): Promise<User> {
  //   throw new Error('Method not implemented.');
  // }

  private logger:Logger = new Logger('UserService')

  constructor(
    @InjectRepository(User)
    private readonly usersRespository: Repository<User>
  ) {}

  async create(signupInput: SignupInput) :Promise<User>{
    try {

      const newUser =  this.usersRespository.create({
        ...signupInput, 
        password: bcrypt.hashSync( signupInput.password, 10 )
      })

      return await this.usersRespository.save( newUser )
    } catch (error) {
      this.handleDBErrors( error )
    }
  }

  async findAll( roles: ValidRoles[]):Promise<User[]>  {
      
    if ( roles.length === 0) 
      return this.usersRespository.find()
    

      // ??? tenemos roles ['admin', 'superUser']
      return this.usersRespository.createQueryBuilder()
        .andWhere('ARRAY[roles] && ARRay[:...roles]')
        .setParameter('roles', roles)
        .getMany()
      

  }

  async findOneByEmail(email: string):Promise<User> {
    try {
      return await this.usersRespository.findOneByOrFail({ email })
    } catch (error) {

      throw new NotFoundException(`${ email } not found`)
    }
  }

  async findOneById(id: string):Promise<User> {
    try {
      return await this.usersRespository.findOneByOrFail({ id })
    } catch (error) {
      throw new NotFoundException(`${ id } not found`)
    }
  }

  async update(
    id: string, 
    updateUserInput: UpdateUserInput,
    updateBy: User
  ):Promise<User> {

    try {
      
      const user = await this.usersRespository.preload({ ...updateUserInput, id })

      user.lasUpdateBy = updateBy;
      

      return await this.usersRespository.save( user );

    } catch (error) {
      this.handleDBErrors( error )
    }

  }

  async block(id: string, adminUser:User):Promise<User> {

    const userToBlock =  await this.findOneById( id );

    userToBlock.isActive = false;
    userToBlock.lasUpdateBy =  adminUser;

    return await this.usersRespository.save( userToBlock );
  }


  private handleDBErrors( error: any ) : never{

    if ( error.code === '23505' ) {
      throw new BadRequestException( error.detail.replace('Key',''))
    }

    if ( error.code === 'error-404' ) {
      throw new BadRequestException( error.detail.replace('Key',''))
    }
    
    
    this.logger.error( error )

    throw new InternalServerErrorException('Place check server logs')
  }
}
