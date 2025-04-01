# Supabase Integration for Mii Character Customization

This document explains how to set up the Supabase integration for the Mii character customization feature.

## Overview

The integration allows users to:
1. Create an account with email and password
2. Customize their Mii character's skin tone
3. Save their customization to the database
4. See their customized Mii in the 3D environment

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name and password for your project
4. Wait for the project to be created

### 2. Configure Database Tables

Run the following SQL in the Supabase SQL Editor to set up the necessary tables and security rules:

```sql
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
```

### 3. Configure Authentication

1. In the Supabase dashboard, go to Authentication > Settings
2. Under Email Auth, make sure "Enable Email Signup" is turned on
3. Optionally, configure email templates for confirmation emails

### 4. Get API Keys

1. In the Supabase dashboard, go to Settings > API
2. Copy the URL and anon/public key
3. Update the `src/js/utils/supabaseClient.js` file with your URL and key:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

## How It Works

### Authentication Flow

1. Users sign up or log in through the AuthForm component
2. On successful authentication, the user's session is stored
3. The app checks if the user has a Mii character
4. If not, it shows the MiiCustomizer component

### Mii Customization

1. Users can adjust skin tone parameters using sliders
2. The preview updates in real-time
3. When saved, the customization is stored in the database
4. The user's Mii appears in the 3D environment

### Data Structure

- **profiles**: Stores basic user information
  - id: UUID (from auth.users)
  - email: TEXT
  - created_at: TIMESTAMP

- **mii_characters**: Stores Mii customization data
  - id: UUID
  - user_id: UUID (references auth.users)
  - skin_tone_u: FLOAT (lightness parameter)
  - skin_tone_v: FLOAT (red-green parameter)
  - skin_tone_w: FLOAT (blue-yellow parameter)
  - created_at: TIMESTAMP
  - updated_at: TIMESTAMP

## Security

- Row Level Security (RLS) ensures users can only access their own data
- Authentication is handled securely by Supabase
- Only the anon/public key is exposed in the client code

## Extending the System

To add more customization options:

1. Add new columns to the mii_characters table
2. Update the MiiCustomizer component with new controls
3. Update the MiiFigure component to use the new parameters

## Troubleshooting

- If authentication fails, check your Supabase URL and key
- If database operations fail, check the RLS policies
- Check browser console for error messages
