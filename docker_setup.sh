docker build -t avo_container ./
docker run -it -p 5000:5000 -v $(pwd)/static:/avo-react/static --name avo-react avo_container