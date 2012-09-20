var uploadEncryption = {

	/*
		_fragmentation_type possibile value
		_fragmentation_type = 0 ( use the fragmentation_number )
		_fragmentation_type = 1 ( use the fragmentation_delta  )
	*/
	_fragmentation_type : 0,
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
		var files = evt.dataTransfer.files; 
		var output = [];
		for (var i = 0, f; f = files[i]; i++) {
		  output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
					  f.size, ' bytes, last modified: ',
					  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
					  '</li>');		
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
	
	init: function (pub_key) {
		
		this._initPgp(pub_key);

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
	
	getPubKey: function() {
		return this._pub_key;
	},
			
};	
