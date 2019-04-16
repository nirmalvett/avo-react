docker build -t avo_container -f $(pwd)/DockerfilePROD ./
docker run -d -p 5000:5000 --name avo-react avo_container