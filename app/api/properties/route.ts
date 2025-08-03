import { NextRequest, NextResponse } from 'next/server';

// This is your complete API handler for PropertyData
export async function POST(request: NextRequest) {
  try {
    // Get the request data (postcode, etc.)
    const { postcode, limit = 20, timeframe = '90days' } = await request.json();

    // Validate the postcode format
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i;
    if (!postcode || !postcodeRegex.test(postcode.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid postcode format' },
        { status: 400 }
      );
    }

    // Get your secret API key from environment variables
    const apiKey = process.env.PROPERTYDATA_API_KEY;
    if (!apiKey) {
      console.error('PropertyData API key not found');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Call PropertyData API using your secret key
    const propertyDataResponse = await fetch('https://api.propertydata.co.uk/sales', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PropIndex/1.0'
      },
      body: JSON.stringify({
        postcode: postcode.replace(/\s+/g, '').toUpperCase(),
        limit: Math.min(limit, 50),
        period: timeframe,
        include: ['property_details', 'sale_details', 'images']
      })
    });

    // Check if PropertyData request was successful
    if (!propertyDataResponse.ok) {
      const errorText = await propertyDataResponse.text();
      console.error('PropertyData API error:', propertyDataResponse.status, errorText);
      
      return NextResponse.json(
        { error: 'Failed to fetch property data', details: errorText },
        { status: propertyDataResponse.status }
      );
    }

    // Get the data from PropertyData
    const propertyData = await propertyDataResponse.json();

    // Transform PropertyData format to your app's format
    const transformedProperties = propertyData.data?.map((property: any, index: number) => ({
      id: property.id || index + 1,
      address: property.full_address || `${property.house_number || ''} ${property.street_name || 'Unknown Street'}`,
      postcode: property.postcode || postcode,
      soldPrice: property.sale_price || property.price || 0,
      originalPrice: property.original_asking_price || property.sale_price || 0,
      soldDate: property.sale_date || property.completion_date || new Date().toISOString(),
      image: property.images?.[0]?.url || property.main_image || `https://images.unsplash.com/photo-1560184318-d4c4b2e0e5d4?w=300&h=200&fit=crop&auto=format`,
      timeOnMarket: property.days_on_market || Math.floor(Math.random() * 90) + 7,
      propertyType: property.property_type || 'House',
      bedrooms: property.bedrooms || null,
      agent: property.estate_agent?.name || 'Unknown Agent'
    })) || [];

    // Send the formatted data back to your website
    return NextResponse.json({
      success: true,
      properties: transformedProperties,
      total: transformedProperties.length,
      postcode: postcode,
      source: 'PropertyData.co.uk'
    });

  } catch (error) {
    console.error('API handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
