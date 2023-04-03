docker build -t stekolschikov/dev-guns-spider:latest . && docker push stekolschikov/dev-guns-spider:latest

docker run -d -it -p 3000:3000 stekolschikov/dev-guns-spider:latest

seq 10 | xargs -I{} docker run --restart=always -d stekolschikov/tpp:latest

url: string,
fields: string = "*" (ISite)
screenshotSize: number = 1000 (width)
screenshotQuality: number = 100 (0-100)

docker build -f Dockerfile.loacl -t stekolschikov/tpp:latest .

seq 1 | xargs -I{} docker run --restart=always --env-file .env -d stekolschikov/tpp:latest


docker run --rm -e URL="https://account.jetbrains.com/oauth/login?client_id=ide&scope=openid offline_access r_ide_auth&state=3c19f83a-195d-422a-9d77-77982b763c60&code_challenge_method=S256&code_challenge=ads0FBp8n6mBd0St6lXJF9teZcu0DEsL6LJlZ2BiXTs&request_credentials=required" pavlokobyliatskyi/jetbrains
