# Google App Engine Microservice Architecture Example

## Aim

The purpose of this project is to demonstrate how to structure applications as microservices and deploy them to Google App Engine. 

Projects are included in Java, Python, PHP and Node.js 

Different microservice architectures could be considered. 

## Questions to answer

Do we *have* to create a default module? - YES

If so how do we control which is the default module? - ? 

## Tools used

- Windows 10
- Visual Studio Code
- Google cloud SDK 157.0.0
- Maven 3.5.0 (for Java only)
- Node.js 3.10.8 (for Node.js only)

## References

https://medium.com/@ssola/building-microservices-with-python-part-i-5240a8dcc2fb

https://medium.com/this-dot-labs/node-js-microservices-on-google-app-engine-b1193497fb4b

https://cloud.google.com/appengine/docs/standard/python/quickstart

https://github.com/GoogleCloudPlatform/python-docs-samples/blob/master/appengine/standard/hello_world/

https://cloud.google.com/appengine/docs/standard/java/quickstart

# Step-by-Step (rebuild from scratch)

## Initial setup

### 1. Initialise git repo + clone

### 2. Sign in to gcloud
Make sure you've created the Google Cloud Platform project via the web console first.

`$ gcloud init`

### 3. Create App Engine project

`$ gcloud app create`

## Create a default service in Python

It is necessary to deploy a default service before any other service, but the default app doesn't have to be python. To configure a python app as a service you would add `service: my-service-name` to app.yaml file.

### 1. Create a folder and navigate to it

`$ mkdir python-service`

`$ cd python-service`

### 2. Configure python app for GAE

1. Create app.yaml file which defines the runtime and entry point for the Python app
TODO - what do api_version and threadsafe do on GAE

```
runtime: python27
api_version: 1
threadsafe: true

handlers:
- url: /.*
  script: main.app
```

2. Create main.py

```
import webapp2

class MainPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.write('Default service')

app = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)
```

### 3. Test Locally

`$ dev_appserver.py app.yaml`

### 4. Deploy to App Engine

`$ gcloud app deploy`

If you get,`You do not have permission to access project [my-project] (or it may not exist): The caller does not have permission`, the App Engine Admin or App Engine Flexible Environment API may not have been enabled. Enable it via the web console and try again.

To test - `$ gcloud app browse`

## Create a node.js service (Using the flexible environment)

A lot of the node stuff for this is from https://medium.com/this-dot-labs/node-js-microservices-on-google-app-engine-b1193497fb4b

### 1. Create a folder and navigate to it

`$ mkdir node-service`

`$ cd node-service`

### 2. Initialise node project
`$ npm init`

### 3. Configure node app for GAE
1. Create app.yaml file as entry point for GAE

```
runtime: nodejs
env: flex 
service: node-demo
```

GAE uses `node start` command to start the server, so we'll make sure that script is there later

2. Install express

`$ npm install --save express`

3. Create server.js file with a simple express server
```
  "use strict"; 
  const express = require('express'); 
  const app = express(); 
  app.get('/', (req, res) => {    
      res.status(200).send('Hello from node-demo service!');
  });
  app.listen(8080); //can use process.env.PORT to get the default port on GAE, but this won't work locally
```

4. Edit package.json scripts parameter 
``` 
  ...
  "scripts": {
    "start": "node server.js"
  }, 
  ...
```

5. Add engines parameter so that GAE knows to use node 6
```
{
  ...
  "engines": { 
    "node" : ">=6.0.0" 
  },
  ...
}
```

### 4. Test locally
`$ npm install`

`$ npm start`

### 5. Deploy to App Engine

`$ gcloud app deploy`

To test - `$ gcloud app browse`

## Create a java service

### 1. Create a folder  and navigate to it

`$ mkdir java-service`

`$ cd java-service`

### 2. Create pom.xml for maven build process 
```
<project>
  <modelVersion>4.0.0</modelVersion>
  <packaging>war</packaging>
  <version>1.0-SNAPSHOT</version>
  <groupId>com.example.appengine</groupId>
  <artifactId>java-demo</artifactId>
  <dependencies>
    <dependency>
      <groupId>javax.servlet</groupId>
      <artifactId>servlet-api</artifactId>
      <version>2.5</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>
  <properties>
    <appengine.sdk.version>1.9.54</appengine.sdk.version>
  </properties>
  <build>
    <!-- for hot reload of the web application -->
    <outputDirectory>${project.build.directory}/${project.build.finalName}/WEB-INF/classes</outputDirectory>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <version>3.3</version>
        <artifactId>maven-compiler-plugin</artifactId>
        <configuration>
          <source>1.7</source>
          <target>1.7</target>
        </configuration>
      </plugin>
      <plugin>
        <groupId>com.google.appengine</groupId>
        <artifactId>appengine-maven-plugin</artifactId>
        <version>${appengine.sdk.version}</version>
      </plugin>
    </plugins>
  </build>
</project>
```
### 2. Create a folder for app engine config

`$ mkdir src/main/webapp/WEB-INF`

`$ cd src/main/webapp/WEB-INF`

### 3. Create appengine-web.xml
The module tag is where the service name is specified

```
<appengine-web-app xmlns="http://appengine.google.com/ns/1.0">
  <application>my-project-id</application>
  <version>1</version>
  <threadsafe>true</threadsafe>
   <module>java-demo</module>
</appengine-web-app>
```
### 4. Create web.xml
```
<?xml version="1.0" encoding="utf-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee"
  xmlns:web="http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
  xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
  version="2.5">
  <servlet>
    <servlet-name>hello</servlet-name>
    <servlet-class>com.example.appengine.helloworld.HelloServlet</servlet-class>
  </servlet>
  <servlet-mapping>
    <servlet-name>hello</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>
```
### 5. Navigate back to root folder then create src folder
TODO - is the long directory structure actually required?

`$ mkdir src/main/java/com/example/appengine/helloworld`

`$ cd src/main/java/com/example/appengine/helloworld`

### 6. Create simple server
```
package com.example.appengine.helloworld;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
public class HelloServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    PrintWriter out = resp.getWriter();
    out.println("Hello from java");
  }
}
```

### 7. Test locally

`$ mvn appengine:devserver` - Start the server
`$ mvn clean package` - Refresh the server

### 8. Deploy to app engine 
Java needs a different tool to deploy to app engine, so you'll need to make sure maven is installed and configured.

`$ mvn appengine:update`

## Create a php service

### 1. Create a folder and navigate to it

`$ mkdir php-service`

`$ cd php-service`

### 2. Configure php app for GAE

1. Create app.yaml file which defines the runtime and entry point for the php app

```
runtime: php55
api_version: 1
service: php-demo

handlers:
- url: /.*
  script: python-service.php
```

2. Create main.py

```
<?php
echo 'Hello from php!';
```

### 3. Test locally 

`$ dev_appserver.py app.yaml`

### 4. Deploy

`$ gcloud app deploy`

## Create a go service

### 1. Create a folder and navigate to it

`$ mkdir go-service`

`$ cd go-service`

### 2. Configure go app for GAE

1. Create app.yaml file which defines the runtime and entry point for the go app

```
runtime: go
api_version: go1
service: go-demo

handlers:
- url: /.*
  script: _go_app
```

2. Create hello.go

```
package hello

import (
    "fmt"
    "net/http"
)

func init() {
    http.HandleFunc("/", handler)
}

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello, world!")
}
```

### 3. Test locally 

`$ dev_appserver.py app.yaml`

### 4. Deploy

`$ gcloud app deploy`