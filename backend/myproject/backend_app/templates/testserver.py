from http.server import SimpleHTTPRequestHandler, HTTPServer
import os
import json
import cgi

friends = ["Bert", "Duckie"]
users = {"user" : "pass"}

# POST functions

def do_login(handler):
    if handler.path == '/login':
        content_length = int(handler.headers['Content-Length'])
        post_data = handler.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        username = data["username"]
        password = data["password"]

        response = {}
        if username in users and password == users[username]:
            handler.send_response(200)
            response["Set-Cookie"] = "sessionid=foo"
        else:
            handler.send_response(401)

        handler.send_header("Set-Cookie", "cookie=foo; Path=/; HttpOnly")
        handler.send_header('Content-Type', 'application/json')
        handler.end_headers()
        handler.wfile.write(json.dumps(response).encode('utf-8'))
        
def do_register(handler):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    data = json.loads(post_data.decode('utf-8'))

    username = data["username"]
    password = data["password"]

    if username in users:
        response = {"error": 1}
        handler.send_response(400)
    elif not username.isalnum() or not password.isalnum() or len(password) < 8 or len(password) > 20:
        response = {"error": 2}
        print(data)
        handler.send_response(400)
    else:
        users[username] = password
        response = {}
        handler.send_response(200)

    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_logout(handler):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    data = json.loads(post_data.decode('utf-8'))

    print("logged out ", data["user"])

    response = {}
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_changePassword(handler):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    data = json.loads(post_data.decode('utf-8'))

    password = data["newPassword"]
    if users[data["user"]] == data["currentPassword"]:
        if len(password) < 8 or len(password) > 20:
            handler.send_response(400)
        else:
            response = {}
            handler.send_response(200)
    else:
        handler.send_response(401)

    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()

def do_changeAvatar(handler):
    # Parse the form data posted
    ctype, pdict = cgi.parse_header(handler.headers['Content-Type'])

    if ctype == 'multipart/form-data':
        pdict['boundary'] = bytes(pdict['boundary'], "utf-8")
        content_length = int(handler.headers['Content-Length'])
        pdict['CONTENT-LENGTH'] = content_length
        
        # Parse the incoming form data
        form_data = cgi.parse_multipart(handler.rfile, pdict)

        # 'avatar' is the key used in the form data
        uploaded_file = form_data.get('avatar')
      
        if uploaded_file:
            # Save the file
            with open("static/testavatar.png", "wb") as f:
                f.write(uploaded_file[0])  # Write the file content

            handler.send_response(200)
            handler.end_headers()
            handler.wfile.write(b"File uploaded successfully!")
        else:
            handler.send_response(400)
            handler.end_headers()
            handler.wfile.write(b"No file uploaded.")
    else:
        handler.send_response(400)
        handler.end_headers()
        handler.wfile.write(b"Invalid Content-Type. Expected multipart/form-data.")

def do_addFriend(handler):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    data = json.loads(post_data.decode('utf-8'))
    friends.append(data["friend"])
    print(friends)
    response = {}
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_removeFriend(handler):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    data = json.loads(post_data.decode('utf-8'))
    friends.remove(data["friend"])
    print(friends)
    response = {}
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

# GET functions

def do_getAvatar(handler):
    with open('static/testavatar.png', 'rb') as f:
        imagedata = f.read()
    handler.send_response(200)
    handler.send_header('Content-Type', 'image/png')
    handler.send_header('Content-Length', len(imagedata))
    handler.end_headers()
    handler.wfile.write(imagedata)

def do_winLossRecord(handler):
    response = {'wins': '10', 'losses': '5'}
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_gameList(handler):
    response = [{'date' : '01-01-1970', 'time' : '10:06', 'player1' : 'Ernie', 'player2' : 'Bert', 'result' : '2:0', 'winner' : 'Ernie'},
    {'date' : '01-01-1970', 'time' : '10:07', 'player1' : 'Ernie', 'player2' : 'Duckie', 'result' : '2:10', 'winner' : 'Duckie'}]
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_friendList(handler):
    response = [{"friend" : friend, "online" : True} for friend in friends]
    response[-1]["online"] = False
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_userList(handler):
    response = ["user", "Bert", "Duckie", "aaa", "bbb"]
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_getDisplayName(handler):
    response = {"displayName" : "awesomeUser99"}
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

# PATCH functions

def do_setDisplayName(handler):
    content_length = int(handler.headers['Content-Length'])
    body = handler.rfile.read(content_length)
    
    handler.send_response(200)
    handler.send_header('Content-type', 'application/json')
    handler.end_headers()
    
class MyHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/login':
            do_login(self)
        elif self.path == '/register':
            do_register(self)
        elif self.path == '/logout':
            do_logout(self)
        elif self.path == '/changePassword':
            do_changePassword(self)
        elif self.path == '/changeAvatar':
            do_changeAvatar(self)
        elif self.path == '/setDisplayName':
            do_setDisplayName(self)
        elif self.path == '/addFriend':
            do_addFriend(self)
        elif self.path == '/removeFriend':
            do_removeFriend(self)
        else:
            super().do_POST()

    def do_GET(self):
        if self.path.startswith('/getAvatar'):
            do_getAvatar(self)
            return 
        elif self.path.startswith('/winLossRecord'):
            do_winLossRecord(self)
            return
        elif self.path.startswith('/gameList'):
            do_gameList(self)
            return
        elif self.path.startswith('/friendList'):
            do_friendList(self)
            return
        elif self.path.startswith('/userList'):
            do_userList(self)
            return
        elif self.path.startswith('/getDisplayName'):
            do_getDisplayName(self)
            return
        if not self.path.endswith(".js") and not self.path.endswith(".html") and not self.path.endswith(".jpeg") and not self.path.endswith(".png") and not self.path.endswith(".css"):
            self.path = "index.html"
        return super().do_GET()

    def do_PATCH(self):
        if self.path.startswith("/setDisplayName"):
            do_setDisplayName(self)
            return
        return super().do_PATCH()

    def guess_type(self, path):
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.jpeg'):
            return 'image/jpeg'
        return super().guess_type(path)

def run(server_class=HTTPServer, handler_class=MyHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd server on port {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
