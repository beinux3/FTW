from twisted.web.server import Site
from twisted.web.resource import Resource
from twisted.web.static import File
from twisted.internet import reactor
from twisted.python import log
from twisted.web import iweb
from sys import stdout
import json
import re, os, time, base64


SAVEDIR = 'html/uploader/'

log.startLogging(stdout)

class FormPage(Resource):

    def render_GET(self, request):
        return "{'status':'ok'}"

    def render_POST(self, request):

        ip_cli  = request.getClientIP()
        is_secure = request.isSecure()
        headers = request.getAllHeaders()
        args = request.args

        message = base64.b64decode(args['message'][0])
        name = base64.b64decode(args['name'][0])
        part = args['part'][0]
        
        OUT_FILE_DIR = SAVEDIR + '/' + args['name'][0]

        if not os.path.exists(OUT_FILE_DIR):
            os.makedirs(OUT_FILE_DIR)

        file_out_name = '%s/%s.%s.pgp' % (OUT_FILE_DIR, part, name )
        ofile = open(file_out_name, "w")
        ofile.writelines(message)
        ofile.close()

        responseCollector = {'status':'ok', 'name': args['name'][0] ,'part': args['part'][0] }

        request.setHeader("content-type", "application/json")
        return json.dumps(responseCollector)
        #return "{status:'ok', name:'%s',part:'%s' }" % ( args['name'][0], args['part'][0])


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

