import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const sampleTemplates = [
  {
    title: 'Fashion - 100 (EN)',
    canvaUrl: 'https://www.canva.com/design/DAGi1AW8Lo0/qsw26-dSHEYFa3fQi9LJEQ/view?utm_content=DAGi1AW8L00&utm_campaign=designshare&utm_medium',
    category: 'FASHION',
    format: 'Feed',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/mushi-a9949.firebasestorage.app/o/MUSHI%20Fashion%20-%20%20100%20(EN).png?alt=media&token=0b9a5851-12e5-4b8c-ac90-343b410273e8',
    language: 'EN',
    popularity: 73,
    savedCount: 0
  },
  {
    title: 'Fashion - 101 (EN)',
    canvaUrl: 'https://www.canva.com/design/sample2/view',
    category: 'FASHION',
    format: 'Feed',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/mushi-sample2.png',
    language: 'EN',
    popularity: 65,
    savedCount: 0
  },
  {
    title: 'Fashion - 102 (ES)',
    canvaUrl: 'https://www.canva.com/design/sample3/view',
    category: 'FASHION',
    format: 'Story',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/mushi-sample3.png',
    language: 'ES',
    popularity: 58,
    savedCount: 0
  }
];

async function seedTemplates() {
  try {
    const { data, error } = await supabase
      .from('templates')
      .insert(sampleTemplates)
      .select();

    if (error) {
      throw error;
    }

    console.log('Templates seeded successfully:', data.length);
  } catch (error) {
    console.error('Error seeding templates:', error);
  }
}

seedTemplates(); 