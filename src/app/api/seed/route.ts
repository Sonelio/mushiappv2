import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const sampleTemplates = [
  {
    title: 'Fashion - 100 (EN)',
    canvaUrl: 'https://www.canva.com/design/DAGi1AW8Lo0/qsw26-dSHEYFa3fQi9LJEQ/view?utm_content=DAGi1AW8L00&utm_campaign=designshare&utm_medium',
    category: 'FASHION',
    format: 'Feed',
    imageUrl: 'MUSHI Fashion - 100 (EN).png',
    language: 'EN',
    popularity: 73,
    savedCount: 0
  },
  {
    title: 'Fashion - 101 (EN)',
    canvaUrl: 'https://www.canva.com/design/sample2/view',
    category: 'FASHION',
    format: 'Feed',
    imageUrl: 'MUSHI Fashion - 101 (EN).png',
    language: 'EN',
    popularity: 65,
    savedCount: 0
  },
  {
    title: 'Fashion - 102 (ES)',
    canvaUrl: 'https://www.canva.com/design/sample3/view',
    category: 'FASHION',
    format: 'Story',
    imageUrl: 'MUSHI Fashion - 102 (ES).png',
    language: 'ES',
    popularity: 58,
    savedCount: 0
  }
];

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // First, delete all existing templates
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .neq('id', '0');

    if (deleteError) {
      console.error('Error deleting existing templates:', deleteError);
      throw deleteError;
    }

    // Insert sample templates
    const { data, error } = await supabase
      .from('templates')
      .insert(sampleTemplates)
      .select();

    if (error) {
      console.error('Error inserting templates:', error);
      throw error;
    }

    return NextResponse.json({ 
      message: 'Templates seeded successfully', 
      count: data.length,
      templates: data 
    });
  } catch (error) {
    console.error('Error seeding templates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed templates' },
      { status: 500 }
    );
  }
} 