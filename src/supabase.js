
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sswqdwkiklgviddqtjlh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd3Fkd2tpa2xndmlkZHF0amxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjI0NTYsImV4cCI6MjA4NTc5ODQ1Nn0.jTjxoCU2mgYGfqy3Ah1y90sj0OPt2MGRB9GZgU6Geck'

export const supabase = createClient(supabaseUrl, supabaseKey)
