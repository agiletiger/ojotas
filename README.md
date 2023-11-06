# Ojotas ORM

## Disclaimer
In the following section I'll do some strong arguments against ORMs. I'm not saying you should not use them if they are working for your use cases.  
ORMs are a great tool that work most of the time. Ojotas is here to help in the cases ORMs can't.  

## Rationale
- Most ORMs out there are proud that they support more than one SQL dialect (MySQL, PostgreSQL, Mysql Server, and so on).  
In how many projects you had to interact with more than one dialect at the same time?  
Having to support many dialects is not an easy task, the more dialects they support the more surface for bugs to be there when you least expect them.
- In order to use an ORM you need to learn how to use it (obvious right?), but why?  
Do we really need to learn yet another tool with a bunch of methods, complexities, intricacies and nuances?
- Unless you are doing something very trivial chances are that you will at some point have issues with the ORM.  
You will spend time fighting against it instead of building what you want.
- At some point the ORM is going to create some SQL that is almost what you'd like but not quite.  
It is a fact, the ORM is there automagically creating SQL for you.  
In that situation you are presented with two options. Either try to hack around the ORM to make it work the way you want or writing the raw SQL you'd like.  
I don't know who or when but at some point in history someone said writing raw SQL is bad, why?
- It is a LIE that you don't need to know SQL and just be well off with an ORM if what you are building is something not trivial.  
If in the end the ORM is going to bring us issues with the SQL it automagically generates and you will end up learning SQL, why don't we just start off writing it ourselves?


## Key Features
- Lets the user create sql files with intellisense against the database so writing them in enjoyable and easy.  
This means no hidden ORM magic. If there is a problem in the query it is yours and not the ORM's fault.
- Provides a extremely simple API to query the database. Only 1 method!!!
No active record pattern, no dynamic methods, no obscure magic.
- Supports querying relations and map those to nested objects. This is the what ORM stands for, mapping and not automagically generating queries.
- Returns POJOs and then you can do as you please. No creation of classes that are expensive and most of the time are sent to the client as JSON.
- Creates TS types with the result of the query for greater dev experience.
- Checks queries in a compile step so there are no surprises in runtime.

## Providing feedback
There is a side repo [ojotas-test-app](https://github.com/agiletiger/ojotas-test-app) to play with ojotas orm and provide feedback

## Roadmap
### V1
- [] support query method
- [] define how to specify the unique identifiers for each entity when including relations
- [] create TS types from the queries
- [] check queries in a compile step against the database
- [] support sql intellisense in vscode

### V2
- [] remove the need to specify aliases manually.
- [] support more dialects than MySQL
- [] support sql intellisense in different IDEs


## Example 
### You have this config
```json
{
  "aliases": {
    "u": "users",
    "p": "posts"
  },
  "relations": {
    "users": {
      "posts": ["hasMany", "posts"] 
    }
  }
}
```
### you have a selectAllUsersWithPosts.sql file like this
```sql
select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id
```
### this is the type the ORM will generate for a query without params
```ts
export interface ISelectAllUsersWithPostsQueryResultItem {
  name: string;
  posts: Array<{
    title: string;
    content: string;
  }>;
}
```


## API
```ts
/** 
 * @param {Object} connection - active connection for the db you want to query.
 * @param {Function: (connection: mysql.Connection) => Promise<T[]>} sql - compiled representation of written sql string with type definitions.
 */
query(connection: Connection, sql: SqlFn): Promise<T[]>;
```


## Interesting links
- https://jawj.github.io/zapatos/
- https://github.com/jawj/mostly-ormless
- https://en.wikipedia.org/wiki/Object%E2%80%93relational_impedance_mismatch
- https://github.com/SweetIQ/schemats
- https://phiresky.github.io/blog/2020/sql-libs-for-typescript/
- https://github.com/mikro-orm/mikro-orm
- https://github.com/Seb-C/kiss-orm
- https://github.com/adelsz/pgtyped
- https://github.com/nettofarah/mysql-schema-ts
- https://sqlc.dev/
- https://github.com/mysqljs/named-placeholders

