import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles{
    admin = 'admin',
    user =  'user',
    superUser = 'superUser'
}
// TODO: Implementar enum como GraphQL Enum Type

registerEnumType( ValidRoles, { name: 'ValidRoles', description: "Poder ver los roles de los admin y sus valores, separados/filtrados"})