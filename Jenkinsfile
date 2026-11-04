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
      choices: ['smoke', 'orangehrm', 'sanity', 'regression', 'e2e', 'all'],
      description: 'Playwright tests to run. Scheduled builds use Smoke.'
    )
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout and install') {
      steps {
        checkout scm
        script {
          if (isUnix()) {
            sh 'node --version && npm --version && npm ci && npx playwright install --with-deps chromium'
          } else {
            bat 'node --version && npm --version && npm ci && npx playwright install chromium'
          }
        }
      }
    }

    stage('Run Playwright tests') {
      steps {
        script {
          def suiteArgs
          switch (params.SUITE) {
            case 'smoke':
              suiteArgs = '--grep @Smoke'
              break
            case 'orangehrm':
              suiteArgs = 'tests/orangehrm/orangehrm.spec.ts'
              break
            case 'sanity':
              suiteArgs = '--grep @Sanity'
              break
            case 'regression':
              suiteArgs = '--grep @Regression'
              break
            case 'e2e':
              suiteArgs = '--grep @EndToEnd'
              break
            case 'all':
              suiteArgs = ''
              break
            default:
              error("Unsupported suite: ${params.SUITE}")
          }

          def testCommand = isUnix()
            ? "xvfb-run --auto-servernum npx playwright test ${suiteArgs} --project=chromium"
            : "npx playwright test ${suiteArgs} --project=chromium"

          if (params.SUITE == 'orangehrm') {
            if (isUnix()) {
              sh testCommand
            } else {
              bat testCommand
            }
          } else {
            def credentials = [
              string(credentialsId: 'policycenter-url', variable: 'POLICYCENTER_URL')
            ]

            if (!['smoke', 'sanity'].contains(params.SUITE)) {
              credentials.addAll([
                usernamePassword(
                  credentialsId: 'policycenter-credentials',
                  usernameVariable: 'POLICYCENTER_USERNAME',
                  passwordVariable: 'POLICYCENTER_PASSWORD'
                ),
                string(credentialsId: 'policycenter-test-company', variable: 'POLICYCENTER_TEST_COMPANY'),
                string(credentialsId: 'policycenter-test-account-number', variable: 'POLICYCENTER_TEST_ACCOUNT_NUMBER')
              ])
            }

            withCredentials(credentials) {
              if (isUnix()) {
                sh testCommand
              } else {
                bat testCommand
              }
            }
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**/*,test-results/**/*', allowEmptyArchive: true
    }
  }
}
