# Estágio 1: Build da aplicação React
FROM node:18-alpine as build

WORKDIR /app

# Copia dependências e instala
COPY package.json package-lock.json* ./
RUN npm install

# Copia o código fonte
COPY . .

# Gera o build de produção
RUN npm run build

# Estágio 2: Servidor Nginx para servir os estáticos
FROM nginx:alpine

# Copia o build do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuração do Nginx (definida abaixo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]