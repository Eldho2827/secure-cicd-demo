pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube-server') {
   sh '''
  docker run --rm -u $(id -u):$(id -g) -e SONAR_USER_HOME=/usr/src/.sonar -v $(pwd):/usr/src sonarsource/sonar-scanner-cli \
    -Dsonar.projectKey=cicd-demo-app \
    -Dsonar.sources=. \
    -Dsonar.exclusions=**/node_modules/**,**/*.md \
    -Dsonar.javascript.node.maxspace=256 \
    -Dsonar.working.directory=.scannerwork \
    -Dsonar.host.url=$SONAR_HOST_URL \
    -Dsonar.token=$SONAR_AUTH_TOKEN
'''       }
      }
    }
    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }
}