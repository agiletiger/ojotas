// @ts-nocheck
import { Connection, AssembleFn, OjotasConfig } from 'ojotas';

$returnTypePlaceholder$

export const selectAllUsersWithPosts = async (connection: Connection, assemble: AssembleFn, ojotasConfig: OjotasConfig) => {
  const sql = 'SELECT `u`.`name` AS `u.name`, `p`.`title` AS `p.title`, `p`.`content` AS `p.content` FROM `users` AS `u` INNER JOIN `posts` AS `p` ON `u`.`id` = `p`.`user_id`';
  try {
    const [rows] = await connection.execute(sql);
    
    return assemble(ojotasConfig.relations, ojotasConfig.aliases, ["u.name","p.title"], rows as Record<string, unknown>[],) as ISelectAllUsersWithPostsQueryResultItem[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error executing query: ${sql}`, error);
    throw error;
  }
};
