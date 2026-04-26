-- 1. Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Création de la table Departments
CREATE TABLE departments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Création de la table Quality Events
CREATE TABLE quality_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type text NOT NULL,
    department_id uuid REFERENCES departments(id),
    event_date date NOT NULL,
    description text NOT NULL,
    action text NOT NULL,
    action_owner text NOT NULL,
    planned_date date NOT NULL,
    completion_date date,
    root_cause text,
    recurrence boolean DEFAULT false,
    status text CHECK (status IN ('Réalisé', 'En cours')) DEFAULT 'En cours',
    created_by uuid REFERENCES auth.users,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 4. Sécurité RLS (Row Level Security)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_events ENABLE ROW LEVEL SECURITY;

-- Politiques de base (Pour démarrer, on autorise les utilisateurs connectés)
CREATE POLICY "Allow authenticated read for departments" ON departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert for departments" ON departments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read for events" ON quality_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert for events" ON quality_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update for events" ON quality_events FOR UPDATE USING (auth.role() = 'authenticated');
