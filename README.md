# Ojotas database-first ORM

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
- Queries are not portable. You create a query in your favorite editor and then you need to translate it to the ORM's dsl.
- Most if not all ORMs provide no help when doing raw queries, they can throw errors in runtime if the schema is changed without them being properly updated.
- ORMs can cause index obfuscation, wrapping the indexing column in a function, having a performance penalty you are not aware of because you don't see the generated code until it is too late. 


## Key Features
- Lets the user create sql files with intellisense against the database so writing them in enjoyable and easy.  
This means no hidden ORM magic. If there is a problem in the query it is yours and not the ORM's fault.
- Provides a extremely simple API to query the database. Only 1 method!!!
No active record pattern, no dynamic methods, no obscure magic.
- Supports querying relations and map those to nested objects. This is the what ORM stands for, mapping and not automagically generating queries.
- Returns POJOs and then you can do as you please. No creation of classes that are expensive and most of the time are sent to the client as JSON.
- Creates TS types with the result of the query for greater dev experience.
- Checks queries in a compile step to make sure they are always valid so there are no surprises in runtime.
- Provides performance hints, check [issue 13](https://github.com/agiletiger/ojotas/issues/13)

## Providing feedback
There is a side repo [ojotas-test-app](https://github.com/agiletiger/ojotas-test-app) to play with ojotas orm and provide feedback

## Roadmap
### V1
- [x] support query method
- [ ] define how to specify the unique identifiers for each entity when including relations
- [x] create TS types from the queries
- [ ] check queries in a compile step against the database
- [ ] support sql intellisense in vscode

### V2
- [ ] remove the need to specify aliases manually.
- [ ] support more dialects
- [ ] support sql intellisense in different IDEs


## Example 
> You have this config
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
> you have a selectAllUsersWithPosts.sql file like this
```sql
select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id
```
> this is the type the ORM will generate for a query without params
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
 * @param {Function: (connection: Connection) => Promise<T[]>} sql - compiled representation of written sql string with type definitions.
 */
query(connection: Connection, sql: SqlFn): Promise<T[]>;
```


## Previous work that inspired this project
https://jawj.github.io/zapatos/  
What I like about Zapatos is the idea of talking to the database to generate types.  
It generates types for all tables, in the case of Ojotas we only generate types of what you are using through the queries.  
Also the idea of [Everyday CRUD](https://jawj.github.io/zapatos/#everyday-crud) is noble and worth exploring for Ojotas [see discussion](https://github.com/agiletiger/ojotas/discussions/24)  
What I don't like is how the user needs to manually write the types. Ojotas automates that.

https://github.com/adelsz/pgtyped  
Ojotas has the same approach of creating types from the queries as pgtyped.  
What pgtypes does not provide is the mapping when including 1 to N relations in the query.  
I'm not convinced of the magic pgtyped does with the [special annotations](https://pgtyped.dev/docs/sql-file) but I haven't properly tested yet.  
Also It does some [dark magic](https://github.com/adelsz/pgtyped/blob/master/packages/runtime/src/preprocessor-sql.ts) at runtime wheareas Ojotas gives you the exact sql it will execute at compile time.  
Nonetheless it seems a very good alternative if you are using PostgreSQL.

https://sqlc.dev/  
Same ideas as pgtyped but implemented in Go.  
I think I like more the [macros](https://docs.sqlc.dev/en/stable/reference/macros.html) because I can see the generated code than pgtyped's special annotations. 

https://github.com/Seb-C/kiss-orm  
I agree a lot with some of their philosophy points:
- No query builder (you can use the full power and expressiveness of SQL)
- Immutability of the objects
- No magic. Everything is explicit. No database operation is done unless explicitly requested.
- Simplicity: the architecture is ridiculously simple. If you need complex operations, you have the freedom to write it without worries.
- No mappings: Kiss-ORM always assumes that the column and JS properties have the same name.

https://github.com/SweetIQ/schemats  
I took the code to query the database and get the types from there.  

## Interesting links
- https://en.wikipedia.org/wiki/Object%E2%80%93relational_impedance_mismatch

