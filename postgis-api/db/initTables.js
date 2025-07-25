import pool from "./pool.js";

const createTablesSQL = `
  CREATE EXTENSION IF NOT EXISTS postgis;

  CREATE TABLE IF NOT EXISTS county (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE,
    district INTEGER,
    tsd_id INTEGER,
    objectid INTEGER,
    county_fip INTEGER,
    county_num INTEGER,
    shape_area DOUBLE PRECISION,
    shape_length DOUBLE PRECISION,
    geom GEOMETRY(MultiPolygon, 4326)
  );

  CREATE TABLE IF NOT EXISTS municipality (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vpa_decile_breakpoints (
    id SERIAL PRIMARY KEY,
    municipality_id INTEGER REFERENCES municipality(id) ON DELETE CASCADE,
    decile INTEGER NOT NULL CHECK (decile BETWEEN 1 AND 10),
    max_vpa INTEGER NOT NULL,
    UNIQUE (municipality_id, decile)
  );

  CREATE TABLE IF NOT EXISTS vpa_subdecile_breakpoints (
    id SERIAL PRIMARY KEY,
    municipality_id INTEGER REFERENCES municipality(id) ON DELETE CASCADE,
    decile INTEGER NOT NULL CHECK (decile BETWEEN 1 AND 10),
    subdecile INTEGER NOT NULL CHECK (subdecile BETWEEN 1 AND 10),
    max_vpa INTEGER NOT NULL,
    UNIQUE (municipality_id, decile, subdecile)
  );

  CREATE TABLE IF NOT EXISTS municipality_county (
    municipality_id INTEGER NOT NULL REFERENCES municipality(id) ON DELETE CASCADE,
    county_id INTEGER NOT NULL REFERENCES county(id) ON DELETE CASCADE,
    PRIMARY KEY (municipality_id, county_id)
  );

  CREATE TABLE IF NOT EXISTS parcel (
    id SERIAL PRIMARY KEY,
    municipality_id INTEGER REFERENCES municipality(id),
    objectid INTEGER,
    mergeid TEXT,
    address TEXT,
    yearbuilt INTEGER,
    calc_area DOUBLE PRECISION,
    u3value INTEGER,
    vpa DOUBLE PRECISION,
    landvpa INTEGER,
    txbl_val INTEGER,
    jurscode TEXT,
    acctid TEXT,
    city TEXT,
    zipcode TEXT,
    ownname1 TEXT,
    ownname2 TEXT,
    landuseu3 TEXT,
    lu TEXT,
    desclu TEXT,
    descstyl TEXT,
    descbldg TEXT,
    nfmlndvl INTEGER,
    nfmimpvl INTEGER,
    nfmttlvl INTEGER,
    bldg_story INTEGER,
    resident INTEGER,
    merge_ TEXT,
    new_merge TEXT,
    notes TEXT,
    downtown TEXT,
    fid1 TEXT,
    cityname TEXT,
    insidecore TEXT,
    outsidecore TEXT,
    yearbuiltcat TEXT,
    impvalperacre DOUBLE PRECISION,
    dt_easton TEXT,
    developed TEXT,
    geom GEOMETRY(MultiPolygon, 4326),
    vpa_decile INTEGER,
    vpa_subdecile INTEGER
  );

  CREATE TABLE IF NOT EXISTS food_access_points ( 
    id SERIAL PRIMARY KEY,
    objectid INTEGER,
    user_name TEXT,
    user_common_names TEXT,
    user_category TEXT,
    user_address TEXT,
    user_city TEXT,
    user_state TEXT,
    user_zip TEXT,
    user_phone TEXT,
    user_website TEXT,
    last_edited_date TIMESTAMP,
    user_latitude DOUBLE PRECISION,
    user_longitude DOUBLE PRECISION,
    geometry GEOMETRY(Point, 4326)
  );

  CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    upload_type TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS slr_parcels (
    id SERIAL PRIMARY KEY,
    OBJECTID INTEGER,
    MergeID TEXT,
    County TEXT,
    PIN TEXT,
    LU TEXT,
    YearBuilt INTEGER,
    land_val INTEGER,
    bldg_val INTEGER,
    mrkt_val INTEGER,
    U3VAL INTEGER,
    tax_val INTEGER,
    CALC_AREA REAL,
    VPA REAL,
    acres REAL,
    acres_new REAL,
    acres_rat REAL,
    bldgval_new INTEGER,
    landval_new INTEGER,
    U3val_new INTEGER,
    vpa_new INTEGER,
    lulc_acres REAL,
    LandUseU3 TEXT,
    city TEXT,
    geom GEOMETRY(MultiPolygon, 4326)
  );
`;

