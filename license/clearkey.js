
/* Copyright (c) 2014, CableLabs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');

console.log("");
console.log("CableLabs ClearKey License Server");
console.log("");

keys = {
    'a1b1c1d1a2b2a3b3a4b4a5b5c5d5e5f5': new Buffer("ccc0f2b3b279926496a7f5d25da692e9", 'hex'),
    'd1c1b1a1b2a2b3a3a4b4a5b5c5d5e5f5': new Buffer("3a2a1b68dd2bd9b2eeb25e84c4776668", 'hex')
};

var options = {
    key: fs.readFileSync('security/cl_clearkey-key.pem'),
    cert: fs.readFileSync('security/cl_clearkey-cert.pem')
};

var addCORSHeaders = function(res, length) {
    res.writeHeader(200, {
        "Content-Length": length,
        "Content-Type": 'application/json',
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Methods": 'GET, PUT, POST, DELETE, OPTIONS',
        "Access-Control-Allow-Headers": 'Content-Type, Authorization, Content-Length, X-Requested-Width'});
};

https.createServer(options, function(req, res) {
    addCORSHeaders(res);
    res.end("hello world\n");

}).listen(8585);

http.createServer(function(req, res) {
    var parsed_url = url.parse(req.url, true);
    var query = parsed_url.query;

    console.log("Received key request!  Query = %j", query);

    // Validate query string
    if (query === undefined || query.keyid === undefined) {
        console.error("Illegal request!");
        res.writeHeader(400, "Illegal query string");
        res.end();
    }

    var keyIDs = [];
    if (query.keyid instanceof Array) {
        keyIDs = query.keyid;
    } else {
        keyIDs.push(query.keyid);
    }

    var keyarray = [];
    for (var i = 0; i < keyIDs.length; i++) {
        var keyID = keyIDs[i];
        if (!keys.hasOwnProperty(keyID)) {
            console.warn("KeyID %s not registered in our lookup table!", keyID);
            continue;
        }
        var keypair = {
            kid: new Buffer(keyIDs[i], 'hex').toString('base64'),
            k: keys[keyIDs[i]].toString('base64')
        };
        keyarray.push(keypair);
    }
    var response = {
        keys: keyarray
    };
    console.log("Returning key array: %j", response);
    var json_str_response = JSON.stringify(response);
    addCORSHeaders(res, json_str_response.length);
    res.write(json_str_response);
    res.end();

}).listen(8584);

