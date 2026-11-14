import json
import urllib.request
import urllib.parse
import http.cookiejar

def run_live_ai_chat_test():
    cookie_jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

    base_url = "http://localhost:8000"

    # Step 1: Login
    login_data = json.dumps({"username": "user", "password": "password"}).encode("utf-8")
    req = urllib.request.Request(
        f"{base_url}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/json"}
    )
    with opener.open(req) as resp:
        assert resp.status == 200, f"Login failed: {resp.status}"
        print("Live Login: SUCCESS")

    # Step 2: Call AI Chat endpoint with a conversational question
    chat_payload = json.dumps({
        "message": "Hello assistant! In one short sentence, how many columns do I have on this board? Please do not make any card modifications.",
        "history": []
    }).encode("utf-8")

    chat_req = urllib.request.Request(
        f"{base_url}/api/ai/chat",
        data=chat_payload,
        headers={"Content-Type": "application/json"}
    )

    with opener.open(chat_req, timeout=40) as chat_resp:
        assert chat_resp.status == 200, f"AI Chat request failed: {chat_resp.status}"
        res_data = json.loads(chat_resp.read().decode("utf-8"))
        print("Live AI Response received successfully!")
        print("Response Text:", res_data.get("response"))
        print("Actions Applied:", res_data.get("actions_applied"))
        assert "board" in res_data
        assert len(res_data["board"]["columns"]) >= 5
        print("Live Conversational AI Test: PASSED")

    # Step 3: Call AI Chat to create a card
    create_payload = json.dumps({
        "message": "Please add a new card titled 'Perimeter Firewall Sync' with details 'Calibrate inbound TCP filter rules.' into column col-1.",
        "history": []
    }).encode("utf-8")

    create_req = urllib.request.Request(
        f"{base_url}/api/ai/chat",
        data=create_payload,
        headers={"Content-Type": "application/json"}
    )

    with opener.open(create_req, timeout=40) as create_resp:
        assert create_resp.status == 200, f"AI Card Creation failed: {create_resp.status}"
        create_data = json.loads(create_resp.read().decode("utf-8"))
        print("Live Card Creation Response:", create_data.get("response"))
        print("Actions Applied:", create_data.get("actions_applied"))
        col1 = next(c for c in create_data["board"]["columns"] if c["id"] == "col-1")
        titles = [c["title"] for c in col1["cards"]]
        assert "Perimeter Firewall Sync" in titles, f"Card not found in col-1: {titles}"
        print("Live AI Card Creation Test: PASSED")

if __name__ == "__main__":
    run_live_ai_chat_test()
