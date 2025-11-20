create table public.price_lists (
  id text not null,
  name text not null,
  customer_email text null,
  pricing_data text null,
  created_date timestamp with time zone null default now(),
  updated_date timestamp with time zone null default now(),
  created_by text null,
  constraint price_lists_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_price_lists_updated_date BEFORE
update on price_lists for EACH row
execute FUNCTION update_updated_date_column ();