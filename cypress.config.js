const { defineConfig } = require('cypress')
const { GoogleSocialLogin } = require('cypress-social-logins')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000/',
    //"GOOGLE_EMAIL": "poncedeleon42@gmail.com",
    //"GOOGLE_PASSWORD": "amaterasu158",
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      on('task', { GoogleSocialLogin });
      return config;
    }
  },
})

/*const { defineConfig } = require('cypress');
const { GoogleSocialLogin } = require('cypress-social-logins');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Registra la tarea para el login con Google
      on('task', { GoogleSocialLogin });
      return config;
    },
  },
});*/

