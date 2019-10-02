const models = require('../models');

/**
 * @example curl -XGET "http://localhost:8081/"
 */
async function list (ctx, next) {
    console.log(ctx.request.query.status);
    //console.log(ctx.request.url);
    ctx.body = await models.Lesson.findAll();
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
