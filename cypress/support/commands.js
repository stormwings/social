// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


// cypress/support/commands.js

// In cypress/support/commands.js

/*Cypress.Commands.add('login', (username, password) => {
    cy.visit('/login')
  
    cy.get('input[name=username]').type(username)
  
    // {enter} causes the form to submit
    cy.get('input[name=password]').type(`${password}{enter}`, { log: false })
  
    // we should be redirected to /dashboard
    cy.url().should('include', '/dashboard')
  
    // our auth cookie should be present
    cy.getCookie('your-session-cookie').should('exist')
  
    // UI should reflect this user being logged in
    cy.get('h1').should('contain', username)
  })
  
  // In your spec file
  
  it('does something on a secured page', function () {
    const { username, password } = this.currentUser
    cy.login(username, password)
  
    // ...rest of test
  })*/

    import 'cypress-social-logins';
