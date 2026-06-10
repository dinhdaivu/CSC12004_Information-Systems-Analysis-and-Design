-- Change reasons from TEXT[] to TEXT so it matches the JPA StringListConverter,
-- which serialises List<String> as a PostgreSQL array-literal string: {item1,item2}.
-- The ::text cast preserves the array-literal representation in existing rows.

ALTER TABLE public.lodging_eligibility
    ALTER COLUMN reasons TYPE TEXT USING reasons::text;
