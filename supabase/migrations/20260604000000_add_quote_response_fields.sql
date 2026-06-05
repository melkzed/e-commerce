alter table public.quote_requests
add column if not exists quote_value text not null default '',
add column if not exists admin_response text not null default '',
add column if not exists quote_response_email_status text not null default 'pending',
add column if not exists quote_responded_at timestamptz;
