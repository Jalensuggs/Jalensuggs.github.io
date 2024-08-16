## Simple intelligent management

##### Position：Backend development engineer

###### Technology selection：Vue, Spring Boot, Mybatis

`Date:2023-08`

During the development of this project, I worked with team members on the design and arrangement of the framework. During the implementation process, I used reflection and underlying multi-threaded Thread technology. For the web page rendering part, I used CSS, JavaScript and HTML5, and used the Vue framework for rendering. Taking into account Vue's non-polymorphism, we also designed the Vue 2.0 version.  In order to ensure the maintainability of the backend, I adopted the MVC three-tier architecture. In addition, in order to implement persistence operations, I introduced the MyBatis framework. By using MyBatis, I can add, delete, modify, and query data, further improving the functionality of the project.


---



## Big-event System

##### Position：Full Stack Developver

###### Technology selection：Vue, Spring Boot, MyBatis-Plus, Redis, Nginx, Mysql

`Date:2024-05`

The front end is rendered with vue, with the help of elementUI
File upload and download and cloud storage functions are realized through Ali OSS technology.
Docker containerization technology is used for multi-machine hybrid deployment of the front-end, back-end and middleware services of the project to avoid single point of failure.
The project implements stateless single sign-on based on JWT, replaces the original cookies and Session mechanism in the project, and avoids session sharing problems under the cluster. Authentication and role management are realized through springsecurity and jwt. Data is cached through redis.
Custom AOP aspects are used to extract common code logic, realize interface input and output parameter printing and Metrics time statistics
Use WebSocket to make data exchange between the client and the server simpler, and is used to realize the incoming and urging functions of the project.
