from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch
from django.utils import simplejson
from xml.dom import minidom
import re

class IndexPage(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write("""
<?DOCTYPE html>
<head>
  <title>NicoNico CommentProxy</title>
</head>
<body>
NicoNico CommentProxy
</body>
</html>
        """);        

class GetComment(webapp.RequestHandler):
    def get(self):
        ms        = self.request.get('ms')
        thread_id = self.request.get('t')
        res_from  = self.request.get('res_from', default_value="200")
        callback  = self.request.get('callback', default_value="callback")

        self.response.headers['Content-Type'] = 'application/json'

        # validate request prameters
        if not re.match(r'^[0-9a-zA-Z._\[\]]+$', callback):
            self.outputerror("invalid callback", "callback")
            return
        if not re.match(r'^http://msg.nicovideo.jp/\d+/api/$', ms):
            self.outputerror("invalid ms", callback)
            return
        if not re.match(r'^\d+$', thread_id):
            self.outputerror("invalid thread_id", callback)
            return
        if not re.match(r'^\d+$', res_from):
            self.outputerror("invalid res_from", callback)
            return

        if int(res_from) > 1000:
            res_from = "200"
        
        req_xml = '<thread res_from="-%(res_from)s" version="20061206" thread="%(thread_id)s">' %locals()
        response = urlfetch.fetch(ms, req_xml, urlfetch.POST, { "Content-Type" : "text/xml" })
        if response.status_code != 200:
            self.outputerror("cannot get comments", callback)
            return
            
        document = minidom.parseString(response.content)

        thread = {}
        thread_node = document.getElementsByTagName('thread')[0]
        for key in thread_node.attributes.keys():
            thread[key] = thread_node.attributes[key].value

        comments = []  
        chat_nodes = document.getElementsByTagName('chat')
        for node in chat_nodes:
            comment = {}
            for key in node.attributes.keys():
                comment[key] = node.attributes[key].value

            if node.firstChild != None:
                comment['content'] = node.firstChild.data
            else:
                comment['content'] = ""
            comments.append(comment)          

        json = { 'status': 'ok', 'thread': thread, 'comments': comments }
        self.response.out.write("%s(%s)" %
                                (callback, simplejson.dumps(json, ensure_ascii=False)))

    ## error
    def outputerror(self, msg, callback):
        json = { 'status': 'ng', 'message': msg }
        self.response.out.write("%s(%s)" %
                                (callback, simplejson.dumps(json, ensure_ascii=False)))

application = webapp.WSGIApplication([('/', IndexPage), 
                                      ('/getcomment', GetComment) 
                                      ],
                                     debug=False);

def main():
    run_wsgi_app(application);

if __name__ == "__main__":
    main()
