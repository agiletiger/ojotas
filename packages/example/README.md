# Ojotas ORM test app

Setting up
1. create a .env file with you db params (check .env-sample)
2. seed the database (instructions below)
3. run `npm i`
4. run `npm run build`
5. run `npm run start`
6. create new sql files to test the ORM (instructions below)
7. update index.ts with the new generated query
8. go to step 5


## Seeding the database
Use https://github.com/agiletiger/ojotas/tree/main/test/config my.sql or pg.sql depending on the dialect you want to test

## Creating new sql files to test the ORM
1. create a new sql file in src folder
2. run `npm run ojotas-codegen`
3. update index.ts with new generated file


## Language server extentions (sql intellisense)
### for vscode
- https://github.com/UniqueVision/plpgsql-lsp
- https://github.com/joe-re/sql-language-server

