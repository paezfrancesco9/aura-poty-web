-- =============================================
-- Aura Poty - Esquema de base de datos Supabase
-- Correr este script en el SQL Editor de Supabase
-- =============================================

-- Tabla de productos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  description text,
  price numeric(10,2) not null default 0,
  category text default 'Perfumes',
  gender text default 'unisex' check (gender in ('femenino', 'masculino', 'unisex')),
  emoji text default '✨',
  image_url text,
  is_active boolean default true,
  stock integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla de combos guardados
create table if not exists combos (
  id uuid primary key default gen_random_uuid(),
  name text,
  container_type text default 'caja' check (container_type in ('caja', 'bolsa', 'mesita')),
  total_price numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- Items de cada combo
create table if not exists combo_items (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid references combos(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer default 1,
  price_at_time numeric(10,2)
);

-- Habilitar Row Level Security
alter table products enable row level security;
alter table combos enable row level security;
alter table combo_items enable row level security;

-- Politicas: lectura publica para productos activos
create policy "Productos visibles para todos" on products
  for select using (is_active = true);

-- Politicas: admin puede todo (usuarios autenticados)
create policy "Admin puede leer todos los productos" on products
  for select using (auth.role() = 'authenticated');

create policy "Admin puede insertar productos" on products
  for insert with check (auth.role() = 'authenticated');

create policy "Admin puede actualizar productos" on products
  for update using (auth.role() = 'authenticated');

create policy "Admin puede eliminar productos" on products
  for delete using (auth.role() = 'authenticated');

-- Storage bucket para imagenes de productos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Imagenes publicas" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admin puede subir imagenes" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Funcion para actualizar updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- Datos de ejemplo para empezar
insert into products (name, brand, description, price, category, gender, emoji, is_active, stock)
values
  ('Perfume Yara Mystical', 'Lattafa', 'Fragancia floral y amaderada, 100ml', 85000, 'Perfumes', 'femenino', '🌸', true, 15),
  ('Perfume Asad', 'Lattafa', 'Fragancia oriental intensa, 100ml', 90000, 'Perfumes', 'masculino', '🌿', true, 10),
  ('Lip Glow Oil', 'DIOR', 'Aceite gloss con color y brillo natural', 45000, 'Maquillaje', 'femenino', '💄', true, 20),
  ('Disaar HA Cream', 'Disaar', 'Crema hidratante con acido hialuronico', 55000, 'Skincare', 'unisex', '✨', true, 18),
  ('Sunscreen SPF90', 'Disaar', 'Protector solar ligero, 40g', 48000, 'Skincare', 'unisex', '🌞', true, 25),
  ('Nivea Facial 7en1', 'Nivea', 'Crema facial multibeneficio', 35000, 'Skincare', 'femenino', '💙', true, 30),
  ('Rhode Lip Peptide', 'Rhode', 'Tratamiento labial con color', 65000, 'Maquillaje', 'femenino', '💋', true, 12),
  ('Meslizam Eau de Parfum', 'Meslizam', 'Fragancia arabe premium, 100ml', 95000, 'Perfumes', 'masculino', '🏺', true, 8);
