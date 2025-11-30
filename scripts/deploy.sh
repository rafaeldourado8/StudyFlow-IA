name: Deploy Backend to EC2

on:
  push:
    branches: [production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.EC2_SSH_KEY }}

      - name: Deploy to EC2
        run: |
          ssh -o StrictHostKeyChecking=no ubuntu@${{ secrets.EC2_HOST }} << 'EOF'
            # 1. Configurações Iniciais
            REPO_DIR=~/StudyFlow-IA
            REPO_URL="https://github.com/rafaeldourado8/StudyFlow-IA.git"

            # 2. Verifica se o repo já existe e atualiza ou clona
            if [ -d "$REPO_DIR" ]; then
              echo "📂 Repositório encontrado. Atualizando..."
              cd $REPO_DIR
              git reset --hard
              git pull origin production
            else
              echo "Clonando repositório do zero..."
              git clone $REPO_URL $REPO_DIR
              cd $REPO_DIR
            fi

            # 3. Recria o arquivo .env (CRUCIAL para o backend funcionar)
            echo "🔧 Recriando arquivo .env..."
            cat > .env << 'ENVFILE'
            SECRET_KEY=django-insecure-test-key-change-in-production
            DEBUG=0
            ALLOWED_HOSTS=localhost,127.0.0.1,backend,nginx,35.175.103.159
            POSTGRES_DB=studyflow
            POSTGRES_USER=studyflow_admin
            POSTGRES_PASSWORD=senha_temporaria_123
            DB_HOST=postgres_db
            DB_PORT=5432
            RABBITMQ_DEFAULT_USER=rabbit_admin
            RABBITMQ_DEFAULT_PASS=senha_rabbit_123
            RABBITMQ_VHOST=/
            REDIS_HOST=redis_cache
            REDIS_PORT=6379
            GEMINI_API_KEY=AIzaSyCgcr7ubvYjyTKX-QhXJADUrCiv4YJr9wM
            GOOGLE_CLIENT_ID=64508171271-dve9dqr6sig268kdnupn1psi5k9ld518.apps.googleusercontent.com
            GOOGLE_CLIENT_SECRET=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
            CELERY_BROKER_URL=amqp://rabbit_admin:senha_rabbit_123@rabbitmq:5672//
            CELERY_RESULT_BACKEND=db+postgresql://studyflow_admin:senha_temporaria_123@postgres_db:5432/studyflow
            ENVFILE

            # 4. Sobe os containers usando a configuração só de Backend
            echo "🚀 Iniciando Docker Compose..."
            docker-compose -f docker-compose-backend.yml down
            docker-compose -f docker-compose-backend.yml up -d --build
          EOF