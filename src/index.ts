import { sql } from "sqlx-ts";

const pepe = sql`
-- @name: allUsers 
select firstName, cc.companyName from user u join centralized_company cc on u.centralizedCompanyId = cc.centralizedCompanyId`
