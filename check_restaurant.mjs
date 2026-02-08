
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sswqdwkiklgviddqtjlh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd3Fkd2tpa2xndmlkZHF0amxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjI0NTYsImV4cCI6MjA4NTc5ODQ1Nn0.jTjxoCU2mgYGfqy3Ah1y90sj0OPt2MGRB9GZgU6Geck';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRestaurant() {
    console.log("Checking restaurant...");
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', 'ca53f5c1-864b-4b35-8626-6f1dbf097d79')
        .single();

    if (error) {
        console.error("Supabase Error:", JSON.stringify(error, null, 2));
    } else {
        console.log("Restaurant Found!");
        console.log("Images:", data.images);
        console.log("Menu:", data.menu);
        console.log("Name:", data.name);
    }
}

checkRestaurant();
