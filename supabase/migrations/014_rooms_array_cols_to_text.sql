-- Convert TEXT[] columns in rooms to TEXT so they match the JPA StringListConverter,
-- which serialises List<String> as PostgreSQL array-literal strings: {item1,item2}.
-- The ::text cast preserves the array-literal representation in existing rows.

ALTER TABLE public.rooms
    ALTER COLUMN amenities   TYPE TEXT USING amenities::text,
    ALTER COLUMN images_url  TYPE TEXT USING images_url::text;
