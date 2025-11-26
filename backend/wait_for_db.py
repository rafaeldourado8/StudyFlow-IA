import socket
import time
import os
import sys

def check_service(host, port, service_name):
    """Tenta conectar a um serviço TCP repetidamente até o timeout."""
    timeout = 90  # 90 segundos de limite
    start_time = time.time()
    
    print(f"🔄 [WAIT] Aguardando {service_name} em {host}:{port}...", flush=True)

    while True:
        try:
            with socket.create_connection((host, port), timeout=3):
                print(f"✅ [WAIT] {service_name} está disponível!", flush=True)
                break
        except (OSError, ConnectionRefusedError):
            if time.time() - start_time > timeout:
                print(f"❌ [WAIT] Timeout! {service_name} não respondeu.", flush=True)
                sys.exit(1)
            time.sleep(2)

if __name__ == "__main__":
    # 1. Verificar PostgreSQL
    db_host = os.environ.get("DB_HOST", "postgres_db")
    db_port = int(os.environ.get("DB_PORT", 5432))
    check_service(db_host, db_port, "PostgreSQL")

    # 2. Verificar RabbitMQ
    # O hostname 'rabbitmq' deve bater com o nome do serviço no docker-compose
    rabbit_host = "rabbitmq" 
    rabbit_port = 5672
    check_service(rabbit_host, rabbit_port, "RabbitMQ")