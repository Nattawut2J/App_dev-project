import { createClient } from '@supabase/supabase-js'

// เอา URL และ Key ที่คุณได้มาวางตรงนี้ครับ
const supabaseUrl = 'https://hwipxslsxhsnmhqswskj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3aXB4c2xzeGhzbm1ocXN3c2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDY5NDMsImV4cCI6MjA4ODM4Mjk0M30.dzjRwHElpJKs42W_oDR7p8QSIhoF7Y05XlVH124IpYU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)