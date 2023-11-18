// @ts-nocheck
$returnTypePlaceholder$

export const selectAllUsersWithPosts = () => {
  return {
    sql: 'SELECT `u`.`name` AS `u.name`, `p`.`title` AS `p.title`, `p`.`content` AS `p.content` FROM `users` AS `u` INNER JOIN `posts` AS `p` ON `u`.`id` = `p`.`user_id`',
    params: null,
    identifiers: ["u.name","p.title"],
    cast: (rows: unknown) => {
      return rows as ISelectAllUsersWithPostsQueryResultItem[];
    } 
  }
};
