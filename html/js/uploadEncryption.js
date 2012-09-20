var uploadEncryption = {

	_fragmentation_number : 50, 
	_fragmentation_delta : 1000,
	_post_url : 'upload.pgp',
	
	_internal_id_file_input : 'form_file_upload',
	
	baseRequire: function () {
	
		var _min_html5 = (window.File && window.FileReader && window.FileList && window.Blob) ?  true :  false;
		var _min_qjuery = (typeof jQuery == 'undefined') ?  false :  true;
		var _min_openpgp = (typeof openpgp == 'undefined') ?  false :  true;
	
		if  ( _min_html5 && _min_qjuery && _min_openpgp )
		{
			return true;
		}
		else
		{
			alert('This library require html5, jquery, openpgp.');
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
		
		$("#body_container").html('<input type="file" id="' + this._internal_id_file_input + '" />');
    },
	
	read_value: function(ids) {
		return ids;
	},
	
	getPubKey: function() {
		return this._pub_key;
	},
		
};	
