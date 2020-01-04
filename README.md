# RedisMQ
Message queue with AWS Redis impliment using NodaJS running on Linux docker

Download the zip file and open it in your filder. You will find two folders:
1. Server - contain all files to create the docker
2. Client - A simple client to test it.

Create and Run the docker under Linux
1. Copy server files to your Linux
2. To create the docker image run: docker build -t messageq .
3. To execute the docker run: docker run -t -i -p 3000:3000 messageq

Test
1. Run testMQ.html
2. Make sure the VM ip has the correct url with your IP
3. Press the Help button to get a response from the server
4. In the Create New Message enter a message and date-time and click the Echo Message button to register a message to be displayed.
