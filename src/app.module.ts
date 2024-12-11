import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ItemsModule } from './items/items.module';
// confihservices nest/onfig
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { ListsModule } from './lists/lists.module';
import { ListItemModule } from './list-item/list-item.module';


@Module({
  imports: [
    ConfigModule.forRoot(),

    GraphQLModule.forRootAsync({
      driver:  ApolloDriver,
      imports: [
        /* importa modulos */
        AuthModule

      ],
      inject: [
        /* Inyecatar servicios*/
        JwtService
      ],
      useFactory: async(jwtService: JwtService )=>({
        playground: false,
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        context({ req }) {
          // login tiene que pasar por este esquema por eso se comenta
          // const token =  req.headers.authorization?.replace('Bearer ','');
          
          // if ( !token ) throw Error('Token needed')

          // const payload = jwtService.decode( token );

          // if ( !payload ) throw Error('Token not valid')

        }
      })
    }),


    // TODO: configuracion basica
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   // confihservices nest/onfig
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    // }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.BD_PASSWORD,
      database: process.env.BD_NAME,
      synchronize: true,
      autoLoadEntities: true,
      // logging: true
    }),
    ItemsModule,
    UsersModule,
    AuthModule,
    SeedModule,
    CommonModule,
    ListsModule,
    ListItemModule
  ],
  controllers: [],

})
export class AppModule {}
