pipeline {
    agent any

    tools {
        // Must match the name of the NodeJS installation configured in:
        // Manage Jenkins -> Tools -> NodeJS Installations (e.g., 'NodeJS-20')
        nodejs 'NodeJS-20'
    }

    environment {
        APP_NAME = 'pern-app'
        SERVER_IMAGE = 'pern-server'
        CLIENT_IMAGE = 'pern-client'
    }

    stages {
        // =================================================================
        // STAGE 1: Backend Dependencies & Automated Tests
        // =================================================================
        stage('Backend: Test & Verify') {
            steps {
                echo '📦 Installing Server Dependencies and Running Jest Tests...'
                dir('server') {
                    script {
                        if (isUnix()) {
                            sh 'npm ci || npm install'
                            sh 'npm test'
                        } else {
                            bat 'npm ci || npm install'
                            bat 'npm test'
                        }
                    }
                }
            }
        }

        // =================================================================
        // STAGE 2: Frontend Dependencies & Production Build
        // =================================================================
        stage('Frontend: Build Production Bundle') {
            steps {
                echo '🎨 Installing Client Dependencies and Building with Vite...'
                dir('client') {
                    script {
                        if (isUnix()) {
                            sh 'npm ci || npm install'
                            sh 'npm run build'
                        } else {
                            bat 'npm ci || npm install'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        // =================================================================
        // STAGE 3: Build Docker Containers
        // =================================================================
        stage('Docker: Build Images') {
            steps {
                echo '🐳 Building Docker Containers for Server & Client...'
                script {
                    if (isUnix()) {
                        sh 'docker build -t pern-server:latest -t pern-server:${BUILD_NUMBER} ./server'
                        sh 'docker build -t pern-client:latest -t pern-client:${BUILD_NUMBER} ./client'
                    } else {
                        bat 'docker build -t pern-server:latest -t pern-server:%BUILD_NUMBER% ./server'
                        bat 'docker build -t pern-client:latest -t pern-client:%BUILD_NUMBER% ./client'
                    }
                }
            }
        }

        // =================================================================
        // STAGE 4: Deploy with Docker Compose (Only on main branch)
        // =================================================================
        stage('Deploy: Docker Compose') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying / Restarting Containers via Docker Compose...'
                script {
                    if (isUnix()) {
                        sh 'docker compose down || true'
                        sh 'docker compose up -d --build'
                    } else {
                        bat 'docker compose down || true'
                        bat 'docker compose up -d --build'
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Jenkins Build #${BUILD_NUMBER} succeeded!"
        }
        failure {
            echo "❌ Jenkins Build #${BUILD_NUMBER} failed! Check console output for details."
        }
    }
}
