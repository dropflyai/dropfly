import { NextResponse } from 'next/server';

export async function GET() {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_PRODUCT_ADS_TABLE_ID = process.env.AIRTABLE_PRODUCT_ADS_TABLE_ID;

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PRODUCT_ADS_TABLE_ID}?sort%5B0%5D%5Bfield%5D=Scheduled%20Date&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product ads' },
      { status: 500 }
    );
  }
}
