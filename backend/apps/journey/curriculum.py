# backend/apps/journey/curriculum.py

SAGA_DATA = [
    {
        "id": "world_1",
        "title": "Mundo 1: O Vale dos Fundamentos",
        "role": "Junior",
        "description": "Sobrevivência e Construção. O objetivo é fazer as coisas funcionarem.",
        "color": "from-green-600 to-emerald-900",
        "levels": [
            {"id": "w1_l1", "title": "O Despertar", "topic": "Computação Básica: CPU, Memória, Binário, Compilado vs Interpretado"},
            {"id": "w1_l2", "title": "O Terminal", "topic": "Linux & OS: Bash, Permissões, Processos, Filesystem"},
            {"id": "w1_l3", "title": "A Forja", "topic": "Lógica de Programação: Variáveis, Loops, Condicionais, Funções"},
            {"id": "w1_l4", "title": "O Templo dos Objetos", "topic": "POO: Classes, Herança, Polimorfismo, Encapsulamento"},
            {"id": "w1_l5", "title": "Os Pergaminhos", "topic": "SQL & Dados: Tabelas, Select, Join, ACID"},
            {"id": "w1_l6", "title": "A Linha do Tempo", "topic": "Git: Commits, Branches, Merge, Pull Requests"},
            {"id": "w1_l7", "title": "A Teia", "topic": "Web & HTTP: DNS, Request/Response, Status Codes"},
            {"id": "w1_l8", "title": "O Portal", "topic": "APIs REST: JSON, Verbos HTTP, Endpoints"},
            {"id": "w1_l9", "title": "A Caixa Mágica", "topic": "Docker: Containers, Imagens, Volumes, Dockerfile"},
        ],
        "boss": {
            "id": "boss_1",
            "title": "BOSS: O Monólito de Pedra",
            "description": "O Boss te ataca com erros de deploy e conflitos de merge. Defenda-se!",
            "topic": "Integração de Sistemas Junior: Debugging, Deploy simples, Git Conflicts",
            "difficulty": "hard"
        }
    },
    {
        "id": "world_2",
        "title": "Mundo 2: A Cidadela da Qualidade",
        "role": "Pleno",
        "description": "Ordem e Eficiência. O objetivo é fazer o código limpo e escalável.",
        "color": "from-blue-600 to-indigo-900",
        "levels": [
            {"id": "w2_l1", "title": "A Biblioteca Oculta", "topic": "NoSQL & Cache: MongoDB, Redis, Teorema CAP"},
            {"id": "w2_l2", "title": "O Jardim Zen", "topic": "Clean Code: Nomes significativos, Funções pequenas, Tratamento de Erro"},
            {"id": "w2_l3", "title": "Os 5 Pilares", "topic": "SOLID Principles: SRP, OCP, LSP, ISP, DIP"},
            {"id": "w2_l4", "title": "A Torre de Vigia", "topic": "Testes & QA: Unitários, Integração, TDD, Mocking"},
            {"id": "w2_l5", "title": "O Arsenal", "topic": "Design Patterns: Factory, Singleton, Strategy, Observer"},
            {"id": "w2_l6", "title": "A Oficina", "topic": "Refatoração de Código Legado: Técnicas seguras"},
            {"id": "w2_l7", "title": "O Túnel de Vento", "topic": "Performance Backend: Indexação DB, N+1 problem, Async"},
            {"id": "w2_l8", "title": "As Nuvens", "topic": "Cloud & CI/CD: AWS Basics, Pipelines, GitHub Actions"},
        ],
        "boss": {
            "id": "boss_2",
            "title": "BOSS: O Espaguete Legado",
            "description": "Um monstro feito de código ruim. Use Design Patterns para vencer.",
            "topic": "Arquitetura Pleno: Code Smells, Refactoring, Design Patterns em cenários reais",
            "difficulty": "hard"
        }
    },
    {
        "id": "world_3",
        "title": "Mundo 3: O Nexus da Arquitetura",
        "role": "Arquiteto",
        "description": "Estratégia e Visão Macro. O objetivo é desenhar sistemas complexos.",
        "color": "from-purple-600 to-fuchsia-900",
        "levels": [
            {"id": "w3_l1", "title": "O Mapa Estelar", "topic": "Fundamentos da Arquitetura: RNF (Requisitos Não Funcionais), Trade-offs"},
            {"id": "w3_l2", "title": "O Domínio", "topic": "DDD: Bounded Contexts, Entidades, Agregados, Value Objects"},
            {"id": "w3_l3", "title": "As Camadas", "topic": "Clean Architecture & Hexagonal: Ports & Adapters"},
            {"id": "w3_l4", "title": "A Metrópole", "topic": "Monolito Modular vs Distribuído: Organização de módulos"},
            {"id": "w3_l5", "title": "A Frota Estelar", "topic": "Microservices: Decomposição, Comunicação gRPC/REST, Saga Pattern"},
            {"id": "w3_l6", "title": "O Fluxo de Energia", "topic": "Event-Driven: Kafka, RabbitMQ, Consistência Eventual"},
            {"id": "w3_l7", "title": "A Matéria Escura", "topic": "Serverless & Cloud Native: FaaS, Autoscaling, Observabilidade"},
        ],
        "boss": {
            "id": "boss_3",
            "title": "BOSS: O Caos da Escala",
            "description": "Uma simulação de Black Friday. O sistema está caindo. Salve-o!",
            "topic": "System Design Avançado: Scalability, Reliability, Circuit Breaker, Sharding",
            "difficulty": "hard"
        }
    }
]

def get_level_data(level_id):
    """
    Helper para encontrar os dados de um nível ou boss pelo ID.
    Retorna: (level_dict, world_dict, is_boss_boolean)
    """
    for world in SAGA_DATA:
        # Verifica Níveis Normais
        for level in world['levels']:
            if level['id'] == level_id:
                return level, world, False
        # Verifica Boss
        if world['boss']['id'] == level_id:
            return world['boss'], world, True
    return None, None, None