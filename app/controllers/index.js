const models = require('../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const {
    round
} = require('mathjs');

/**
 * @example curl -XGET "http://localhost:8081/"
 * http://localhost:8081/?date=2019-09-01,2019-09-30&status=1&teacherIds=1,2,3&page=1&lessonPerPage=5
 */
async function list(ctx, next) {
    let lessons = [];

    // Check param
    //console.log(ctx.request.query);
    if (ctx.request.query) {

        // todo check valid param
        let param = ctx.request.query;

        // Bag if use limit & include COUNT
        // subQuery: false OR separate: true part resolve
        let query = {
            where: {},
            limit: 5,
            include: [{
                model: models.Student
            }],
        };

        if (param.date) {
            let date = param.date.split(',');

            if (date.length > 1) {
                // 2 dates
                let sDate;
                let eDate;

                if (date[0] <= date[1]) {
                    sDate = date[0];
                    eDate = date[1];
                } else {
                    sDate = date[1];
                    eDate = date[0];
                }

                query.where.date = {
                    [Op.between]: [sDate, eDate]
                }
            } else {
                // 1 date
                query.where.date = date[0];
            }

        }

        if (param.status) {
            query.where.status = param.status;
        }

        if (param.teacherIds) {
            let teachers = param.teacherIds.split(',');
            for (let i = 0; i < teachers.length; i++) {
                teachers[i] = parseInt(teachers[i], 10);
            }
            //console.log(teachers);
            query.include.push({
                model: models.Teacher,
                where: {
                    id: {
                        [Op.in]: teachers
                    }
                }
            });
        } else {
            query.include.push({
                model: models.Teacher,
            });
        }

        // Pagination
        if (param.page) {
            let page = param.page;
            let per = query.limit;

            if (param.lessonPerPage) {
                query.limit = param.lessonPerPage;
                per = param.lessonPerPage;
            }

            if (page > 1) {
                page--;
                query.offset = page * per;
            }
        } else {
            if (param.lessonPerPage) {
                query.limit = param.lessonPerPage;
            }
        }

        //console.log(JSON.stringify(query.attributes));
        if (!query) query = {};
        try {
            lessons = await models.Lesson.findAll(query);
        } catch (err) {
            console.log(err);
            ctx.body = {
                message: err.message
            };
            ctx.status = 400;
            await next();
        }

    } else {
        lessons = await models.Lesson.findAll();
    }

    // Collect lesson.ids
    let lessonsIds = [];
    lessons.forEach(function (item, index, array) {
        lessonsIds.push(item.id);
    });
    // Count Lesson Students
    // Load All
    let lessonStudents = [];
    try {
        lessonStudents = await models.LessonStudents.findAll({
            where: {
                'lesson_id': {
                    [Op.in]: lessonsIds
                },
            }
        });
    } catch (err) {
        console.log(err);
        ctx.body = {
            message: err.message
        };
        ctx.status = 400;
        await next();
    }
    // Make arr with Ids
    let counts = lessonsIds.map(function (item) {
        return {
            lesson_id: item,
            visit_count: 0,
            students_count: 0
        };
    });
    // Count visit & students
    lessonStudents.forEach(function (item, index, array) {
        let i = counts.findIndex(i2 => item.LessonId === i2.lesson_id);
        if (item.visit === true) counts[i].visit_count++;
        counts[i].students_count++;
    });

    // Prepare body
    let body = [];
    lessons.forEach(function (item, index, array) {
        let students = item["Students"].map(function (item) {
            return {
                id: item.id,
                name: item.name,
                visit: item["LessonStudents"].visit
            };
        });
        let teachers = item["Teachers"].map(function (item) {
            return {
                id: item.id,
                name: item.name
            };
        });
        body.push({
            "id": item.id,
            "date": item.date,
            "title": item.title,
            "status": item.status,
            "visitCount": counts.find(i2 => item.id === i2.lesson_id).visit_count,
            "students": students,
            "teachers": teachers,
        });
    });

    ctx.body = body;
    await next();
}

/**
 * @example curl -XPOST "http://localhost:8081/lesson" -d '{
	"teacherIds": [1,3],
	"title": "Test Lesson",
	"days": [4,6],
	"firstDate": "2019-10-03",
	"lessonCount": 10
}' -H 'Content-Type: application/json'
 */
async function createLesson(ctx, next) {
    let lesson = ctx.request.body;

    if (!lesson.teacherIds || !lesson.title || !lesson.firstDate) {
        console.log('Wrong param');
        ctx.status = 400;
        ctx.body = {
            Err: 'Wrong param'
        };
        return;
    }

    if (!lesson.days) {
        lesson.days = [0, 1, 2, 3, 4, 5, 6];
    } else {
        // Check arr
        function unique(arr) {
            let result = [];
            for (let str of arr) {
                if (!result.includes(str)) {
                    result.push(str);
                }
            }
            return result;
        }
        lesson.days = unique(lesson.days);
        lesson.days = lesson.days.filter(item => /^[0-6]$/.test(item));
        lesson.days.sort();
    }

    let firstDate = new Date(lesson.firstDate);
    let lastDate = new Date(lesson.firstDate);
    lastDate.setFullYear(lastDate.getFullYear() + 1);
    if (lesson.lastDate) {
        last = new Date(lesson.lastDate);
        if (last < lastDate) {
            lastDate = last;
        }
    }

    let lessonCount = 300;
    if (lesson.lessonCount) {
        if (lesson.lessonCount < lessonCount) {
            lessonCount = lesson.lessonCount;
        }
    }
    //console.log(`FirstDate: ${firstDate} LastDate: ${lastDate} Count: ${lessonCount}`);

    // Create Query arr
    let query = [];
    while (lessonCount > 0) {
        if (lesson.days.includes(firstDate.getDay())) {
            query.push({
                date: firstDate.toLocaleDateString('ru-RU'),
                title: lesson.title
            });
            lessonCount--;
        }
        firstDate.setDate(firstDate.getDate() + 1);
        if (firstDate > lastDate) break;
    }

    // Teachers
    let teachers = [];
    try {
        teachers = await models.Teacher.findAll({
            where: {
                id: {
                    [Op.in]: lesson.teacherIds
                }
            }
        });
    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: err.message
        };
    }

    // Query 1
    let lessonsIds = [];
    let lessons = [];
    try {
        lessons = await models.Lesson.bulkCreate(query);
        lessons.forEach(function (item, index, array) {
            item.setTeachers(teachers);
            lessonsIds.push(item.id);
        })

    } catch (err) {
        console.log(err);
        ctx.status = 400;
        ctx.body = {
            message: err.message
        };
    }

    ctx.body = lessonsIds;
    //ctx.body = lessonsIds.length;
    ctx.status = 201;
    await next();
}

module.exports = {
    list,
    createLesson
};