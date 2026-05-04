-- Table for analysis sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    department TEXT NOT NULL,
    monthly_minutes_limit INTEGER DEFAULT 9600, -- 160h * 60min
    minutes_per_hour INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for activities within a session
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('Operación', 'Revisión', 'Traslado', 'Espera', 'Archivo')),
    classification TEXT CHECK (classification IN ('VA', 'NVA')),
    time_unit FLOAT, -- tiempo en minutos por unidad
    volume_daily INTEGER,
    annual_minutes FLOAT,
    justification TEXT,
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
