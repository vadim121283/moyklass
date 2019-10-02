const Router = require('koa-router'),
      KoaBody = require('koa-body'),
     {list, createLesson} = require('../controllers/index');

const router = new Router();

    router
        .get('/',           list)
        .post('/lesson/',   KoaBody(), createLesson);

module.exports = {
    routes () { return router.routes() },
    allowedMethods () { return router.allowedMethods() }
};
