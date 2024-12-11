import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResponse } from './types/auth-respones.type';
import { UsersService } from 'src/users/users.service';
import { LoginInput, SignupInput } from './dto/inputs';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService : JwtService,
    ){}

    private getJwtToken( userId: string ):string{
        return this.jwtService.sign({ id: userId })
    }


    async signup( signupInput: SignupInput):Promise<AuthResponse>{
        
        // TODO: crear usuario
        const user = await this.usersService.create( signupInput )
        
        // TODO: crear JWT
        const token = this.getJwtToken(user.id)

        return{
            token, 
            user
        }
    }

    async login( loginInput : LoginInput):Promise<AuthResponse>{

        const { email, password } = loginInput; 
        
        const user = await this.usersService.findOneByEmail( email );

        if( !bcrypt.compareSync( password, user.password) ){
            throw new BadRequestException('Email / Password do not match')
        }

        // TODO : JWT
        const token = this.getJwtToken(user.id)
        return {
            token, 
            user
        }
    }

    async validateUser(id: string):Promise<User>{
        const user = await this.usersService.findOneById( id );

        if ( !user.isActive )
            throw new UnauthorizedException(`User is inactive, talk with an admin`)


        delete user.password;

        return user;

    }

    async revalidateToken(user: User):Promise<AuthResponse>{    

        const token = this.getJwtToken(user.id);

        return { token, user };

    }
}
