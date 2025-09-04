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
  space_type TEXT CHECK (space_type IN ('personal', 'shared')) DEFAULT 'shared',
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

-- Users can view spaces they own or are members of
CREATE POLICY "Users can view their spaces" ON public.spaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT space_id FROM public.space_members 
      WHERE user_id = auth.uid()
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
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert themselves as space members" ON public.space_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Space owners can manage members" ON public.space_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.spaces 
      WHERE spaces.id = space_members.space_id 
      AND spaces.owner_id = auth.uid()
    )
  );

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  start_time TIME,
  end_date DATE NOT NULL,
  end_time TIME,
  event_type TEXT CHECK (event_type IN ('나', '상대', '우리')) DEFAULT '나',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view events in their spaces" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members 
      WHERE space_id = events.space_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their spaces" ON public.events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.space_members 
      WHERE space_id = events.space_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- Function: 새로운 사용자가 인증되면 public.users에 자동으로 추가
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'name',           -- 소셜 로그인 이름
      new.raw_user_meta_data->>'full_name',     -- 일부 제공업체는 full_name 사용
      split_part(new.email, '@', 1)             -- 이메일 앞부분을 기본 이름으로
    ),
    new.raw_user_meta_data->>'avatar_url'       -- 프로필 이미지
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auth.users에 새 사용자 생성 시 실행
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();