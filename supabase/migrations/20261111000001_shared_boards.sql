create table shared_boards (
  token       text primary key,
  name        text not null,
  cover_ids   uuid[] not null,
  revoke_hash text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '365 days'
);

alter table shared_boards enable row level security;

create or replace function create_shared_board(p_name text, p_cover_ids uuid[])
returns table (token text, revoke_key text)
language plpgsql security definer set search_path = public as $$
declare
  v_token text := replace(gen_random_uuid()::text, '-', '');
  v_key   text := replace(gen_random_uuid()::text, '-', '');
  v_count int  := coalesce(array_length(p_cover_ids, 1), 0);
begin
  if v_count = 0 then raise exception 'board is empty'; end if;
  if v_count > 120 then raise exception 'too many covers'; end if;

  insert into shared_boards (token, name, cover_ids, revoke_hash)
  values (
    v_token,
    left(coalesce(nullif(btrim(p_name), ''), 'Untitled board'), 120),
    p_cover_ids,
    encode(sha256(v_key::bytea), 'hex')
  );

  return query select v_token, v_key;
end $$;

create or replace function get_shared_board(p_token text)
returns table (name text, cover_ids uuid[])
language plpgsql security definer set search_path = public as $$
begin
  update shared_boards
     set expires_at = now() + interval '365 days'
   where shared_boards.token = p_token
     and shared_boards.expires_at > now()
     and shared_boards.expires_at < now() + interval '300 days';

  return query
    select b.name, b.cover_ids
      from shared_boards b
     where b.token = p_token
       and b.expires_at > now();
end $$;

create or replace function revoke_shared_board(p_token text, p_revoke_key text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_deleted int;
begin
  delete from shared_boards
   where shared_boards.token = p_token
     and shared_boards.revoke_hash = encode(sha256(p_revoke_key::bytea), 'hex');
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end $$;

revoke all on function create_shared_board(text, uuid[]) from public;
revoke all on function get_shared_board(text)            from public;
revoke all on function revoke_shared_board(text, text)   from public;

grant execute on function create_shared_board(text, uuid[]) to anon, authenticated;
grant execute on function get_shared_board(text)            to anon, authenticated;
grant execute on function revoke_shared_board(text, text)   to anon, authenticated;
