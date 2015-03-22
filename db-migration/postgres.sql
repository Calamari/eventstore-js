CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;

CREATE SEQUENCE domain_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE domain_events (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    aggregate_id character(36) NOT NULL,
    data json NOT NULL,
    created_at timestamp without time zone
);

ALTER TABLE ONLY domain_events ADD CONSTRAINT domain_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY domain_events ALTER COLUMN id SET DEFAULT nextval('domain_events_id_seq'::regclass);

CREATE INDEX domain_events_aggregate_id_idx ON domain_events (aggregate_id);
