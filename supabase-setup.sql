-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mii_characters table for storing Mii customizations
CREATE TABLE IF NOT EXISTS public.mii_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  skin_tone_u FLOAT NOT NULL,
  skin_tone_v FLOAT NOT NULL,
  skin_tone_w FLOAT NOT NULL,
  -- Add other customization fields as needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles - users can only view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Create policy for profiles - users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Set up Row Level Security (RLS) for mii_characters
ALTER TABLE public.mii_characters ENABLE ROW LEVEL SECURITY;

-- Create policies for mii_characters
CREATE POLICY "Users can view their own Mii characters" 
  ON public.mii_characters FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Mii characters" 
  ON public.mii_characters FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Mii characters" 
  ON public.mii_characters FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Mii characters" 
  ON public.mii_characters FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a profile when a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
