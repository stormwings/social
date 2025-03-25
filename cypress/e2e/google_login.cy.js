// cypress/e2e/google_login.spec.js

describe('Test de Login con Google', () => {
    it('El usuario debe poder iniciar sesión con su cuenta de Google y ser redirigido correctamente', () => {
      // Paso 3.1: Visitar la página de login de la aplicación
      cy.visit('https://social-two-delta.vercel.app/login');
  
      // Paso 3.2: Hacer clic en el botón "Iniciar sesión con Google"
      // Se asume que el botón cuenta con un atributo identificador (ejemplo: data-testid="google-login")
      cy.get('[data-testid="Sign in with Google"]').should('be.visible').click();
  
      // Paso 3.3: Manejar la autenticación en el dominio de Google utilizando cy.origin
      // Esto nos permite interactuar con el contenido de https://accounts.google.com
      cy.origin('https://accounts.google.com', () => {
        // Paso 3.3.1: Ingresar el correo electrónico
        cy.get('input[type="email"]')
          .should('be.visible')
          .type(Cypress.env('GOOGLE_EMAIL'));
  
        // Hacer clic en "Siguiente"
        cy.get('#identifierNext').click();
  
        // Paso 3.3.2: Ingresar la contraseña
        // Se agrega un timeout para esperar a que el campo de contraseña esté disponible
        cy.get('input[type="password"]', { timeout: 10000 })
          .should('be.visible')
          .type(Cypress.env('GOOGLE_PASSWORD'), { log: false }); // { log: false } evita que se muestre la contraseña en los logs
  
        // Hacer clic en "Siguiente"
        cy.get('#passwordNext').click();
      });
  
      // Paso 3.4: Verificar que la aplicación redirige correctamente tras el login exitoso.
      // Se asume que, tras iniciar sesión, el usuario es redirigido a una ruta que contiene "/dashboard"
      cy.url({ timeout: 20000 }).should('include', '/dashboard');
  
      // Paso 3.5: Validar que un elemento único de la página de destino (por ejemplo, un saludo) esté visible
      cy.contains('Bienvenido').should('be.visible');
    });
  });
  