import { NonEmptyArray, PossiblyEmptyArray } from 'ojotas';

export interface ISelectUsersWithPostsQueryResultItem {
  id: number;
  name: string;
  posts: NonEmptyArray<{
    id: number;
    title?: string;
    content?: string;
  }>;
}

export const selectUsersWithPosts = () => {
  return {
    sql: 'SELECT `u`.`id` AS `u.id`, `u`.`name` AS `u.name`, `p`.`id` AS `p.id`, `p`.`title` AS `p.title`, `p`.`content` AS `p.content` FROM `users` AS `u` INNER JOIN `posts` AS `p` ON `u`.`id` = `p`.`user_id`',
    params: null,
    identifiers: ['u.id', 'p.id'],
    cast: (rows: unknown) => {
      return rows as ISelectUsersWithPostsQueryResultItem[];
    },
  };
};
