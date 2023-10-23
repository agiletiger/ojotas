# Ojotas ORM

## Disclaimer
In the following section I'll do some strong arguments against ORMs. I'm not saying you should not use them if they are working for your use cases.  
ORMs are a great tool that work most of the time. Ojotas is here to help in the cases ORMs can't.  

## Rationale
- Most ORMs out there are proud that they support more than one SQL dialect (MySQL, PostgreSQL, Mysql Server, and so on).  
In how many projects you had to interact with more than one dialect at the same time?  
Having to support many dialects is not an easy task, the more dialects they support the more surface for bugs to be there when you less expect them.
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

## Roadmap
### V1
- [] support simpleQuery method (no need to specify aliases as we are returning just one entity with not relations)
- [] define how to specify the unique identifiers for each entity when doing complexQuery
- [] support complexQuery method (need to specify aliases as we are returning an entity with its relations)
- [] create TS types from the queries
- [] check queries in a compile step against the database
- [] support sql intellisense in different IDEs

### V2
- [] remove the need to specify aliases manually.

## API
```ts
/** 
 * @param {Object} connection - .
 * @param {String} sql - .
 * @param {Array} identifiers - Let us know when two different objects are part of the same.
 */
query<T>(connection: Connection, sql: string, identifiers: string[]): Promise<T[]>;
```

## Example 
### You have this config
```json
{
    "aliases": {
        "j": "job",
        "jl": "job_location"
    },
    "relations": {
        "job": {
            "job_location": ["hasMany", "locations"] 
        }
    }
}
```
### you have this sql file
```sql
select j.jobNumber, jl.locationId, jl.dispatcherNotes from job j inner join job_location jl on j.jobId = jl.jobId;
```
### these are the types the ORM will generate
```ts
export type QueryParams = [];

export interface IQueryResult {
    jobNumber: number;
    locations: {
        locationId: string;
        dispatcherNotes: string;
    }[]
};

export interface IQuery {
    params: QueryParams;
    result: IQueryResult;
};
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
