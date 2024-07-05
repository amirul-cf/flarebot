-- Migration number: 0001 	 2024-06-05T08:07:08.621Z
DROP INDEX IF EXISTS id_history;
DROP TABLE IF EXISTS history;

CREATE TABLE history (
  user_name TEXT NOT NULL,
  chat_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL
);
CREATE INDEX id_history ON history (user_name, chat_id);