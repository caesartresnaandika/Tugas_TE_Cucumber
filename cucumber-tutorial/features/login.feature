Feature: Sauce Demo E-commerce Functionality

  As a user of Sauce Demo
  I want to be able to interact with the site
  So that I can test its core features

  Background:
    Given the user is on the login page

  Scenario: Failed login with invalid credential
    When the user attempts login with invalid credentials
    Then the user should see a failed message

  Scenario: Successfully adding an item to cart
    Given the user logs in successfully
    When the user adds the first item to cart
    Then the item should appear in the cart

  Scenario: Successfully removing an item from cart
    Given the user logs in successfully
    And the user has an item in the cart
    When the user removes the item from cart
    Then the item should no longer appear in the cart

  Scenario: Successfully sorting items by price low to high
    Given the user logs in successfully
    When the user sorts items by "Price (low to high)"
    Then the first item should be the cheapest one

  Scenario: Successfully logging out from the application
    Given the user logs in successfully
    When the user logs out
    Then the user should be redirected to the login page