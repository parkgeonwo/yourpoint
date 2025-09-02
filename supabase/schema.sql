-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table
CREATE TABLE public.spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Space members table
CREATE TABLE public.space_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see spaces they are members of
CREATE POLICY "Users can view their spaces" ON public.spaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members 
      WHERE space_id = spaces.id AND user_id = auth.uid()
    )
  );

-- Users can create spaces
CREATE POLICY "Users can create spaces" ON public.spaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Space owners can update their spaces
CREATE POLICY "Owners can update spaces" ON public.spaces
  FOR UPDATE USING (auth.uid() = owner_id);

-- Space members policies
CREATE POLICY "Users can view space memberships" ON public.space_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.space_members sm 
      WHERE sm.space_id = space_members.space_id 
      AND sm.user_id = auth.uid()
    )
  );