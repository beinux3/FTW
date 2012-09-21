from twisted.web.server import Site
from twisted.web.resource import Resource
from twisted.web.static import File
from twisted.internet import reactor
from twisted.python import log
from twisted.web import iweb
from sys import stdout
import re, os, time, base64


SAVEDIR = 'html/uploader/'

log.startLogging(stdout)

class FormPage(Resource):

    def render_GET(self, request):
        return '<html><body>You submitted: GET </body></html>'

    def render_POST(self, request):

        ip_cli  = request.getClientIP()
        is_secure = request.isSecure()
        headers = request.getAllHeaders()
        args = request.args
        print base64.b64decode(args['message'][0])
        print base64.b64decode(args['name'][0])
        print args['part'][0]
        return '<html><body>You submitted: POST </body></html>'


if not os.path.exists(SAVEDIR):
    os.makedirs(SAVEDIR)

# Create file serve resource 
root_site = File("html/")

# Add child for upload data
root_site.putChild("upload.pgp", FormPage())
factory = Site(root_site)

# Add site to server
reactor.listenTCP(8081, factory)
reactor.run()

