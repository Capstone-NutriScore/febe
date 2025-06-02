/*
  # Enable RLS and Set Up Security Policies

  1. Security Changes
    - Enable RLS on profiles table
    - Enable RLS on food_nutrition table
    - Add policies for authenticated users to:
      - Read/write their own profile data
      - Read food nutrition data
      
  2. Notes
    - All tables must have RLS enabled
    - Authenticated users can only access their own profile data
    - Food nutrition data is read-only for authenticated users
*/

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on food_nutrition table
ALTER TABLE food_nutrition ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for food_nutrition table
CREATE POLICY "Anyone can read food nutrition data"
  ON food_nutrition
  FOR SELECT
  TO authenticated
  USING (true);