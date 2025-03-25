describe('test de prueba login', () => {
  beforeEach("visit pagina para login", () => {
    cy.visit('https://demo.testim.io/')
    cy.contains("Log in").click().should("be.visible")
    cy.url().should("contain", "testim")
    //cy.contains("Log In").click()
  })

  it("hacer login existosamente", () =>{
    cy.get("[type='text']").eq(4)
      .type("Ponce")
    
      cy.get("[type='password']")
      .type("12345")
      
    cy.get("button[type='submit']")
      .click()
      
    cy.contains("Hello, John").should("be.visible")  
  })

})