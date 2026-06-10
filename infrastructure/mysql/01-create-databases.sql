-- AWSomeShop — database bootstrap
-- Only CREATE DATABASE here. Table schemas are managed by each service's
-- Flyway migrations (src/main/resources/db/migration) on startup.
--
-- DB names match each service's application-docker.yml DB_NAME default exactly:
--   auth    -> awsome_shop_auth
--   product -> awsome_shop_product
--   points  -> awsome_shop_point   (singular "point", per the real config)
--   order   -> awsome_shop_order
--   gateway -> awsome_shop_gateway (gateway also runs Flyway + uses a datasource)

CREATE DATABASE IF NOT EXISTS awsome_shop_auth
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS awsome_shop_product
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS awsome_shop_point
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS awsome_shop_order
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS awsome_shop_gateway
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
