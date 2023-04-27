### Build and push

```
docker build -t stekolschikov/web-spider:latest .
# or
docker buildx build --platform linux/amd64 -t stekolschikov/web-spider:latest . 

docker push stekolschikov/web-spider:latest
```
### Run
```
docker run -d -it -p 3000:3000 stekolschikov/web-spider:latest
```