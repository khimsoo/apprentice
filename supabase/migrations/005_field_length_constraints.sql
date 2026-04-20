alter table public.profiles
  add constraint profiles_full_name_length check (char_length(full_name) <= 255),
  add constraint profiles_bio_length check (char_length(bio) <= 1000);

alter table public.programs
  add constraint programs_title_length check (char_length(title) <= 255),
  add constraint programs_description_length check (char_length(description) <= 5000);

alter table public.tasks
  add constraint tasks_title_length check (char_length(title) <= 255),
  add constraint tasks_description_length check (char_length(description) <= 5000);
