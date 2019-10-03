const models = require('../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

/**
 * @example curl -XGET "http://localhost:8081/"
 * http://localhost:8081/?date=2019-09-01,2019-09-30&status=1&teacherIds=1,2,3&studentsCount=1,3&page=1&lessonPerPage=5
 */
async function list (ctx, next) {
    let lessons = [];

    // Check param
    console.log(ctx.request.query);
    if (ctx.request.query) {

        let param = ctx.request.query;

        // Bag if use limit & include COUNT
        // subQuery: false OR separate: true part resolve
        let query = {
            where : {},
            limit: 5,
            include: [
                {
                model: models.Student
                }
                ],
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
            for(let i = 0; i < teachers.length; i++) { teachers[i] = parseInt(teachers[i], 10); }
            console.log(teachers);
            query.include.push(
                {
                    model: models.Teacher,
                    where: { id: {
                        [Op.in]: teachers
                        } }
                }
            );
        } else {
            query.include.push(
                {
                    model: models.Teacher,
                }
            );
        }

        // Count filter NOT work with limit
        // Its BAG in library
        if (param.studentsCount) {

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

        console.log(JSON.stringify(query.attributes));
        if (!query) query = {};
        try {
            lessons = await models.Lesson.findAll(query);
        } catch (err) {
            // todo Error
            console.log(err);
        }

    } else {
        lessons = await models.Lesson.findAll();
    }

    // Collect lesson.ids
    let lessonsIds = [];
    lessons.forEach(function(item, index, array) {
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
        // todo Error
        console.log(err);
    }
    // Make arr with Ids
    let counts = lessonsIds.map(function(item) {
        return {lesson_id: item, visit_count: 0, students_count: 0};
    });
    // Count visit & students
    lessonStudents.forEach(function(item, index, array) {
        let i = counts.findIndex(i2 => item.LessonId === i2.lesson_id);
        if (item.visit === true) counts[i].visit_count++;
        counts[i].students_count++;
    });
    //console.log(counts);

    // Prepare body
    let body = [];
    lessons.forEach(function(item, index, array) {
        // todo Can model func use
        let students = item["Students"].map(function(item) {
            return {id: item.id, name: item.name, visit: item["LessonStudents"].visit};
        });
        let teachers = item["Teachers"].map(function(item) {
            return {id: item.id, name: item.name};
        });
        console.log(item["Students"][0]);
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
 * @example curl -XPOST "http://localhost:8081/lesson" -d '{"title":"New Lesson 1"}' -H 'Content-Type: application/json'
 */
async function createLesson (ctx, next) {
    //let body = await Joi.validate(ctx.request.body, userSchema, {allowUnknown: true});
    //ctx.body = await myDb.setNewId(body.name);
    try {
        const lesson = await models.Lesson.create({id: 11, date: '2019-10-02', title: 'Test Lesson', status: 1 });
        console.log('LessonCreate: ' + JSON.stringify(lesson));
        ctx.status = 201;
        await next();
    } catch (err) {
        console.log('Error LessonCreate');

        let body = {
            message: err.message
        };
        // will only respond with JSON
        ctx.status = 400;
        ctx.body = body
    }
}

module.exports = {list, createLesson};
