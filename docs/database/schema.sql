-- PNG RFL PostgreSQL starter schema.
-- Review official geography, retention rules, and ladder policy before production use.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE regions (
    id text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE provinces (
    id text PRIMARY KEY,
    region_id text NOT NULL REFERENCES regions(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (region_id, name),
    UNIQUE (id, region_id)
);

CREATE INDEX provinces_region_idx ON provinces(region_id);

CREATE TABLE districts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id text NOT NULL REFERENCES provinces(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (province_id, name),
    UNIQUE (id, province_id)
);

CREATE INDEX districts_province_idx ON districts(province_id);

CREATE TABLE admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role text NOT NULL CHECK (role IN ('super-admin', 'region-admin', 'province-admin')),
    region_id text REFERENCES regions(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    province_id text,
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    disabled_at timestamptz,
    FOREIGN KEY (province_id, region_id) REFERENCES provinces(id, region_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (
        (role = 'super-admin' AND region_id IS NULL AND province_id IS NULL)
        OR (role = 'region-admin' AND region_id IS NOT NULL AND province_id IS NULL)
        OR (role = 'province-admin' AND region_id IS NOT NULL AND province_id IS NOT NULL)
    )
);

CREATE TABLE clubs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    tagline text NOT NULL DEFAULT '',
    logo_url text,
    banner_url text,
    founded_year integer CHECK (founded_year IS NULL OR founded_year BETWEEN 1800 AND 2200),
    home_ground text NOT NULL DEFAULT '',
    colors text[] NOT NULL DEFAULT '{}',
    competition_name text NOT NULL DEFAULT 'PNG RFL',
    region_id text REFERENCES regions(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    province_id text,
    district_id uuid,
    coach_name text NOT NULL DEFAULT '',
    captain_name text NOT NULL DEFAULT '',
    publication_status text NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (province_id, region_id) REFERENCES provinces(id, region_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (district_id, province_id) REFERENCES districts(id, province_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX clubs_publication_name_idx ON clubs(publication_status, name);
CREATE INDEX clubs_region_province_idx ON clubs(region_id, province_id);

CREATE TABLE players (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name text NOT NULL,
    position text NOT NULL DEFAULT '',
    jersey_number integer CHECK (jersey_number IS NULL OR jersey_number BETWEEN 0 AND 99),
    photo_url text,
    display_order integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX players_club_order_idx ON players(club_id, is_published, display_order);

CREATE TABLE club_staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text NOT NULL,
    photo_url text,
    display_order integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX club_staff_order_idx ON club_staff(club_id, is_published, display_order);

CREATE TABLE club_honours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    title text NOT NULL,
    years text NOT NULL DEFAULT '',
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX club_honours_order_idx ON club_honours(club_id, display_order);

CREATE TABLE league_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    format text NOT NULL CHECK (format IN ('9s', '13s')),
    region_id text NOT NULL REFERENCES regions(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    province_id text NOT NULL,
    district_id uuid,
    season text NOT NULL,
    venue text NOT NULL DEFAULT '',
    contact_name text NOT NULL DEFAULT '',
    contact_email text NOT NULL DEFAULT '',
    contact_phone text NOT NULL DEFAULT '',
    registration_status text NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'registered', 'rejected', 'archived')),
    publication_status text NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (province_id, region_id) REFERENCES provinces(id, region_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (district_id, province_id) REFERENCES districts(id, province_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX league_location_season_idx ON league_registrations(region_id, province_id, season, format);
CREATE INDEX league_publication_idx ON league_registrations(publication_status, registration_status);

CREATE TABLE league_registration_clubs (
    league_registration_id uuid NOT NULL REFERENCES league_registrations(id) ON DELETE CASCADE,
    club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
    PRIMARY KEY (league_registration_id, club_id)
);

CREATE TABLE competitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    format text CHECK (format IS NULL OR format IN ('9s', '13s', '13-a-side', 'other')),
    season text NOT NULL,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (name, season)
);

CREATE TABLE fixtures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id uuid REFERENCES competitions(id) ON DELETE SET NULL,
    round text NOT NULL DEFAULT '',
    home_club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
    away_club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
    venue text NOT NULL DEFAULT '',
    kickoff_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'postponed', 'cancelled')),
    home_score integer CHECK (home_score IS NULL OR home_score >= 0),
    away_score integer CHECK (away_score IS NULL OR away_score >= 0),
    home_ladder_points numeric(5, 2) NOT NULL DEFAULT 0 CHECK (home_ladder_points >= 0),
    away_ladder_points numeric(5, 2) NOT NULL DEFAULT 0 CHECK (away_ladder_points >= 0),
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (home_club_id <> away_club_id),
    CHECK ((home_score IS NULL AND away_score IS NULL) OR (home_score IS NOT NULL AND away_score IS NOT NULL)),
    CHECK (status <> 'completed' OR home_score IS NOT NULL)
);

CREATE INDEX fixtures_kickoff_status_idx ON fixtures(kickoff_at, status);
CREATE INDEX fixtures_home_club_idx ON fixtures(home_club_id, kickoff_at DESC);
CREATE INDEX fixtures_away_club_idx ON fixtures(away_club_id, kickoff_at DESC);
CREATE INDEX fixtures_competition_idx ON fixtures(competition_id, kickoff_at);

CREATE TABLE club_season_stats (
    club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    competition_id uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    played integer NOT NULL DEFAULT 0 CHECK (played >= 0),
    wins integer NOT NULL DEFAULT 0 CHECK (wins >= 0),
    losses integer NOT NULL DEFAULT 0 CHECK (losses >= 0),
    draws integer NOT NULL DEFAULT 0 CHECK (draws >= 0),
    points_for integer NOT NULL DEFAULT 0 CHECK (points_for >= 0),
    points_against integer NOT NULL DEFAULT 0 CHECK (points_against >= 0),
    ladder_points numeric(7, 2) NOT NULL DEFAULT 0 CHECK (ladder_points >= 0),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (club_id, competition_id),
    CHECK (wins + losses + draws <= played)
);

CREATE INDEX club_season_rank_idx ON club_season_stats(competition_id, ladder_points DESC, points_for DESC);

CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    price_minor integer NOT NULL CHECK (price_minor >= 0),
    currency char(3) NOT NULL DEFAULT 'PGK',
    image_url text,
    status text NOT NULL DEFAULT 'coming-soon' CHECK (status IN ('draft', 'coming-soon', 'available', 'discontinued')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    request_id text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_actor_time_idx ON audit_events(actor_admin_id, created_at DESC);
CREATE INDEX audit_resource_idx ON audit_events(resource_type, resource_id, created_at DESC);

INSERT INTO regions (id, name) VALUES
    ('southern', 'Southern Region'),
    ('highlands', 'Highlands Region'),
    ('momase', 'Momase Region'),
    ('islands', 'New Guinea Islands Region')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO provinces (id, region_id, name) VALUES
    ('central', 'southern', 'Central Province'),
    ('gulf', 'southern', 'Gulf Province'),
    ('milne-bay', 'southern', 'Milne Bay Province'),
    ('national-capital-district', 'southern', 'National Capital District'),
    ('oro', 'southern', 'Oro Province'),
    ('western', 'southern', 'Western Province'),
    ('eastern-highlands', 'highlands', 'Eastern Highlands Province'),
    ('enga', 'highlands', 'Enga Province'),
    ('hela', 'highlands', 'Hela Province'),
    ('jiwaka', 'highlands', 'Jiwaka Province'),
    ('simbu', 'highlands', 'Simbu Province'),
    ('southern-highlands', 'highlands', 'Southern Highlands Province'),
    ('western-highlands', 'highlands', 'Western Highlands Province'),
    ('east-sepik', 'momase', 'East Sepik Province'),
    ('madang', 'momase', 'Madang Province'),
    ('morobe', 'momase', 'Morobe Province'),
    ('west-sepik', 'momase', 'West Sepik (Sandaun) Province'),
    ('east-new-britain', 'islands', 'East New Britain Province'),
    ('new-ireland', 'islands', 'New Ireland Province'),
    ('west-new-britain', 'islands', 'West New Britain Province'),
    ('autonomous-region-of-bougainville', 'islands', 'Autonomous Region of Bougainville')
ON CONFLICT (id) DO UPDATE SET region_id = EXCLUDED.region_id, name = EXCLUDED.name;