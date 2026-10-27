pipeline {
  agent any

  triggers {
    cron('H 6 * * *')
  }

  options {
    timestamps()
    timeout(time: 60, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  parameters {
    choice(
      name: 'SUITE',
      choices: ['smoke', 'sanity', 'regression', 'e2e', 'all'],
      description: 'Cucumber suite to run. Scheduled builds use the default Smoke suite.'
    )
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies and browser') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm ci'
        sh 'npx playwright install --with-deps chromium'
      }
    }

    stage('Verify PolicyCenter credentials') {
      when {
        expression { params.SUITE != 'smoke' }
      }
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'policycenter-credentials',
            usernameVariable: 'POLICYCENTER_USERNAME',
            passwordVariable: 'POLICYCENTER_PASSWORD'
          ),
          string(credentialsId: 'policycenter-test-company', variable: 'POLICYCENTER_TEST_COMPANY'),
          string(credentialsId: 'policycenter-test-account-number', variable: 'POLICYCENTER_TEST_ACCOUNT_NUMBER')
        ]) {
          sh '''
            test -n "$POLICYCENTER_USERNAME"
            test -n "$POLICYCENTER_PASSWORD"
            test -n "$POLICYCENTER_TEST_COMPANY"
            test -n "$POLICYCENTER_TEST_ACCOUNT_NUMBER"
          '''
        }
      }
    }

    stage('Verify PolicyCenter URL') {
      steps {
        withCredentials([
          string(credentialsId: 'policycenter-url', variable: 'POLICYCENTER_URL')
        ]) {
          sh 'test -n "$POLICYCENTER_URL"'
        }
      }
    }

    stage('Run Cucumber suite') {
      steps {
        script {
          if (params.SUITE == 'smoke') {
            withCredentials([
              string(credentialsId: 'policycenter-url', variable: 'POLICYCENTER_URL')
            ]) {
              sh 'npm run test:smoke'
            }
          } else {
            withCredentials([
              usernamePassword(
                credentialsId: 'policycenter-credentials',
                usernameVariable: 'POLICYCENTER_USERNAME',
                passwordVariable: 'POLICYCENTER_PASSWORD'
              ),
              string(credentialsId: 'policycenter-test-company', variable: 'POLICYCENTER_TEST_COMPANY'),
              string(credentialsId: 'policycenter-test-account-number', variable: 'POLICYCENTER_TEST_ACCOUNT_NUMBER'),
              string(credentialsId: 'policycenter-url', variable: 'POLICYCENTER_URL')
            ]) {
              switch (params.SUITE) {
                case 'sanity':
                  sh 'npm run test:sanity'
                  break
                case 'regression':
                  sh 'npm run test:regression'
                  break
                case 'e2e':
                  sh 'npm run test:e2e'
                  break
                case 'all':
                  sh 'npm run test:bdd'
                  break
                default:
                  error("Unsupported suite: ${params.SUITE}")
              }
            }
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
    }
  }
}
