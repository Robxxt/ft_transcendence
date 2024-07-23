from http.server import SimpleHTTPRequestHandler, HTTPServer
import os
import json

def do_login(handler):
    if handler.path == '/login':
        content_length = int(handler.headers['Content-Length'])
        post_data = handler.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        username = data.get('username')
        password = data.get('password')
        print(post_data, username, password)

        valid_username = 'user'
        valid_password = 'pass'

        response = {}
        if username == valid_username and password == valid_password:
            print("right")
            handler.send_response(200)
            response['message'] = 'Login successful!'
            response["Set-Cookie"] = "sessionid=foo"
        else:
            print("wrong")
            handler.send_response(401)
            response['message'] = 'Invalid credentials'

        handler.send_header('Content-Type', 'application/json')
        handler.end_headers()
        handler.wfile.write(json.dumps(response).encode('utf-8'))
        
def do_register(handler):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    data = json.loads(post_data.decode('utf-8'))
    if data["username"] == "existinguser":
        response = {"error": 1}
        handler.send_response(400)
    elif not data["username"].isalnum() or not data["password"].isalnum():
        response = {"error": 2}
        handler.send_response(400)
    else:
        response = {}
        handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_changeAvatar(handler):
    response = {}
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

def do_changePassword(handler):
    response = {'success' : 1}
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

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
    response = [{"friend" : 'Bert', 'online' : True}, {"friend" : 'Duckie', 'online' : False}]
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode('utf-8'))

class MyHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/login':
            do_login(self)
        elif self.path == '/register':
            do_register(self)
        elif self.path == '/changeAvatar':
            do_changeAvatar(self)
        elif self.path == '/changePassword':
            do_changePassword(self)
        else:
            super().do_POST()

    def do_GET(self):
        if self.path.startswith('/winLossRecord'):
            do_winLossRecord(self)
            return
        elif self.path.startswith('/gameList'):
            do_gameList(self)
            return
        elif self.path.startswith('/friendList'):
            do_friendList(self)
            return
        if not self.path.endswith(".js") and not self.path.endswith(".html"):
            self.path = "index.html"
        return super().do_GET()

    def guess_type(self, path):
        if path.endswith('.js'):
            return 'application/javascript'
        return super().guess_type(path)

def run(server_class=HTTPServer, handler_class=MyHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd server on port {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
