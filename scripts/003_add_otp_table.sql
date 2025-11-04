-- Create OTP table for email verification
-- Replace in-memory OTP store with database-backed solution

CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_otp_email ON public.otp_codes(email);
CREATE INDEX idx_otp_expires_at ON public.otp_codes(expires_at);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow unauthenticated users to create OTP records (for signup)
CREATE POLICY "Allow creating OTP for signup"
ON public.otp_codes FOR INSERT
WITH CHECK (true);

-- Allow unauthenticated users to verify OTP
CREATE POLICY "Allow verifying OTP"
ON public.otp_codes FOR SELECT
WITH CHECK (true);

-- Allow unauthenticated users to update OTP (for verification)
CREATE POLICY "Allow updating OTP"
ON public.otp_codes FOR UPDATE
WITH CHECK (true);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (via pg_cron if available)
-- SELECT cron.schedule('cleanup-expired-otps', '*/5 * * * *', 'SELECT cleanup_expired_otps()');
