
const api = require('../server.js');

describe("Endpoint for testing api execution", function() {
    // specification code
    describe("Must return Hello when visited", function() {
        // specification for RGB to HEX converter
        it("literally just says hello", function() {
            var _hello = api.greetings('roberto');

            return _hello;

        });
         
       });
  });