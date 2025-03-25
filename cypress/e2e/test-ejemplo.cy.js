describe('Google Login Test', () => {
  
    it('Debería iniciar sesión correctamente en Google', () => {
      cy.visit('/') // Navega a la URL base
  
      // Seleccionamos el campo de correo
      cy.get('input[type="email"]').type('password@gmail.com', { delay: 100 })
  
      // Hacemos clic en el botón "Siguiente"
      cy.get('#identifierNext').click()
  
      // Esperamos que cargue el campo de contraseña
      cy.wait(3000)
      cy.get('input[type="password"]', { timeout: 10000 })//.should('be.visible')
      cy.get('input[type="password"]').type('amaterasu158')
  
      // Hacemos clic en "Siguiente" para iniciar sesión
      cy.get('#passwordNext').click()
  
      // Verificamos que se redirija correctamente
      cy.url().should('include', 'myaccount.google.com')
    })
  })
  