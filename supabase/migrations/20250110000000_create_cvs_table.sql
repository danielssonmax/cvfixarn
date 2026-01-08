-- Drop existing table if it exists
DROP TABLE IF EXISTS public.cvs CASCADE;

-- Create CVs table to store all CV data
CREATE TABLE public.cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- CV Metadata
  draft_id UUID UNIQUE, -- Client-side draft ID for idempotent sync
  version BIGINT NOT NULL DEFAULT 0, -- For optimistic locking
  cv_name TEXT NOT NULL DEFAULT 'cv.pdf',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Template & Styling
  selected_template TEXT NOT NULL DEFAULT 'default',
  selected_font TEXT NOT NULL DEFAULT 'Poppins',
  font_size INTEGER NOT NULL DEFAULT 11,
  line_height NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  selected_color TEXT NOT NULL DEFAULT '#000000',
  header_color TEXT NOT NULL DEFAULT '#000000',
  
  -- Personal Info (all fields including optional ones)
  personal_info JSONB NOT NULL DEFAULT '{
    "title": "",
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "location": "",
    "summary": "",
    "photo": "",
    "address": "",
    "postalCode": "",
    "birthDate": "",
    "drivingLicense": "",
    "nationality": "",
    "customFieldLabel": "Anpassat fält",
    "customFieldValue": "",
    "optionalFields": {}
  }'::jsonb,
  
  -- Work Experience (array of objects with: title, company, location, startDate, endDate, current, description, isPageBreak)
  work_experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Education (array of objects with: school, degree, field, startDate, endDate, current, description, isPageBreak)
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Skills (array of objects with: name, level)
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Languages (array of objects with: name, level)
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Profile/Summary (object with: description)
  profile JSONB DEFAULT NULL,
  
  -- Courses (array of objects with: name, institution, date, description, isPageBreak)
  courses JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Internships (array of objects with: title, company, location, startDate, endDate, current, description, isPageBreak)
  internships JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Certificates (array of objects with: name, issuer, date, description, isPageBreak)
  certificates JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Achievements (array of objects with: title, description, isPageBreak)
  achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- References (array of objects with: name, title, company, phone, email, isPageBreak)
  -- Note: If empty array, display "Referenser ges på begäran" in preview
  "references" JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Traits (array of objects with: name)
  traits JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Hobbies (array of objects with: title, description)
  hobbies JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Section Order & Visibility
  section_order JSONB NOT NULL DEFAULT '["personalInfo", "experience", "education", "skills", "languages"]'::jsonb,
  section_names JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS cvs_user_id_idx ON public.cvs(user_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS cvs_updated_at_idx ON public.cvs(updated_at DESC);

-- Create unique index on draft_id for idempotent sync
CREATE UNIQUE INDEX IF NOT EXISTS cvs_draft_id_idx ON public.cvs(draft_id) WHERE draft_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own CVs
CREATE POLICY "Users can view their own CVs"
  ON public.cvs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own CVs
CREATE POLICY "Users can insert their own CVs"
  ON public.cvs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own CVs
CREATE POLICY "Users can update their own CVs"
  ON public.cvs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own CVs
CREATE POLICY "Users can delete their own CVs"
  ON public.cvs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.cvs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment to table
COMMENT ON TABLE public.cvs IS 'Stores all CV data including content, styling, and metadata';

