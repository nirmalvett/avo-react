FROM nikolaik/python-nodejs:latest

RUN mkdir -p /avo-react

WORKDIR /avo-react

COPY ./ ./

RUN cd static && npm install

RUN pip3 install -r requirements.txt

CMD ["sh", "-c", "npm run watch --prefix ./static/ & python3 app.py"]

EXPOSE 5000