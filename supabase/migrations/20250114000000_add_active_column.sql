-- Add active column for soft delete
ALTER TABLE public.cvs 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Create index on active column for faster queries
CREATE INDEX IF NOT EXISTS cvs_active_idx ON public.cvs(active);

-- Add comment
COMMENT ON COLUMN public.cvs.active IS 'Soft delete flag - false means CV is archived/deleted';

