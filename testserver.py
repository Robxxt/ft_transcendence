from http.server import SimpleHTTPRequestHandler, HTTPServer
import os
import json

class MyHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            username = data.get('username')
            password = data.get('password')
            print(post_data, username, password)

            # Für Testzwecke, verwenden Sie fest codierte Anmeldeinformationen
            valid_username = 'user'
            valid_password = 'pass'

            response = {}
            if username == valid_username and password == valid_password:
                print("right")
                self.send_response(200)
                response['message'] = 'Login successful!'
                response["Set-Cookie"] = "sessionid=foo"
            else:
                print("wrong")
                self.send_response(401)
                response['message'] = 'Invalid credentials'

            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            super().do_POST()

    def do_GET(self):
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
