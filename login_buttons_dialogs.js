// for convenience
var loginButtonsSession = Accounts._loginButtonsSession;

// since we don't want to pass around the callback that we get from our event
// handlers, we just make it a variable for the whole file
var doneCallback;

Accounts.onResetPasswordLink(function (token, done) {
  loginButtonsSession.set("resetPasswordToken", token);
  doneCallback = done;
});

Accounts.onEnrollmentLink(function (token, done) {
  loginButtonsSession.set("enrollAccountToken", token);
  doneCallback = done;
});

Accounts.onEmailVerificationLink(function (token, done) {
  Accounts.verifyEmail(token, function (error) {
    if (! error) {
      loginButtonsSession.set('justVerifiedEmail', true);
    }

    done();
    // XXX show something if there was an error.
  });
});


//
// woresetPasswordDialog template
//

//Global helper to be used to compare OpenID connect providers so as to render the configuration template accordingly.
Template.registerHelper('equals', function(a, b) {

   return a === b;
});

Template._woresetPasswordDialog.events({
  'click #login-buttons-reset-password-button': function () {
    resetPassword();
  },
  'keypress #reset-password-new-password': function (event) {
    if (event.keyCode === 13)
      resetPassword();
  },
  'click #login-buttons-cancel-reset-password': function () {
    loginButtonsSession.set('resetPasswordToken', null);
    if (doneCallback)
      doneCallback();
  }
});

var resetPassword = function () {
  loginButtonsSession.resetMessages();
  var newPassword = document.getElementById('reset-password-new-password').value;
  if (!validatePassword(newPassword))
    return;

  Accounts.resetPassword(
    loginButtonsSession.get('resetPasswordToken'), newPassword,
    function (error) {
      if (error) {
        loginButtonsSession.errorMessage(error.reason || "Unknown error");
      } else {
        loginButtonsSession.set('resetPasswordToken', null);
        loginButtonsSession.set('justResetPassword', true);
        if (doneCallback)
          doneCallback();
      }
    });
};

Template._woresetPasswordDialog.helpers({
  inResetPasswordFlow: function () {
    return loginButtonsSession.get('resetPasswordToken');
  }
});

//
// wojustResetPasswordDialog template
//

Template._wojustResetPasswordDialog.events({
  'click #just-verified-dismiss-button': function () {
    loginButtonsSession.set('justResetPassword', false);
  }
});

Template._wojustResetPasswordDialog.helpers({
  visible: function () {
    return loginButtonsSession.get('justResetPassword');
  },
  displayName: displayName
});



//
// woenrollAccountDialog template
//

Template._woenrollAccountDialog.events({
  'click #login-buttons-enroll-account-button': function () {
    enrollAccount();
  },
  'keypress #enroll-account-password': function (event) {
    if (event.keyCode === 13)
      enrollAccount();
  },
  'click #login-buttons-cancel-enroll-account': function () {
    loginButtonsSession.set('enrollAccountToken', null);
    if (doneCallback)
      doneCallback();
  }
});

var enrollAccount = function () {
  loginButtonsSession.resetMessages();
  var password = document.getElementById('enroll-account-password').value;
  if (!validatePassword(password))
    return;

  Accounts.resetPassword(
    loginButtonsSession.get('enrollAccountToken'), password,
    function (error) {
      if (error) {
        loginButtonsSession.errorMessage(error.reason || "Unknown error");
      } else {
        loginButtonsSession.set('enrollAccountToken', null);
        if (doneCallback)
          doneCallback();
      }
    });
};

Template._woenrollAccountDialog.helpers({
  inEnrollAccountFlow: function () {
    return loginButtonsSession.get('enrollAccountToken');
  }
});


//
// wojustVerifiedEmailDialog template
//

Template._wojustVerifiedEmailDialog.events({
  'click #just-verified-dismiss-button': function () {
    loginButtonsSession.set('justVerifiedEmail', false);
  }
});

Template._wojustVerifiedEmailDialog.helpers({
  visible: function () {
    return loginButtonsSession.get('justVerifiedEmail');
  },
  displayName: displayName
});


//
// loginButtonsWoMessagesDialog template
//

Template._loginButtonsWoMessagesDialog.events({
  'click #messages-dialog-dismiss-button': function () {
    loginButtonsSession.resetMessages();
  }
});

Template._loginButtonsWoMessagesDialog.helpers({
  visible: function () {
    var hasMessage = loginButtonsSession.get('infoMessage') || loginButtonsSession.get('errorMessage');
    return !dropdown() && hasMessage;
  }
});

//
// Configure Login service Meteor method
//

//if (Meteor.isServer){

//Meteor.startup(function(){
/*Meteor.methods ({
        configureWooidcService: function (options) {
             check(options, Match.ObjectIncluding({service: String}));*/
               // Don't let random users configure a service we haven't added yet (so
              // that when we do later add it, it's set up with their configuration
             // instead of ours).
            // XXX if service configuration is oauth-specific then this code should
           //     be in accounts-oauth; if it's not then the registry should be
           //     in this package
          /*if (!(accounts.oauth
                 && _.contains(accounts.oauth.serviceNames(), options.service))) {
             throw new Meteor.Error(403, "Service unknown");
          }

         var ServiceConfiguration =
         Package['service-configuration'].ServiceConfiguration;*/
         //if (ServiceConfiguration.configurations.findOne({service: options.service}))
         //       throw new Meteor.Error(403, "Service " + options.service + " already configured");

         /*if (_.has(options, "secret") && usingOAuthEncryption())
                options.secret = OAuthEncryption.seal(options.secret);

         ServiceConfiguration.configurations.insert(options);

      }
});*/
//});
//}

