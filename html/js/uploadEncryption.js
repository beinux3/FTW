var uploadEncryption = {

	_fragmentation_number : 50, 
	_fragmentation_delta : 1000,
	_post_url : 'upload.pgp',
	
	_internal_id_file_input : 'form_file_upload',
	_internal_value_file_input : 'Selezioun file',

    _ckhtml5: function () {
	
		// Check for the various File API support.
		return (window.File && window.FileReader && window.FileList && window.Blob) ?  true :  false;
        

    },
	
	_ckqjuery: function () {
	
	    return (typeof jQuery == 'undefined') ?  false :  true;

	},

	_ckopenpgp: function () {
	
	    return (typeof openpgp == 'undefined') ?  false :  true;

	},
	
	baseRequire: function () {
	
		var _min_html5 = this._ckhtml5();
		var _min_qjuery = this._ckqjuery();
		var _min_openpgp = this._ckopenpgp();
	
		if  ( _min_html5 && _min_qjuery && _min_openpgp )
		{
			return true;
		}
		else
		{
			alert('Sono richieste le seguenti risorse supporto html5, jquery, openpgp.');
			return false;
		}
	},
	
	
	_initPgp: function (pub_key) {
	
		openpgp.init();	
		this._pub_key = openpgp.read_publicKey( pub_key );
		
    },
	
    init: function (pub_key) {
			
		this._initPgp(pub_key);
		
		// init page with main container and button
		$(document.body).append('<div id="main_container" ></div>');
		$("#main_container").html('<div id="header_container" ></div>');
		$("#main_container").html('<div id="body_container" ></div>');
		
		$("#body_container").html('<input type="file" id="' + this._internal_id_file_input + '" value="' + this._internal_value_file_input + '" />');
    },
	
	read_value: function(ids) {
		return ids;
	},
	
	getPubKey: function() {
		return this._pub_key;
	},
		
};	
