"""
Diagnostic script to test Foursquare API configuration.
Run this to debug authentication issues.
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_foursquare_api():
    """Test different Foursquare API authentication methods."""
    
    api_key = os.getenv("FOURSQUARE_API_KEY", "").strip()
    
    if not api_key:
        print("❌ ERROR: FOURSQUARE_API_KEY not found in .env file")
        print("   Please add: FOURSQUARE_API_KEY=your_key_here")
        return
    
    print(f"🔍 Testing Foursquare API with key: {api_key[:10]}...{api_key[-10:]}")
    print(f"📏 Key length: {len(api_key)} characters")
    print()
    
    # Test parameters
    test_url = "https://api.foursquare.com/v3/places/search"
    test_params = {
        "query": "restaurants",
        "near": "Marrakech, Morocco",
        "limit": 3
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Method 1: oauth_token parameter
        print("🧪 Method 1: Testing with oauth_token parameter...")
        try:
            response = await client.get(
                test_url,
                params={**test_params, "oauth_token": api_key},
                headers={"accept": "application/json"}
            )
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text[:100]}")
            else:
                print(f"   ✅ SUCCESS!")
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
        
        print()
        
        # Method 2: api_key parameter
        print("🧪 Method 2: Testing with api_key parameter...")
        try:
            response = await client.get(
                test_url,
                params={**test_params, "api_key": api_key},
                headers={"accept": "application/json"}
            )
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text[:100]}")
            else:
                print(f"   ✅ SUCCESS!")
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
        
        print()
        
        # Method 3: Authorization header with Bearer
        print("🧪 Method 3: Testing with Authorization: Bearer header...")
        try:
            response = await client.get(
                test_url,
                params=test_params,
                headers={
                    "accept": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
            )
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text[:100]}")
            else:
                print(f"   ✅ SUCCESS!")
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
        
        print()
        
        # Method 4: Authorization header with fsq1
        print("🧪 Method 4: Testing with Authorization: fsq1 header...")
        try:
            response = await client.get(
                test_url,
                params=test_params,
                headers={
                    "accept": "application/json",
                    "Authorization": f"fsq1 {api_key}"
                }
            )
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text[:100]}")
            else:
                print(f"   ✅ SUCCESS!")
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
    
    print()
    print("=" * 60)
    print("📋 NOTES:")
    print("- If all methods fail with 401, your API key may be invalid")
    print("- Get a valid key from: https://foursquare.com/developers/register")
    print("- Make sure you're using a Places API token, not a Venues API token")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_foursquare_api())
