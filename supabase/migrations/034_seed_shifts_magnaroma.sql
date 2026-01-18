
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get Tenant ID
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'magnaromatrattoria';

  IF v_tenant_id IS NOT NULL THEN
     -- Insert Lunch if not exists
     IF NOT EXISTS (SELECT 1 FROM public.reservation_shifts WHERE tenant_id = v_tenant_id AND name = 'Pranzo') THEN
        INSERT INTO public.reservation_shifts (tenant_id, name, start_time, end_time, days_of_week, is_active)
        VALUES (v_tenant_id, 'Pranzo', '12:00:00', '15:00:00', ARRAY[0,1,2,3,4,5,6], true);
     END IF;

     -- Insert Dinner if not exists
     IF NOT EXISTS (SELECT 1 FROM public.reservation_shifts WHERE tenant_id = v_tenant_id AND name = 'Cena') THEN
        INSERT INTO public.reservation_shifts (tenant_id, name, start_time, end_time, days_of_week, is_active)
        VALUES (v_tenant_id, 'Cena', '19:00:00', '23:00:00', ARRAY[0,1,2,3,4,5,6], true);
     END IF;
  END IF;
END $$;
