docker build -t stekolschikov/web-spider:latest .

docker run -d -it -p 3000:3000 stekolschikov/web-spider:latest

docker run -d -it -p 1340:3000 --restart=always stekolschikov/web-spider:latest
