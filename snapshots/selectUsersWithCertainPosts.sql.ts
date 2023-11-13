// @ts-nocheck
import { Connection, AssembleFn, OjotasConfig, toUnnamed } from 'ojotas';

$paramsTypePlaceholder$

$returnTypePlaceholder$

export const selectUsersWithCertainPosts = (params: ISelectUsersWithCertainPostsQueryParams) => {
  const [unnamedSql, unnamedParams] = toUnnamed('SELECT `u`.`name` AS `u.name`, `p`.`title` AS `p.title`, `p`.`content` AS `p.content` FROM `users` AS `u` INNER JOIN `posts` AS `p` ON `u`.`id` = `p`.`user_id` WHERE `p`.`title` LIKE :title', params);
  return async (connection: Connection, assemble: AssembleFn, ojotasConfig: OjotasConfig) => {
    try {
      const [rows] = await connection.execute(unnamedSql, unnamedParams);

      return assemble(ojotasConfig.relations, ojotasConfig.aliases, ["u.name","p.title"], rows as Record<string, unknown>[]) as ISelectUsersWithCertainPostsQueryResultItem[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error executing query: ${unnamedSql} with params ${unnamedParams}`, error);
      throw error;
    }
  }
};
