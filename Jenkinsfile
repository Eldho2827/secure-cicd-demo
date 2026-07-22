pipeline {
  agent any
  environment {
    IMAGE = "eldho10/secure-cicd-demo"
  }
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
          '''
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Build Image') {
      steps {
        sh 'docker build -t $IMAGE:${BUILD_NUMBER} .'
      }
    }

    stage('Push Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'U', passwordVariable: 'P')]) {
          sh '''
            echo $P | docker login -u $U --password-stdin
            docker push $IMAGE:${BUILD_NUMBER}
          '''
        }
      }
    }

    stage('Deploy to Kubespray') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh '''
            sed "s#IMAGE_PLACEHOLDER#$IMAGE:${BUILD_NUMBER}#g" k8s/deployment.yaml > k8s/deployment-final.yaml
            kubectl --kubeconfig=$KUBECONFIG apply -f k8s/deployment-final.yaml
            kubectl --kubeconfig=$KUBECONFIG apply -f k8s/service.yaml
            kubectl --kubeconfig=$KUBECONFIG rollout status deployment/cicd-demo-app --timeout=120s
          '''
        }
      }
    }
  }
}