/** agent that make remote calls
*
* @module @utils
*
*/

var
	request = require("superagent")
	, util = require("util")
	, url = require('url')
	, querystring = require('querystring')
	, debug	= require("debug")("request")
	, defaults  = require("101/defaults")
	;


var Agent = function(opt){

	this.options = {
		  url:  opt.url
		, headers : {
			'PRIVATE-TOKEN' : opt.token
		   ,'User-Agent': 'Gitlab-YAAC'
		}
		, method: 'GET'
		, json: true
	}

//	debug( "Gitlab Url: '%s'", this.options.url);

	if( this.options['url'].indexOf("/api/v3") === -1){
		this.options.url = url.resolve(this.options.url , "/api/v3/" );
	}

	if(opt['sudo']){
		this.options.headers["SUDO"] = opt['sudo']
	}

}

/** Start remote call
*
* @param {oject} optn : {method, path}
* @param {object} payload: payload object
* @param { requestCallback} callback : Callback
*/

Agent.prototype.dial = function( optn, payload, callback){

	var reqObj = defaults(optn, this.options);
	delete reqObj.headers;

	var args = Array.prototype.slice.call(arguments);


	if( arguments.length === 2){
		if( typeof args[1] === "function" ){
			callback = args[1];
			optn = args[0];
		}
		else{
			optn = args[1];
			callback = args[0];
		}
		payload = {};
	}

	reqObj.url = url.resolve(this.options.url, reqObj.path)

	debug("%s  %s", reqObj.method.toUpperCase(), reqObj.url);
	debug("payload: ", payload );

	debug("request fired...");
	var req = request( reqObj.method , reqObj.url);

	//attach data
	req.send( payload);

	//Set headers
	req
		.set('PRIVATE-TOKEN', this.options.headers['PRIVATE-TOKEN'])
		.set('Accept', 'application/json')
		;

	if(this.options.headers['SUDO']){
		req
		.set('SUDO', this.options.headers['SUDO'])
	}

	//Fire request
	req
		.end( function(error, response){
			if(!error){
				callback(error, response, response.body);
			}else{
				callback(error, response, null);
			}
		});
}


/** Callback
*
* @callback requestCallback
* @param {Object} error :  Error
* @param {Object} response: Reponse object
* @param { ( Object | Object[] ) } result: Result(s)
*/
module.exports = Agent;
