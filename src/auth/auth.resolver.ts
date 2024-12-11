import { Args, Mutation, Resolver,Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './types/auth-respones.type';
import { LoginInput, SignupInput } from './dto/inputs';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService
  ) {}


  @Mutation( ()=> AuthResponse, { name: 'signupInputs'})
  async signup(
    @Args('signupInputs') signupInput: SignupInput
  ):Promise<AuthResponse>{
    return this.authService.signup( signupInput )
  }

  @Mutation( () => AuthResponse, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput
  ):Promise<AuthResponse>{
    return this.authService.login( loginInput )
  }

  @Query( () => AuthResponse, { name: 'revalite'})
  @UseGuards( JwtAuthGuard )
  async revalidateToken(
    @CurrentUser(/** [ ValidRoles.admin ] */) user: User 
  ):Promise<AuthResponse> { 

    return this.authService.revalidateToken( user );
  }
}
