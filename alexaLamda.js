/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.


exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

        console.log('intentName:' + intentName);
        console.log('intent:' + intent);

    // Dispatch to your skill's intent handlers
    if ("TakeMeIntent" === intentName) {
        callTakeMeCommand(intent, session, callback);
    }
    else if ("WhereAmIIntent" === intentName) {
        getLocationFromSession(intent, session, callback);
    }
    else if ("TakeMe" === intentName) {
        console.log('0');
        callTakeMeCommand(intent, session, callback);
    }
    else if ("WeatherIntent" === intentName) {
        console.log('W0');
        callWeatherCommand(intent, session, callback);
    }
    else if ("Weather" === intentName) {
        console.log('W0');
        callWeatherCommand(intent, session, callback);
    }
    else if ("WhereAmI" === intentName) {
        getLocationFromSession(intent, session, callback);
    }
    else if ("GetLocation" === intentName) {
        getLocationFromSession(intent, session, callback);
    }
    else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    }
    else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    }
    else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to Mars. " +
        "Interact with the environment by saying commands like take me to mars, take me to the I S S, take me home, etc?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please interact by saying commands like take me to mars, take me to the I S S, take me home, etc?";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Thanks for visiting!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * Calls our API with the Take Me to command
 */
function callTakeMeCommand(intent, session, callback) {
    var cardTitle = intent.name;
    var takeMeSlot = intent.slots.location;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    console.log(1);
    console.log(JSON.stringify(intent));

    if (takeMeSlot) {
        var location = takeMeSlot.value;
    console.log(2);

    console.log(location);
        sessionAttributes = createLocationAttributes(location);
        speechOutput = "Transporting you to " + location;
        repromptText = "You can interact by saying commands like take me to mars, take me to the I S S, take me home, where am I, etc?";

        //TODO add API call here
        var http = require('http');

        var post_data = JSON.stringify({
            intent: 'takeMe',
            location: location
        });

        var post_options = {
              host: 'suiteport.mybluemix.net',
              port: '80',
              path: '/alexa/request',
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(post_data)
              }
          };

        var post_req = http.request(post_options, function(res) {
              res.setEncoding('utf8');
              res.on('data', function (chunk) {
                  console.log('API Response: ' + chunk);

                    session.attributes.location = location;

                    callback(sessionAttributes,
                         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
              });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();


    }

}

/**
 * Calls our API with the Weather to command
 */
function callWeatherCommand(intent, session, callback) {
    var cardTitle = intent.name;
    var takeMeSlot = intent.slots.location;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    console.log('w1');
    console.log(JSON.stringify(intent));

    if (true) { //not used anymore

        if (session.attributes.location) {
            location = session.attributes.location;
        }
        else {
            session.attributes.location = 'home';
            location = 'home';
        }
    console.log('w2');

    console.log(location);
        sessionAttributes = createLocationAttributes(location);
        speechOutput = "Loading weather data for " + location + " into your hud";
        repromptText = "You can interact by saying commands like take me to mars, take me to the I S S, take me home, where am I, whats the weather like here, etc?";

        //TODO add API call here
        var http = require('http');

        var post_data = JSON.stringify({
            intent: 'weather',
            location: location
        });

        var post_options = {
              host: 'suiteport.mybluemix.net',
              port: '80',
              path: '/alexa/request',
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(post_data)
              }
          };

        var post_req = http.request(post_options, function(res) {
              res.setEncoding('utf8');
              res.on('data', function (chunk) {
                  console.log('WAPI Response: ' + chunk);

                    callback(sessionAttributes,
                         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
              });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();


    }

}

function createLocationAttributes(location) {
    return {
        location: location
    };
}

function getLocationFromSession(intent, session, callback) {
    var favoriteColor;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (session.attributes) {
        location = session.attributes.location;
    }

    if (location) {
        speechOutput = "You're currently located at " + location;
        shouldEndSession = true;
    } else {
        speechOutput = "You're currently home.";
    }

    console.log('speechOutput: ' + speechOutput);

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}