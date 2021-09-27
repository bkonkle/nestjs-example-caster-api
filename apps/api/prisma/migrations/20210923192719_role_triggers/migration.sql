-- Create a trigger that validates the subjectTable based on information_schema
CREATE OR REPLACE FUNCTION check_role_grant() RETURNS trigger as $$
  BEGIN
    IF EXISTS (
      SELECT 1
        FROM information_schema.tables
      WHERE table_schema='public'
        AND table_type='BASE TABLE'
        AND table_name=NEW."subjectTable"
    ) THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'subjectTable must match an existing table_name';
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_create_role_grant
BEFORE INSERT OR UPDATE ON "RoleGrant"
  FOR EACH ROW EXECUTE PROCEDURE check_role_grant();

-- Profiles

-- Delete any RoleGrants that match the Profile id
CREATE OR REPLACE FUNCTION on_delete_profile() RETURNS trigger AS $$
  BEGIN
    DELETE FROM "RoleGrant" WHERE "profileId" = OLD.id;

    RETURN OLD;
  END;
$$ LANGUAGE plpgsql;

-- Whenever a Profile is deleted, remove all the associated RoleGrants as well
CREATE TRIGGER on_delete_profile
BEFORE DELETE ON "Profile"
  FOR EACH ROW EXECUTE PROCEDURE on_delete_profile();

-- Shows

-- Delete any RoleGrants that match the Show id
CREATE OR REPLACE FUNCTION on_delete_show() RETURNS trigger AS $$
  BEGIN
    DELETE FROM "RoleGrant"
    WHERE "subjectId" = OLD.id
      AND "subjectTable" = 'Show';

    RETURN OLD;
  END;
$$ LANGUAGE plpgsql;

-- Whenever a Show is deleted, remove all the associated RoleGrants as well
CREATE TRIGGER on_delete_show
BEFORE DELETE ON "Show"
  FOR EACH ROW EXECUTE PROCEDURE on_delete_show();

-- Episodes

-- Delete any RoleGrants that match the Episode id
CREATE OR REPLACE FUNCTION on_delete_episode() RETURNS trigger AS $$
  BEGIN
    DELETE FROM "RoleGrant"
    WHERE "subjectId" = OLD.id
      AND "subjectTable" = 'Episode';

    RETURN OLD;
  END;
$$ LANGUAGE plpgsql;

-- Whenever an Episode is deleted, remove all the associated RoleGrants as well
CREATE TRIGGER on_delete_episode
BEFORE DELETE ON "Episode"
  FOR EACH ROW EXECUTE PROCEDURE on_delete_episode();

