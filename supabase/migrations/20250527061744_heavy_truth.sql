/*
  # Update food nutrition table schema

  1. Changes
    - Rename columns to match application usage
    - Add missing columns
    - Update column types for better precision
    - Add proper constraints and defaults

  2. Security
    - Maintain existing RLS policies
*/

-- Rename and modify existing columns
ALTER TABLE food_nutrition 
  RENAME COLUMN "Wt_No(g)" TO serving_size;

ALTER TABLE food_nutrition
  ALTER COLUMN serving_size SET DEFAULT 100,
  ALTER COLUMN serving_size SET NOT NULL;

-- Add missing columns and set defaults
ALTER TABLE food_nutrition
  ALTER COLUMN calories TYPE numeric(10,2),
  ALTER COLUMN protein TYPE numeric(10,2),
  ALTER COLUMN carbohydrates TYPE numeric(10,2),
  ALTER COLUMN fat TYPE numeric(10,2),
  ALTER COLUMN fibre TYPE numeric(10,2),
  ALTER COLUMN nat TYPE numeric(10,2);

-- Add constraints
ALTER TABLE food_nutrition
  ADD CONSTRAINT food_nutrition_serving_size_check CHECK (serving_size > 0),
  ADD CONSTRAINT food_nutrition_calories_check CHECK (calories >= 0),
  ADD CONSTRAINT food_nutrition_protein_check CHECK (protein >= 0),
  ADD CONSTRAINT food_nutrition_carbohydrates_check CHECK (carbohydrates >= 0),
  ADD CONSTRAINT food_nutrition_fat_check CHECK (fat >= 0),
  ADD CONSTRAINT food_nutrition_fibre_check CHECK (fibre >= 0),
  ADD CONSTRAINT food_nutrition_nat_check CHECK (nat >= 0);

-- Update any null values to defaults
UPDATE food_nutrition SET
  serving_size = 100 WHERE serving_size IS NULL;

-- Add comments for better documentation
COMMENT ON TABLE food_nutrition IS 'Stores nutritional information for foods';
COMMENT ON COLUMN food_nutrition.serving_size IS 'Serving size in grams';
COMMENT ON COLUMN food_nutrition.calories IS 'Calories per serving';
COMMENT ON COLUMN food_nutrition.protein IS 'Protein content in grams per serving';
COMMENT ON COLUMN food_nutrition.carbohydrates IS 'Carbohydrate content in grams per serving';
COMMENT ON COLUMN food_nutrition.fat IS 'Fat content in grams per serving';
COMMENT ON COLUMN food_nutrition.fibre IS 'Fibre content in grams per serving';
COMMENT ON COLUMN food_nutrition.nat IS 'Sodium content in milligrams per serving';