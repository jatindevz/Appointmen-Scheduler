create or replace function public.book_appointment(
  p_service_id uuid,
  p_appointment_date date,
  p_start_time time
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_duration integer;
  v_end_time time;
  v_weekday integer;
  v_slot_available boolean;
  v_inserted public.appointments;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select duration_minutes
  into v_duration
  from public.services
  where id = p_service_id;

  if v_duration is null then
    raise exception 'Service not found';
  end if;

  v_end_time := (p_start_time + make_interval(mins => v_duration))::time;
  v_weekday := extract(dow from p_appointment_date)::integer;

  select exists (
    select 1
    from public.availability a
    where a.weekday = v_weekday
      and p_start_time >= a.start_time
      and v_end_time <= a.end_time
  )
  into v_slot_available;

  if not v_slot_available then
    raise exception 'Slot is outside configured availability';
  end if;

  if exists (
    select 1
    from public.appointments ap
    where ap.service_id = p_service_id
      and ap.appointment_date = p_appointment_date
      and ap.status = 'confirmed'
      and p_start_time < ap.end_time
      and v_end_time > ap.start_time
    for update
  ) then
    raise exception 'Time slot already booked';
  end if;

  insert into public.appointments (
    user_id,
    service_id,
    appointment_date,
    start_time,
    end_time,
    status
  )
  values (
    v_user_id,
    p_service_id,
    p_appointment_date,
    p_start_time,
    v_end_time,
    'confirmed'
  )
  returning * into v_inserted;

  return v_inserted;
end;
$$;

revoke all on function public.book_appointment(uuid, date, time) from public;
grant execute on function public.book_appointment(uuid, date, time) to authenticated;
