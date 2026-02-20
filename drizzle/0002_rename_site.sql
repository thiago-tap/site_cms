-- Update site_name in settings table
UPDATE settings SET value = 'Blog do Thiago', updated_at = unixepoch() WHERE key = 'site_name';
