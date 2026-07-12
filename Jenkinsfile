pipeline {

    agent any

    environment {

        IMAGE_NAME = "node-demo"
        AWS_REGION = "ap-south-2"
        ACCOUNT_ID = "369602465346"
        ECR_REPO = "${ACCOUNT_ID}.dkr.ecr.ap-south-2.amazonaws.com/k8s-jenkin-repo"

    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
           steps {
               sh '''
               npm install
            '''
          }
      }
        stage('Gitleaks Secret Detection') {
            steps {
                sh '''
                gitleaks detect --source . --verbose
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {

                        sh """
                        ${scannerHome}/bin/sonar-scanner
                        """

                    }
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

        stage('OWASP Dependency Check') {
    steps {

        sh '''
        /opt/dependency-check/bin/dependency-check.sh \
        --project NodeApp \
        --scan . \
        --format XML \
        --format HTML \
        --out . \
        --failOnCVSS 7 \
        --noupdate
        '''

        dependencyCheckPublisher pattern: 'dependency-check-report.xml'
    }
}

        stage('Build Image') {

            steps {

                sh '''
                docker build -t $IMAGE_NAME .
                '''

            }

        }

       stage('Trivy Image Scan') {
    steps {
        sh '''
        trivy image --severity HIGH,CRITICAL $IMAGE_NAME
        '''
    }
}

        stage('Login ECR') {

            steps {

                sh '''
                aws ecr get-login-password --region $AWS_REGION \
                | docker login \
                --username AWS \
                --password-stdin $ACCOUNT_ID.dkr.ecr.ap-south-2.amazonaws.com
                '''

            }

        }

        stage('Push Image') {

            steps {

                sh '''

                docker tag $IMAGE_NAME:latest $ECR_REPO:${BUILD_NUMBER}

                docker push $ECR_REPO:${BUILD_NUMBER}

                '''

            }

        }

        stage('Deploy Kubernetes') {

            steps {

                sh '''

                kubectl apply -f k8s/namespace.yml

                kubectl apply -f k8s/deployment.yml

                kubectl apply -f k8s/service.yml

                kubectl set image deployment/node-app \
                node-app=$ECR_REPO:${BUILD_NUMBER} \
                -n sonar-demo
                kubectl rollout restart deployment/node-app -n sonar-demo
                kubectl rollout status deployment/node-app -n sonar-demo

                '''

            }

        }

    }
}
