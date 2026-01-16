-- This SQL exports all users with some more details from Supabase.
select
    u.id as user_id,
    coalesce(i.provider, 'email') as provider,
    coalesce(
            i.identity_data ->> 'email',
            u.email
    ) as email,
    coalesce(
            i.identity_data ->> 'full_name',
            i.identity_data ->> 'name',
            u.raw_user_meta_data ->> 'full_name',
            u.raw_user_meta_data ->> 'name'
    ) as name,
    coalesce(
            i.identity_data ->> 'avatar_url',
            i.identity_data ->> 'picture',
            u.raw_user_meta_data ->> 'avatar_url'
    ) as avatar_url,
    c.stripe_customer_id,
    u.created_at
from auth.users u
         left join lateral (
    select *
    from auth.identities i
    where i.user_id = u.id
    order by
        case i.provider
            when 'google' then 1
            when 'github' then 2
            when 'apple' then 3
            else 99
            end
    limit 1
    ) i on true
         left join (
    select
        id,
        max(stripe_customer_id) as stripe_customer_id
    from public.customers
    group by id
    having count(*) = 1
) c on c.id = u.id
order by u.created_at;
