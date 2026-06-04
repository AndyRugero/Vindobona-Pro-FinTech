#using Node.js version 20 on a light linux system called Alpine
FROM node:20-alpine

#set folder inside the box where files will live 
WORKDIR /usr/src/app

#copy package.json for speed up future builds
COPY package*.json ./

#install only production dependencies(no dvp tools)
RUN npm ci --only=production

#copy all remaining project files from the computer to the container
COPY . .

#open up 5001 so the outside world can talk to our server
EXPOSE 5001

#start our Node.js server when the container starts
CMD ["node", "server/server.js"]