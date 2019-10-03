# Moyklass

Sample Web App with Koa2 and Sequelize and Postgres.

# Examples
## Create
```
curl -XPOST "http://localhost:8081/lesson" -d '{
	"teacherIds": [1,3],
	"title": "Test Lesson",
	"days": [4,6],
	"firstDate": "2019-10-03",
	"lessonCount": 10
}' -H 'Content-Type: application/json'
```
## Get
```
curl -XGET "http://localhost:8081/?date=2019-09-01,2019-09-30&status=1&teacherIds=1,2,3&studentsCount=1,3&page=1&lessonPerPage=5"
```
