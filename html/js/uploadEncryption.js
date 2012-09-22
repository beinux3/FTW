var uploadEncryption = {

	/*
		_fragmentation_type possibile value
		_fragmentation_type = 0 ( use the fragmentation_number )
		_fragmentation_type = 1 ( use the fragmentation_delta  )
	*/
	_fragmentation_type : 1,
	_fragmentation_number : 50, 
	_fragmentation_delta  : 1000,
	_label_fragmentation_number : 'Selected fragmentation by number of piece.',
	_label_fragmentation_delta : 'Selected fragmentation by max dimension of segment.',

	_post_url : 'upload.pgp',
	_internal_id_file_input : 'form_file_upload',

	setFragmentationNumber: function() {
		this._fragmentation_number	= prompt('Select fragmentation value of piece');
		this.uiWriteFragmentationConfig();
	},

	setFragmentationDelta: function() {
		this._fragmentation_number	= prompt('Select fragmentation value max dimension of piece');
		this.uiWriteFragmentationConfig();
	},
	
	uiWriteFragmentationConfig: function() {
		var _fr_value = ( this._fragmentation_type == 0 ) ? this._fragmentation_number : this._fragmentation_delta;
		var _fr_label = ( this._fragmentation_type == 0 ) ? this._label_fragmentation_number : this._label_fragmentation_delta;		
		$("#header_configinfo").html('<p>' + _fr_label + ' (' + _fr_value + ')</p>');	
	},
	
	baseRequire: function () {
		var _min_html5 = (window.File && window.FileReader && window.FileList && window.Blob) ?  true :  false;
		var _min_qjuery = (typeof jQuery == 'undefined') ?  false :  true;
		var _min_openpgp = (typeof openpgp == 'undefined') ?  false :  true;
		var _minimal_req = ( _min_html5 && _min_qjuery && _min_openpgp ) ? true : false;

		if (! _minimal_req) alert('This library require html5, jquery, openpgp.');
		return _minimal_req;
	},
	
	_handleFileSelect: function (evt) {
		evt.stopPropagation();
		evt.preventDefault();

		window.list_file_upload = [];

		up_cfg_delta = window.localStorage.getItem("up_cfg_delta");
		var delta = $.evalJSON(up_cfg_delta).delta_defrag;
		
		var files = evt.dataTransfer.files; 
		var output = [];
		for (var i = 0, f; f = files[i]; i++) {	
			
			part = parseInt(f.size / delta) ;
			part_r = parseInt(f.size % delta);
			if ( part_r > 0 ) { part = part + 1; }
			
			window.list_file_upload.push ( f );

			p = '<a href=# onclick="uploadEncryption.upload(' + i + ');">upload</a>';

			output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
					  f.size, ' bytes, last modified: ',
					  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
					  '|| Fragmentation ', part, ' file part to upload. ', p, '</li>');
		}
		$("#header_fileinfo").html('<ul>' + output.join('') + '</ul>');
	},
  
	_handleDragOver : function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	},
	
	_initPgp: function (pub_key) {
		openpgp.init();	
		this._pub_key = openpgp.read_publicKey( pub_key );
	},
	
	_initLibrary: function (pub_key) {
		_internalCfg = localStorage.getItem("up_cfg_delta");
		if (_internalCfg == null){ 
		this.librarySetConfig(); 
		}
	},
	
	librarySetConfig: function () {
		var cfg = {delta_defrag: this._fragmentation_delta, number_defrag: this._fragmentation_number, defrag_type: this._fragmentation_type };
		var encoded = $.toJSON( cfg );
		localStorage.setItem("up_cfg_delta", encoded);
	},
	
	libraryGetConfig: function () {
		internal = localStorage.getItem("up_cfg_delta");
		alert(internal);
	},
	
	init: function (pub_key) {
		
		this._initPgp(pub_key);
		this._initLibrary();		
		// init page with main container and button
		$(document.body).append('<div id="main_container" ></div>');
		$("#main_container").append('<div id="header_container" ></div>');
		$("#main_container").append('<div id="body_container" ></div>');
		
		$("#header_container").append('<div id="header_configinfo" ></div>');
		$("#header_container").append('<div id="header_fileinfo" ></div>');
		$("#body_container").html('<div id="' + this._internal_id_file_input + '">Drag and drop file</div>');

		var cssObj = { 	'border': '2px dashed #BBB',	'-moz-border-radius' : '5px', '-webkit-border-radius' : '5px','border-radius' : '5px',
						'padding' : '25px',	'text-align': 'center',	'color' : '#BBB',	}

		this.uiWriteFragmentationConfig();		
		$('#'+ this._internal_id_file_input).css(cssObj);

		// Setup the dnd listeners.
		var _dropZone = document.getElementById(this._internal_id_file_input);
		_dropZone.addEventListener('dragover', this._handleDragOver, false);
		_dropZone.addEventListener('drop', this._handleFileSelect, false);

		//$("#body_container").html('<input type="file" id="' + this._internal_id_file_input + '" />');
	},
	
	read_value: function(ids) {
		return ids;
	},

    _initFileTransfertState: function(name, size, part){      
        var arTmap = [];
        for(i=0; i<part; i++){arTmap.push('0');}
        arrTmpStr = arTmap.join(',');
		window.localStorage.setItem(btoa(name), arrTmpStr);
    },

    _updateFileTransfertState: function(name, part, status){
        /*
            File state array indicate the actual state of piece trasfert

            REMEMBER:
            part variabile indicate the part of file; in position 1 there is a first part of file,
            in the position 0 there is a last part.

        */

        file_state = window.localStorage.getItem(name);
        file_state_arr = file_state.split(','); // split array element
        really_part = (part == 0 ) ? file_state_arr.length : part ;

        state_part = (status == 'ok') ? 1 : 0; // value 0 not transfert correct
        file_state_arr[really_part-1] = state_part; // update correct transfert
        arrTmpStr = file_state_arr.join(',');

		window.localStorage.setItem(name, arrTmpStr);
    },
	
    _writePromiseMemorySend : function(_fileName,  _part){
        var _intPromise = _part + '|' + _fileName;
		window.localStorage.setItem(_intPromise, '1');
    },

    _writeConfirmMemorySend : function(_fileName,  _part , _status ){
        var _intPromise = _part + '|' + _fileName;
		window.localStorage.removeItem(_intPromise);
        this._updateFileTransfertState(_fileName, _part , _status);
    },

    upload: function(ids) {

        file = window.list_file_upload[ids];
        totalPart = this._getTotalPartFromSize(file.size);
        this._initFileTransfertState(file.name, file.size, totalPart);

        for ( i=0; i<totalPart; i++){
            this._readerPartAndSubmit(file, i);
        }
    },

    _getTotalPartFromSize : function (size){

		part = parseInt(size / this._fragmentation_delta );
		part_r = parseInt(size % this._fragmentation_delta );
		if ( part_r > 0 ) { part = part + 1; }
        return part;
    },

    _getPartInterval: function(size, part){
        // parseInt(opt_startByte) 
    fragma = this._fragmentation_delta;
    totalPart = this._getTotalPartFromSize(size);

    part = ( part >= totalPart ) ? 0 : part ; // check for impossibile value

    interval = [];
    
    interval[0] = ( part == 1 ) ? 0 : (part * fragma ) - fragma ;
    interval[0] = ( part == 0 ) ? ((totalPart-1)* fragma ) : (part * fragma ) - fragma ;

    interval[1] = ( part == 0 ) ? size : part * fragma ; // End interval

    return interval;
    },

    _readerPartAndSubmit: function(ufile, part){

        interval = this._getPartInterval(ufile.size, part);

        var start = interval[0];
        var stop = interval[1];

        var reader = new FileReader();
        var _filename = ufile.name;
        this._writePromiseMemorySend( btoa(_filename), part);

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function(evt) {
          if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            _message = window.openpgp.write_encrypted_message( window.uploadEncryption.getPubKey() ,evt.target.result  )
            _data = {"message":window.btoa(_message),"name":window.btoa(_filename),"part":part};
            window.$.post("upload.pgp", _data, function( data ) { window.uploadEncryption.callback( data ); }, 'json' );
          }
        };

        var blob = ufile.slice(start, stop + 1);
        reader.readAsBinaryString(blob);
    },

	callback: function(bk_data) {

		var _status = bk_data.status;
		var _part = bk_data.part;
		var _fileName = bk_data.name;

        this._writeConfirmMemorySend(_fileName,  _part , _status );
		return true;
	},
	
	getPubKey: function() {
		return this._pub_key;
	},
			
};	

var list_file_upload = new Array();
