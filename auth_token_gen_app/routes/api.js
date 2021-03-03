var express      = require('express');

var Router       = require('express-promise-router');
var bodyParser   = require('body-parser');

var js2xmlparser = require( 'js2xmlparser' );

var textParser = bodyParser.text({type : "application/xml"});

const router = new Router();

var utils = require('../utils');
const request = require('request');
var db = require('../db');


let req_types = {
    'xml' : 'application/xml',
    'json' : 'application/json'
}

let sos_service = "" // add your (direct) sos server url here

/*
 * utility function to check whether response should be in XML or not
 */
function isReqXml( req ) {
	let headers = req.headers;
	return ( 'content-type' in headers
			 && ( headers['content-type'].includes( 'xml' ) ||
				  headers['content-type'].includes( 'XML' )));
}

function formatResponse( reply, isXml ) {

	if ( isXml ) {
		reply = js2xmlparser.parse("response", reply);		
	}
	return reply;
}

router.get('/status', function(req,res,next){

    res.send({status: "System Online"})

});

router.get('/get_sensor_info/:sensor_id', async function(req,res,next){

    // the func returns information about the sensor & its current modes 
    // such as, sensor_enabled, current_sample_rate etc
    // NOT IMPLIMENTED YET
    console.log('and this matches too');
    res.end();

});

router.post('/set_sensor_info/:sensor_id', async function(req,res,next){

    // place holder for getting new sensor info 
    // NOT IMPLIMENTED YET
    console.log('and this matches too');
    res.end();

});


/* GET generate new token and store sensor information against it, once user has been authenticated. */
router.get('/get_token/:sensor_name/:user/:password', async function(req, response, next) {
    let username = req.params['user'];
    let password = req.params['password'];
    let sensor_name = req.params['sensor_name'];
    let token = "";

	var isXmlReply = isReqXml( req );
	
    // here i test teh user/password combo and if they are suitable i generate a token for the new device. 
    // should this method tae the device info and add to SOS or should the first key token use be to register the sensor
    var res = await db.isUserValid(username,password);

	let reply = { status: "error", message: "Invalid query" };
	
    if(res.rows.length===1){
        token = utils.gen_key();
        var res = await db.isKeyUsed(token);
        while(res.rowCount > 0){
            token = utils.gen_key();
            res = await db.isKeyUsed(token);
        }


        var res = await db.addSensorToDB(sensor_name)
        var sensor_id = res.rows[0].id;
        
        var res = await db.addKeyToDB(token,username,sensor_id);
        var access_token = res.rows[0].token

		reply  = {status: "success", username: username ,token: token, sensor_id : sensor_id};
    }
    else {
        response.status(401);
        reply = {status: "failed", message: "User Not Authorised!"};
    }
	reply = formatResponse( reply, isXmlReply );
    response.send(reply);
	
});

// this will probably be removed as it is just used for testing, operational will use the POST version
router.get('/sos_proxy/:key/:sos_query', async function(req,res,next){
    let key = req.params['key'];
    let sos_query = req.params['sos_query'];

    // simple flow is, test key is a valid key. 
    // if it is then proxy SOS request to the SOS using internal IP so it will be allowed
    // if not return a sensible error code/message

    var resp = await db.isKeyValid(key);
    if(resp.rows.length == 1){

        res.send({status : "success"});
    }
    else {
        res.status(401);
        res.send({status: "No User Authorised!"})
    }



});


// the main guts of the proxy, tests if we have been provided with a valid token/key
// then proxies the SOS request if we do. if not the user is sent an error message
router.post('/sos_proxy/:key/:type/:sos_query', textParser, async function(req,res,next){
    let key = req.params['key'];
    let sos_query = req.params['sos_query'];
    let req_type = req.params['type']
    let _body = req.body;

    // simple flow is, test key is a valid key. 
    // if it is then proxy SOS request to the SOS using internal IP so it will be allowed
    // if not return a sensible error code/message
	var reply = { status: "Error", message: "Invalid query" };

    var resp = await db.isKeyValid(key);

    if(resp.rows.length == 1){
        if(req_type==="json"){
            request.post({
                url : sos_service,
                json: _body,
                headers: {'Content-Type': 'application/json'}
            }, function(err,httpResponse,body){
                if(err){
                    reply = { status: "Error", message: err};
                } else {
					reply = body;
				}
				res.send(body);
            })
        }
        if(req_type==="xml"){
            request.post({
                url : sos_service,
                body: _body,
                headers: {'Content-Type': 'application/xml'}
            }, function(err,httpResponse,body){
                if(err){
                    reply = { status: "Error", message: err};
					reply = formatResponse( reply, true );
                } else {
					// @todo probably return this as something more helpful
					if ( !body ) {
						body = ""
					}
					// we got some xml (hopefully) from the sos server lets just give it to them
					reply = body;
				}
				res.send( reply );
            })
        }
    }
    else {
        res.status(401);
        reply = {status: "failed", message: "No User Authorised!"}
		reply = formatResponse( reply, (req_type=="xml") )
		res.send(reply);
    }
	
});



router.get('/key_gen_test', function(req,res,next){

    let key = utils.gen_key();

    while (!utils.is_key_used(db,key)){
        utils.gen_key();
    }

    res.send({key : utils.gen_key()});


});

module.exports = router;

