Meteor.methods ({

//Allowing multiple time configuration for WOOIDC login service (via different Web observatory nodes). This is a server-side method.

        configureWooidcService: function (options) {
             var accounts = this;
             check(options, Match.ObjectIncluding({service: String}));
          
             // Don't let random users configure a service we haven't added yet (so
            // that when we do later add it, it's set up with their configuration
            // instead of ours).
            // XXX if service configuration is oauth-specific then this code should
           //     be in accounts-oauth; if it's not then the registry should be
          //     in 'accounts-base' package
          
          /*if (!(accounts.oauth
                 && _.contains(accounts.oauth.serviceNames(), options.service))) {
             throw new Meteor.Error(403, "Service unknown");
          }*/

         var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;

         if (_.has(options, "secret") && usingOAuthEncryption())
                options.secret = OAuthEncryption.seal(options.secret);

         ServiceConfiguration.configurations.upsert({service: "wooidc"}, {domain: options.domain, clientId: options.clientId, secret: options.clientSecret});

      }
});

