--liquibase formatted sql

--changeset codex:seed-initial-lesson-periods splitStatements:true
INSERT INTO public.lesson_period (
  id,
  company_id,
  name,
  disp_order,
  created_at,
  updated_at,
  is_deleted,
  deleted_at
)
VALUES
  ('hQ1mP7sUa2vBb5cDd8eFj', 'm3JjAoupaZaQUXzGWKE4q', '1講', 1, now(), now(), false, null),
  ('iR2nQ8tVb3wCc6dEe9fGk', 'm3JjAoupaZaQUXzGWKE4q', '2講', 2, now(), now(), false, null),
  ('jS3pR9uWc4xDd7eFf1gHl', 'm3JjAoupaZaQUXzGWKE4q', '3講', 3, now(), now(), false, null),
  ('kT4qS1vXd5yEe8fGg2hJm', 'm3JjAoupaZaQUXzGWKE4q', '4講', 4, now(), now(), false, null),
  ('lU5rT2wYe6zFf9gHh3jKn', 'm3JjAoupaZaQUXzGWKE4q', '5講', 5, now(), now(), false, null),
  ('mV6sU3xZf7aGg1hJj4kLp', 'm3JjAoupaZaQUXzGWKE4q', '6講', 6, now(), now(), false, null),
  ('nW7tV4yAg8bHh2jKk5lMq', 'm3JjAoupaZaQUXzGWKE4q', '7講', 7, now(), now(), false, null),
  ('pX8uW5zBh9cJj3kLl6mNr', 'm3JjAoupaZaQUXzGWKE4q', 'その他', 8, now(), now(), false, null)
ON CONFLICT (id) DO NOTHING;
