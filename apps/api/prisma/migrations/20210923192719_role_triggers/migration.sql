-- Delete any RoleGrants that match with the Profile id
CREATE OR REPLACE FUNCTION delete_role_grant() RETURNS trigger AS $$
  BEGIN
    DELETE FROM "RoleGrant" WHERE profileId = OLD.id;

    RETURN OLD;
  END;
$$ LANGUAGE plpgsql;

-- Whenever a Profile is deletet, remove all the associated RoleGrants as well
CREATE TRIGGER on_delete_profile
BEFORE DELETE ON "Profile"
  FOR EACH ROW EXECUTE PROCEDURE delete_role_grant();
