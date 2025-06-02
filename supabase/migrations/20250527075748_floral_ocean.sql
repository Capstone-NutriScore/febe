-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  gender TEXT,
  age INTEGER,
  height NUMERIC,
  weight NUMERIC,
  activity_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_nutrition table
CREATE TABLE IF NOT EXISTS food_nutrition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  serving_size NUMERIC NOT NULL DEFAULT 100,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbohydrates NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  fibre NUMERIC NOT NULL,
  nat NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_nutrition ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can read their own profile" 
  ON profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for food_nutrition
CREATE POLICY "Anyone can read food_nutrition" 
  ON food_nutrition 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert food_nutrition" 
  ON food_nutrition 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update food_nutrition" 
  ON food_nutrition 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');