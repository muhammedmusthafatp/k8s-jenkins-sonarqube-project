pipeline {

    agent any

    environment {

        IMAGE_NAME = "node-demo"

        AWS_REGION = "ap-south-2"

        ACCOUNT_ID = "369602465346"

        ECR_REPO = "${ACCOUNT_ID}.dkr.ecr.ap-south-2.amazonaws.com/k8s-jenkin-repo"

    }

    stages {

        stage('Build Image') {

            steps {

                sh '''
                docker build -t $IMAGE_NAME .
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

                kubectl rollout restart deployment/node-app -n sonar-demo

                kubectl rollout status deployment/node-app -n sonar-demo

                '''

            }

        }

    }

}
