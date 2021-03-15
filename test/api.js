
const api = require('../server.js');

describe("Endpoint for testing the greeting function", function() {
    // specification code
    describe("Sends a hello message with a name", function() {
        // specification for RGB to HEX converter
        it("literally just says hello", function() {
            var _hello = api.greetings('roberto');

            return _hello;

        });
         
       });
  });