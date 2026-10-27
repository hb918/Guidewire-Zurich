Feature: Create a configured commercial submission in Guidewire PolicyCenter

  As a PolicyCenter user
  I want to use a configured test account and submit commercial coverage
  So that the submission can be quoted successfully

  @Smoke @Sanity
  Scenario: PolicyCenter login page is available
    Given the user launches Guidewire PolicyCenter
    Then the PolicyCenter login page should be displayed

  @Regression @EndToEnd @Critical @Feature @CommercialProperty @ConfiguredTestAccount @NewSubmission
  Scenario: Create and quote a configured commercial submission
    Given the user launches Guidewire PolicyCenter
    And the user logs into PolicyCenter using valid credentials

    When the user navigates to "Actions" from the sidebar

    And the user selects "New Account"
    And the user searches for the configured test company
    And the user opens the configured test account
    And the user starts a new submission

    When the user selects the Zurich CH Commercial product
    And the user enters the values on the Policy Info page
    And the user completes the risk details
    And the user clicks on the Hazard & Exposure tab
    And the user clicks the Assess link
    Then the status should display Assessed
    And the user requests a quote
    And the quoted submission page displays the submission number
