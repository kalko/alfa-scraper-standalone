# Použij oficiální Node.js image
FROM node:18

# Nastav pracovní adresář v kontejneru
WORKDIR /usr/src/app

# Zkopíruj package.json a package-lock.json
COPY package*.json ./

# Nainstaluj závislosti
RUN npm install

# Zkopíruj zbytek aplikace
COPY . .

# Nastav defaultní příkaz pro spuštění aplikace
CMD ["npm", "start"]
