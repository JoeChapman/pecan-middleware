'use strict';

var Pecan = require('pecan'),
    middleware = require('../'),
    express = require('express'),
    request = require('supertest');

describe('pecan-middleware', sandbox(function () {

    var compiler, app, options;

    beforeEach(function () {
        sandbox.stub(Pecan, 'create', function (paths, options) {
            compiler = { compile: function () {} };
            compiler.compile = sandbox.stub(compiler, 'compile', function () {
                options.next();
            });
            return compiler;
        });

        app = express();
        options = { allow: '/dummy-templates' };

        app.use(middleware(__dirname + '/dummy-templates/', options));

    });

    it('throws "First argument must be the source path" when no src provided', function () {
        (function () {
            middleware();
            compiler.compile.should.not.have.been.called;
        }).should.throw('First argument must be the source path');
    });

    describe('POST request', function () {
        it('calls next without compiling a template', function (done) {

            return request(app)
                .post('/dummy-templates/t1.js')
                .expect(404, function (err) {

                    should.equal(err, null);

                    Pecan.create.should.not.have.been.called;

                    should.not.exist(compiler);
                    done();

                });
        });
    });

    describe('PUT request', function () {
        it('calls next without compiling a template', function (done) {

            return request(app)
                .put('/dummy-templates/t1.js')
                .expect(404, function (err) {

                    should.equal(err, null);

                    Pecan.create.should.not.have.been.called;

                    should.not.exist(compiler);
                    done();

                });
        });
    });

    describe('requests a non-existent JS include', function () {

        it('then compiles the original template if it exists', function (done) {

            return request(app)
                .get('/dummy-templates/t1.js')
                .expect(404, function (err) {

                    should.equal(err, null);

                    Pecan.create.getCall(0).should.have.been.calledWith({
                        jsPath: __dirname + '/dummy-templates/t1.js',
                        tmplPath: __dirname + '/dummy-templates/t1.jade'
                    }, options);

                    compiler.compile.should.have.been.calledOnce;
                    done();

                });

        });

        it('and won\'t compile the original template if it doesn\'t exist', function (done) {

            return request(app)
                .get('/dummy-templates/t5.js')
                .expect(500, function (err) {

                    should.equal(err, null);

                    Pecan.create.getCall(0).should.have.been.calledWith({
                        jsPath: __dirname + '/dummy-templates/t5.js',
                        tmplPath: __dirname + '/dummy-templates/t5.jade'
                    }, options);

                    compiler.compile.should.not.have.been.called;
                    done();

                });

        });

    });

    describe('requests an existing JS include', function () {

        it('then compiles the original template if modified after the include', function (done) {

            return request(app)
                .get('/dummy-templates/t3.js')
                .expect(404, function (err) {

                    should.equal(err, null);

                    Pecan.create.getCall(0).should.have.been.calledWith({
                        jsPath: __dirname + '/dummy-templates/t3.js',
                        tmplPath: __dirname + '/dummy-templates/t3.jade'
                    }, options);

                    compiler.compile.should.have.been.calledOnce;
                    done();

                });

        });

        it('and doesn\'t compile the original template if modified before the include', function (done) {

            return request(app)
                .get('/dummy-templates/t4.js')
                .expect(404, function (err) {

                    should.equal(err, null);

                    Pecan.create.getCall(0).should.have.been.calledWith({
                        jsPath: __dirname + '/dummy-templates/t4.js',
                        tmplPath: __dirname + '/dummy-templates/t4.jade'
                    }, options);

                    compiler.compile.should.not.have.been.called;
                    done();

                });

        });

    });

}));