//
// woconfigureLoginServiceDialog template
//

Template._woconfigureLoginServiceDialog.events({
  'click .configure-login-service-dismiss-button': function () {
    loginButtonsSession.set('configureLoginServiceDialogVisible', false);
  },
  'click #configure-login-service-dialog-save-configuration': function () {
    if (loginButtonsSession.get('configureLoginServiceDialogVisible') &&
        ! loginButtonsSession.get('configureLoginServiceDialogSaveDisabled')) {
      // Prepare the configuration document for this login service
      var serviceName = loginButtonsSession.get('configureLoginServiceDialogServiceName');
      var configuration = {
        service: serviceName
      };

      // Fetch the value of each input field
      _.each(configurationFields(), function(field) {
        configuration[field.property] = document.getElementById(
          'configure-login-service-dialog-' + field.property).value
          .replace(/^\s*|\s*$/g, ""); // trim() doesnt work on IE8;
        
     
      });

      configuration.loginStyle =
        $('#configure-login-service-dialog input[name="loginStyle"]:checked')
        .val();

      // Configure this login service based on which service it is

      if (serviceName == "wooidc")
      {
          console.log("Service Wooidc configuration clicked.");
          Meteor.call("configureWooidcService", configuration, function (error, result) {
          if (error){
            console.log("Error configuring service " + serviceName);
            Meteor._debug("Error configuring login service " + serviceName,
                          error);}
          else{
            loginButtonsSession.set('configureLoginServiceDialogVisible',
                                    true);

            //Reset the value of each field for configuring another Web observatory node.
            _.each(configurationFields(), function(field) {
                  configuration[field.property] = document.getElementById('configure-login-service-dialog-' + field.property);
                  configuration[field.property].value = '';
              });
              }
           });
      }

      else {

           Accounts.connection.call("configureLoginService", configuration, function (error, result) {
           if (error)
              Meteor._debug("Error configuring login service " + serviceName,
                          error);
           else
              loginButtonsSession.set('configureLoginServiceDialogVisible',
                                    false);
        });
      }
    }
  },
  
    // IE8 doesn't support the 'input' event, so we'll run this on the keyup as
    // well. (Keeping the 'input' event means that this also fires when you use
    // the mouse to change the contents of the field, eg 'Cut' menu item.)
   'input, keyup input': function (event) {
    // if the event fired on one of the configuration input fields,
    // check whether we should enable the 'save configuration' button
    if (event.target.id.indexOf('configure-login-service-dialog') === 0)
      updateSaveDisabled();
  }
});

// check whether the 'save configuration' button should be enabled.
// this is a really strange way to implement this and a Forms
// Abstraction would make all of this reactive, and simpler.
var updateSaveDisabled = function () {
  var anyFieldEmpty = _.any(configurationFields(), function(field) {
    return document.getElementById(
      'configure-login-service-dialog-' + field.property).value === '';
  });

  loginButtonsSession.set('configureLoginServiceDialogSaveDisabled', anyFieldEmpty);
};

// Returns the appropriate template for this login service.  This
// template should be defined in the service's package
var configureLoginServiceDialogTemplateForService = function () {
  var serviceName = loginButtonsSession.get('configureLoginServiceDialogServiceName');
  // XXX Service providers should be able to specify their configuration
  // template name.
  return Template['configureLoginServiceDialogFor' +
                  (serviceName === 'meteor-developer' ?
                   'MeteorDeveloper' :
                   capitalize(serviceName))];
};

var configurationFields = function () {
  var template = configureLoginServiceDialogTemplateForService();
  return template.fields();
};

Template._woconfigureLoginServiceDialog.helpers({
  configurationFields: function () {
    return configurationFields();
  },
  name: function(){
        return loginButtonsSession.get('configureLoginServiceDialogServiceName');;
    },
  visible: function () {
    return loginButtonsSession.get('configureLoginServiceDialogVisible');
  },
  configurationSteps: function () {
    // renders the appropriate template
    return configureLoginServiceDialogTemplateForService();
  },
  saveDisabled: function () {
    return loginButtonsSession.get('configureLoginServiceDialogSaveDisabled');
  }
});

// XXX from http://epeli.github.com/underscore.string/lib/underscore.string.js
var capitalize = function(str){
  str = str == null ? '' : String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
};

Template._woconfigureLoginOnDesktopDialog.helpers({
  visible: function () {
    return loginButtonsSession.get('configureOnDesktopVisible');
  }
});

Template._woconfigureLoginOnDesktopDialog.events({
  'click #configure-on-desktop-dismiss-button': function () {
    loginButtonsSession.set('configureOnDesktopVisible', false);
  }
});
