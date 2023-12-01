select u.id, u.name, p.id, p.title, p.content from users u inner join posts p on u.id = p.user_id 
