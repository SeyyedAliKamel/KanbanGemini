import sys
from backend.app.services.ai_service import smoke_test_openrouter, get_api_key

def main():
    key = get_api_key()
    if not key:
        print("FAIL: OPENROUTER_API_KEY is not configured in .env")
        sys.exit(1)

    print("Executing OpenRouter Smoke Test (2+2)...")
    try:
        response = smoke_test_openrouter()
        print(f"OpenRouter Smoke Test Response: {response.strip()}")
        if "4" in response:
            print("SMOKE TEST SUCCESS: Valid response received from OpenRouter.")
            sys.exit(0)
        else:
            print("WARNING: Response did not contain 4, but API connection succeeded.")
            sys.exit(0)
    except Exception as e:
        print(f"SMOKE TEST FAILED: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
