FROM node:20.19-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npx", "next", "dev", "--turbo", "--hostname", "0.0.0.0"]
