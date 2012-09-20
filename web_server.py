from twisted.web.server import Site
from twisted.web.resource import Resource
from twisted.web.static import File
from twisted.internet import reactor
from twisted.python import log
from twisted.web import iweb
from sys import stdout
import re, os, time


WEBSITE = 'http://blueimp.github.com/jQuery-File-Upload/'
MIN_FILE_SIZE = 1 # bytes
MAX_FILE_SIZE = 500 # bytes
IMAGE_TYPES = re.compile('image/(gif|p?jpeg|(x-)?png)')

ACCEPT_FILE_TYPES = IMAGE_TYPES
EXPIRATION_TIME = 300 # seconds

SAVEDIR = 'html/uploader/'

log.startLogging(stdout)

class FormPage(Resource):

    def render_GET(self, request):
        return '<html><body>You submitted: GET </body></html>'

    def render_POST(self, request):

        resp = []
        rec = {}

        ip_cli  = request.getClientIP()
        is_secure = request.isSecure()
        headers = request.getAllHeaders()
        args = request.args

        pp = request.content.readlines()

        _filename = pp[1].split('filename=')[1]
        _filename = _filename.replace('\r','').replace('\n','').replace('"','').replace(' ','_').replace("'","").replace("\\","").replace("/","")
  
        filename = '%d_%s' % ( int(time.time()), _filename )
            
        image = ''.join(request.args['files[]'])


        # Get file len
        len_file = len(image)

        # Test the file size
        if len(image) > MIN_FILE_SIZE:
            if len(image) < MAX_FILE_SIZE:
                pass
        
        dest = os.path.join(SAVEDIR, filename)
        destfile = open(dest, 'wb')
        destfile.write(image)
        destfile.close()

        p_url = '/uploader/%s' % filename
        p_thumbnail_url = ''
        p_name = filename
        p_type = 'image/png'
        p_size = len_file
        p_delete_url = ''
        p_delete_type = 'DELETE'

        r = """[{"url":"%s","thumbnail_url":"%s","name":"%s","type":"%s","size":%s,"delete_url":"%s","delete_type":"%s"}]""" % (p_url,p_thumbnail_url, p_name, p_type, p_size, p_delete_url, p_delete_type)
        return r


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

