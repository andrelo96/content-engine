import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function GET() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Date',
      date: {
        after: thirtyDaysAgo.toISOString()
      }
    }
  });

  return NextResponse.json({ pages: response.results });
}