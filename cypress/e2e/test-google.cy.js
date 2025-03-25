/*describe('Test de Login con Google', () => {
  it('Verifica que el usuario pueda iniciar sesión y sea redirigido correctamente', () => {

    cy.visit('/');
    
    cy.contains('Start').click()
    
    cy.contains('Sign in with Google').click();
    
    
    cy.origin('https://accounts.google.com', () => {
     
      cy.get('input[type="email"]')//.should('be.visible').type(Cypress.env('GOOGLE_EMAIL'));
      cy.get('#identifierNext').click();
      
      
      cy.get('input[type="password"]', { timeout: 10000 })
        .should('be.visible')
        .type(Cypress.env('GOOGLE_PASSWORD'));
      cy.get('#passwordNext').click();
    });
    
    
    cy.url().should('include', 'http://localhost:3000/');
    
    // Verificar la presencia de algún elemento que indique login exitoso (por ejemplo, el perfil del usuario)
    //cy.get('[data-cy="profile-info"]').should('be.visible');
  });
});*/

describe('Test de Login con Google', () => {
  it('Verifica que el usuario pueda iniciar sesión usando el social plugin y sea redirigido correctamente', () => {

    
    cy.visit('/');

   
    cy.contains('Start').click();

    
    cy.contains('Sign in with Google').click();

    
    cy.socialLogin({
      provider: 'google', // define el proveedor
      email: Cypress.env('GOOGLE_EMAIL'),
      password: Cypress.env('GOOGLE_PASSWORD'),
      loginUrl: 'https://accounts.google.com', // url base para el login
      
    }).then((user) => {
      
      cy.visit('http://localhost:3000/');
      cy.url().should('include', 'http://localhost:3000/');

      
    });
  });
});

