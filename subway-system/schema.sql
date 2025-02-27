DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_database
        WHERE datname = 'parker'
    ) THEN
        PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE parker');
    END IF;
END
$$;

-- Switch to the 'parker' database
\c parker;

BEGIN;

-- Ensure the schema exists
CREATE SCHEMA IF NOT EXISTS subway_system;

-- Train Lines
CREATE TABLE subway_system.train_lines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- e.g., "1", "2"
  fare DECIMAL(5, 2) DEFAULT 2.75 -- Default fare for each line
);

-- Stations
CREATE TABLE subway_system.stations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL -- e.g., "14th_St", "Canal_St"
);

-- Line Stations (Junction table between train_lines and stations)
CREATE TABLE subway_system.line_stations (
  line_id INTEGER REFERENCES subway_system.train_lines(id) ON DELETE CASCADE,
  station_id INTEGER REFERENCES subway_system.stations(id) ON DELETE CASCADE,
  station_order INTEGER NOT NULL, -- Station order on the line (helps in route calculation)
  PRIMARY KEY (line_id, station_id)
);

-- Fare Cards
CREATE TABLE subway_system.fare_cards (
  id SERIAL PRIMARY KEY,
  card_number VARCHAR(50) UNIQUE NOT NULL, -- Unique card identifier
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0 -- The card's current balance
);

-- Ride Logs
CREATE TABLE subway_system.ride_logs (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES subway_system.fare_cards(id) ON DELETE CASCADE,
  station_id INTEGER REFERENCES subway_system.stations(id),
  entry_exit VARCHAR(10) CHECK (entry_exit IN ('entry', 'exit')), -- Tracks if it's an entry or exit
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Tracks when the event occurred
);

-- Transfers
CREATE TABLE subway_system.transfers (
  from_station_id INTEGER REFERENCES subway_system.stations(id),
  to_station_id INTEGER REFERENCES subway_system.stations(id),
  PRIMARY KEY (from_station_id, to_station_id)
);


-- Insert Train Lines
INSERT INTO subway_system.train_lines (name, fare) VALUES
('1', 2.75),
('2', 2.75),
('3', 2.75),
('A', 2.75),
('B', 2.75),
('C', 2.75);

-- Insert Stations
INSERT INTO subway_system.stations (id, name) VALUES
(1, 'Times_Square'),
(2, '34th_Street'),
(3, '14th_Street'),
(4, '42nd_Street'),
(5, 'Canal_Street'),
(6, 'Chambers_Street'),
(7, 'West_4th_Street'),
(8, 'Spring_Street'),
(9, 'Christopher_St'),
(10, '23rd_Street'),
(11, 'Union_Square'),
(12, 'Houston_Street'),
(13, 'Grand_Central'),
(14, 'Bowling_Green');


-- Insert Line Stations
INSERT INTO subway_system.line_stations (line_id, station_id, station_order) VALUES
(1, 1, 1),  
(1, 2, 2),  
(1, 3, 3),  
(1, 4, 4),  
(1, 5, 5),  
(1, 6, 6),  
(1, 7, 7),  
(2, 8, 1),  
(2, 9, 2),  
(2, 10,3),
(2, 4, 4),  
(2, 11, 5),  
(2, 12, 6),
(3, 1, 1),  
(3, 13, 2),  
(3, 10, 3),   
(3, 14, 4),
(3, 7, 5);  

-- Insert Fare Cards
INSERT INTO subway_system.fare_cards (card_number, balance) VALUES
('1234567890', 20.00),
('9876543210', 15.50),
('5555555555', 10.75);

-- Insert Ride Logs
INSERT INTO subway_system.ride_logs (card_id, station_id, entry_exit) VALUES
(1, 1, 'entry'),   -- Card 1 entered at Times Square
(1, 2, 'exit'),    -- Card 1 exited at 34th Street
(2, 3, 'entry'),   -- Card 2 entered at 14th Street
(2, 5, 'exit');    -- Card 2 exited at Canal Street

COMMIT;