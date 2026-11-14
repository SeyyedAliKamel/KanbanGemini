import urllib.request
import urllib.error
import json
import http.cookiejar

def main():
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    # 1. Unauthenticated me
    resp = opener.open('http://localhost:8000/api/auth/me')
    data = json.loads(resp.read().decode())
    print('1. Unauthenticated me:', data['authenticated'])
    assert data['authenticated'] is False

    # 2. Failed login
    req = urllib.request.Request('http://localhost:8000/api/auth/login', data=json.dumps({'username':'user','password':'wrong'}).encode(), headers={'Content-Type':'application/json'})
    try:
        opener.open(req)
        assert False, "Should have failed"
    except urllib.error.HTTPError as e:
        print('2. Failed login code:', e.code)
        assert e.code == 401

    # 3. Successful login
    req = urllib.request.Request('http://localhost:8000/api/auth/login', data=json.dumps({'username':'user','password':'password'}).encode(), headers={'Content-Type':'application/json'})
    resp = opener.open(req)
    data = json.loads(resp.read().decode())
    print('3. Successful login:', data['status'], data['user']['username'])
    assert data['status'] == 'ok'

    # 4. Authenticated me
    resp = opener.open('http://localhost:8000/api/auth/me')
    data = json.loads(resp.read().decode())
    print('4. Authenticated me:', data['authenticated'], data['user']['username'])
    assert data['authenticated'] is True

    # 5. Protected check
    resp = opener.open('http://localhost:8000/api/protected-check')
    data = json.loads(resp.read().decode())
    print('5. Protected check:', data['message'])
    assert "authorized access" in data['message']

    # 6. Logout
    req = urllib.request.Request('http://localhost:8000/api/auth/logout', data=b'', headers={'Content-Type':'application/json'})
    resp = opener.open(req)
    data = json.loads(resp.read().decode())
    print('6. Logout:', data['status'])
    assert data['status'] == 'ok'

    # 7. Post-logout protected check
    try:
        opener.open('http://localhost:8000/api/protected-check')
        assert False, "Should have failed"
    except urllib.error.HTTPError as e:
        print('7. Post-logout code:', e.code)
        assert e.code == 401

    print("ALL LIVE AUTH CHECKS PASSED SUCCESSFULLY")

if __name__ == '__main__':
    main()
