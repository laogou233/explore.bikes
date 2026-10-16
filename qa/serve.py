from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        if path.startswith('/explore.bikes/'):
            path=path[len('/explore.bikes'):]
        return super().translate_path(path)
    def send_error(self,code,message=None,explain=None):
        if code!=404:return super().send_error(code,message,explain)
        body=Path('404.html').read_bytes()
        self.send_response(404);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers()
        if self.command!='HEAD':self.wfile.write(body)
    def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8766),Handler).serve_forever()
