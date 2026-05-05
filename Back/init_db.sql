CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS sessions;

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    department TEXT NOT NULL,
    task_name TEXT DEFAULT '',
    monthly_agreement FLOAT DEFAULT 0,
    minutes_per_hour FLOAT DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    classification TEXT NOT NULL,
    time_unit FLOAT DEFAULT 0,
    volume_daily INTEGER DEFAULT 0,
    annual_minutes FLOAT DEFAULT 0,
    justification TEXT,
    is_confirmed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
