import urllib.request
import urllib.error
import json
import http.cookiejar

def main():
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    # 1. Unauthenticated board access should return 401
    try:
        opener.open('http://localhost:8000/api/board')
        assert False, "Should fail unauthenticated"
    except urllib.error.HTTPError as e:
        print('1. Unauthenticated /api/board returned:', e.code)
        assert e.code == 401

    # 2. Login
    req = urllib.request.Request(
        'http://localhost:8000/api/auth/login',
        data=json.dumps({'username':'user','password':'password'}).encode(),
        headers={'Content-Type':'application/json'}
    )
    resp = opener.open(req)
    assert resp.code == 200
    print('2. Login successful')

    # 3. Authenticated board fetch
    resp = opener.open('http://localhost:8000/api/board')
    board = json.loads(resp.read().decode())
    print('3. Board fetched:', board['title'], 'Columns count:', len(board['columns']))
    assert len(board['columns']) == 5

    # 4. Create new column
    req = urllib.request.Request(
        'http://localhost:8000/api/board/columns',
        data=json.dumps({'title': 'Live Test Column'}).encode(),
        headers={'Content-Type':'application/json'}
    )
    resp = opener.open(req)
    new_col = json.loads(resp.read().decode())
    print('4. New column created:', new_col['id'], new_col['title'])
    assert new_col['title'] == 'Live Test Column'

    # 5. Create new card in that column
    req = urllib.request.Request(
        'http://localhost:8000/api/board/cards',
        data=json.dumps({'column_id': new_col['id'], 'title': 'Live Test Card', 'details': 'Created live'}).encode(),
        headers={'Content-Type':'application/json'}
    )
    resp = opener.open(req)
    new_card = json.loads(resp.read().decode())
    print('5. New card created:', new_card['id'], new_card['title'])

    # 6. Move card to col-1
    req = urllib.request.Request(
        f'http://localhost:8000/api/board/cards/{new_card["id"]}/move',
        data=json.dumps({'target_column_id': 'col-1', 'position': 0}).encode(),
        headers={'Content-Type':'application/json'}
    )
    resp = opener.open(req)
    assert resp.code == 200
    print('6. Card moved successfully')

    # 7. Delete card
    req = urllib.request.Request(f'http://localhost:8000/api/board/cards/{new_card["id"]}', method='DELETE')
    resp = opener.open(req)
    assert resp.code == 200
    print('7. Card deleted successfully')

    # 8. Delete column
    req = urllib.request.Request(f'http://localhost:8000/api/board/columns/{new_col["id"]}', method='DELETE')
    resp = opener.open(req)
    assert resp.code == 200
    print('8. Column deleted successfully')

    print("ALL LIVE END-TO-END BOARD API CHECKS PASSED")

if __name__ == '__main__':
    main()