const insertInitialDataSQL = `
  INSERT INTO county (name) VALUES 
  ('Caroline'),
  ('Cecil'),
  ('Dorchester'),
  ('Kent'),
  ('Queen Anne''s'),
  ('Somerset'),
  ('Talbot'),
  ('Wicomico'),
  ('Worcester')
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO municipality (name) VALUES 
  ('Caroline Rural'),
  ('Dorchester Rural'),
  ('Kent Rural'),
  ('Queen Anne''s Rural'),
  ('Somerset Rural'),
  ('Talbot Rural'),
  ('Wicomico Rural'),
  ('Worcester Rural'),
  ('Barclay'),
  ('Berlin'),
  ('Betterton'),
  ('Brookview'),
  ('Cambridge'),
  ('Centreville'),
  ('Chestertown'),
  ('Church Creek'),
  ('Church Hill'),
  ('Crisfield'),
  ('Delmar'),
  ('Denton'),
  ('East New Market'),
  ('Easton'),
  ('Eldorado'),
  ('Federalsburg'),
  ('Fruitland'),
  ('Galena'),
  ('Galestown'),
  ('Goldsboro'),
  ('Greensboro'),
  ('Hebron'),
  ('Henderson'),
  ('Hillsboro'),
  ('Hurlock'),
  ('Mardela Springs'),
  ('Marydel'),
  ('Millington'),
  ('Ocean City'),
  ('Oxford'),
  ('Pittsville'),
  ('Pocomoke City'),
  ('Preston'),
  ('Princess Anne'),
  ('Queen Anne'),
  ('Queenstown'),
  ('Ridgely'),
  ('Rock Hall'),
  ('Salisbury'),
  ('Secretary'),
  ('Sharptown'),
  ('Snow Hill'),
  ('St Michaels'),
  ('Sudlersville'),
  ('Templeville'),
  ('Trappe'),
  ('Vienna'),
  ('Willards')
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO municipality_county (municipality_id, county_id)
  SELECT m.id, c.id
  FROM municipality m, county c
  WHERE c.name = 'Caroline' AND m.name IN (
    'Denton', 'Federalsburg', 'Goldsboro', 'Greensboro',
    'Henderson', 'Hillsboro', 'Marydel', 'Preston',
    'Ridgely', 'Templeville',
    'Caroline Rural'
  )
  AND NOT EXISTS (
    SELECT 1 FROM municipality_county mc
    WHERE mc.municipality_id = m.id AND mc.county_id = c.id
  );

  INSERT INTO municipality_county (municipality_id, county_id)
  SELECT m.id, c.id
  FROM municipality m, county c
  WHERE c.name = 'Dorchester' AND m.name IN (
    'Brookview', 'Cambridge', 'Church Creek', 'East New Market',
    'Eldorado', 'Galestown', 'Hurlock', 'Secretary', 'Vienna',
    'Dorchester Rural'
  )
  AND NOT EXISTS (
    SELECT 1 FROM municipality_county mc
    WHERE mc.municipality_id = m.id AND mc.county_id = c.id
  );

  INSERT INTO municipality_county (municipality_id, county_id)
  SELECT m.id, c.id
  FROM municipality m, county c
  WHERE c.name = 'Kent' AND m.name IN (
    'Betterton', 'Chestertown', 'Galena', 'Millington', 'Rock Hall',
    'Kent Rural'
  )
  AND NOT EXISTS (
    SELECT 1 FROM municipality_county mc
    WHERE mc.municipality_id = m.id AND mc.county_id = c.id
  );

  INSERT INTO municipality_county (municipality_id, county_id)
  SELECT m.id, c.id
  FROM municipality m, county c
  WHERE c.name = 'Queen Anne''s' AND m.name IN (
    'Barclay', 'Centreville', 'Church Hill', 'Queen Anne',
    'Queenstown', 'Sudlersville', 'Templeville',
    'Queen Anne''s Rural'
  )
  AND NOT EXISTS (
    SELECT 1 FROM municipality_county mc
    WHERE mc.municipality_id = m.id AND mc.county_id = c.id
  );

  INSERT INTO municipality_county (municipality_id, county_id)
  SELECT m.id, c.id
  FROM municipality m, county c
  WHERE c.name = 'Somerset' AND m.name IN (
    'Crisfield', 'Princess Anne',
    'Somerset Rural'
  )
  AND NOT EXISTS (
    SELECT 1 FROM municipality_county mc
    WHERE mc.municipality_id = m.id AND mc.county_id = c.id
  );

  INSERT INTO municipality_county (municipality_id, county_id)
  SELECT m.id, c.id
  FROM municipality m, county c
  WHERE c.name = 'Talbot' AND m.name IN (
    'Easton', 'Oxford', 'Queen Anne', 'St Michaels', 'Trappe',
    'Talbot Rural'
  )
  AND NOT EXISTS (
    SELECT 1 FROM municipality_county mc
    WHERE mc.municipality_id = m.id AND mc.county_id = c.id
  );

  INSERT INTO municipality_county (municipality_id, county_id)
  SELECT m.id, c.id
  FROM municipality m, county c
  WHERE c.name = 'Wicomico' AND m.name IN (
    'Delmar', 'Fruitland', 'Hebron', 'Mardela Springs',
    'Pittsville', 'Salisbury', 'Sharptown', 'Willards',
    'Wicomico Rural'
  )
  AND NOT EXISTS (
    SELECT 1 FROM municipality_county mc
    WHERE mc.municipality_id = m.id AND mc.county_id = c.id
  );

  INSERT INTO municipality_county (municipality_id, county_id)
  SELECT m.id, c.id
  FROM municipality m, county c
  WHERE c.name = 'Worcester' AND m.name IN (
    'Berlin', 'Ocean City', 'Pocomoke City', 'Snow Hill',
    'Worcester Rural'
  )
  AND NOT EXISTS (
    SELECT 1 FROM municipality_county mc
    WHERE mc.municipality_id = m.id AND mc.county_id = c.id
  );
`;

export const createTables = async () => {
  try {
    await pool.query(createTablesSQL);
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

export const insertInitialData = async () => {
  try {
    await pool.query(insertInitialDataSQL);
  } catch (error) {
    console.error("Error inserting initial data:", error);
    throw error;
  }
};

export const setupDatabase = async () => {
  await createTables();
  await insertInitialData();
};