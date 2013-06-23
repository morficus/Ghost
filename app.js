// # Ghost main app file

/*global require, __dirname */
(function () {
    "use strict";

    // Module dependencies.
    var express = require('express'),
        when = require('when'),
        _ = require('underscore'),
        errors = require('./core/shared/errorHandling'),
        admin = require('./core/admin/controllers'),
        frontend = require('./core/frontend/controllers'),
        api = require('./core/shared/api'),
        flash = require('connect-flash'),
        Ghost = require('./core/ghost'),
        I18n = require('./core/lang/i18n'),
        filters = require('./core/frontend/filters'),
        helpers = require('./core/frontend/helpers'),

    // ## Custom Middleware
        auth,
        authAPI,
        ghostLocals,

    // ## Variables
        loading = when.defer(),

        /**
         * Create new Ghost object
         * @type {Ghost}
         */
        ghost = new Ghost();


    ghost.app().configure('development', function () {
        ghost.app().use(express.favicon(__dirname + '/content/images/favicon.ico'));
        ghost.app().use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        ghost.app().use(express.logger('dev'));
        ghost.app().use(I18n.load(ghost));
        ghost.app().use(express.bodyParser({}));
        ghost.app().use(express.cookieParser('try-ghost'));
        ghost.app().use(express.cookieSession({ cookie: { maxAge: 60000000 }}));
        ghost.app().use(ghost.initTheme(ghost.app()));
        ghost.app().use(flash());
    });

    /**
     * Authenticate a request by redirecting to login if not logged in
     *
     * @type {*}
     */
    auth = function (req, res, next) {
        if (!req.session.user) {
            if (req.url && /^\/ghost\/?$/gi.test(req.url)) {
                // TODO: Welcome message?  Intro if no logins yet?
                req.shutUpJsLint = true;
            } else {
                req.flash('warn', "Please login");
            }

            return res.redirect('/ghost/login/?redirect=' + encodeURIComponent(req.path));
        }

        next();
    };

    /**
     * Authenticate a request by responding with a 401 and json error details
     *
     * @type {*}
     */
    authAPI = function (req, res, next) {
        if (!req.session.user) {
            // TODO: standardize error format/codes/messages
            var err = { code: 42, message: 'Please login' };
            res.json(401, { error: err });
            return;
        }
        next();
    };

    /**
     * Expose the standard locals that every external page should have available;
     * path, navItems and settingsCache
     */
    ghostLocals = function (req, res, next) {
        ghost.doFilter('ghostNavItems', {path: req.path, navItems: []}, function (navData) {
            // Make sure we have a locals value.
            res.locals = res.locals || {};

            // Extend it with nav data and settings
            _.extend(res.locals, navData, {
                messages: req.flash(),
                settings: ghost.settings(),
                availableThemes: ghost.paths().availableThemes,
                availablePlugins: ghost.paths().availablePlugins
            });

            next();
        });
    };

    // Expose the promise we will resolve after our pre-loading
    ghost.loaded = loading.promise;

    when.all([ghost.init(), filters.loadCoreFilters(ghost), helpers.loadCoreHelpers(ghost)]).then(function () {

        // post init config
        ghost.app().use(ghostLocals);

        /**
         * API routes..
         * @todo auth should be public auth not user auth
         */
        ghost.app().get('/api/v0.1/posts', authAPI, api.requestHandler(api.posts.browse));
        ghost.app().post('/api/v0.1/posts', authAPI, api.requestHandler(api.posts.add));
        ghost.app().get('/api/v0.1/posts/:id', authAPI, api.requestHandler(api.posts.read));
        ghost.app().put('/api/v0.1/posts/:id', authAPI, api.requestHandler(api.posts.edit));
        ghost.app().del('/api/v0.1/posts/:id', authAPI, api.requestHandler(api.posts.destroy));
        ghost.app().get('/api/v0.1/settings', authAPI, api.cachedSettingsRequestHandler(api.settings.browse));
        ghost.app().get('/api/v0.1/settings/:key', authAPI, api.cachedSettingsRequestHandler(api.settings.read));
        ghost.app().put('/api/v0.1/settings', authAPI, api.cachedSettingsRequestHandler(api.settings.edit));

        /**
         * Admin routes..
         * @todo put these somewhere in admin
         */
        ghost.app().get(/^\/logout\/?$/, admin.logout);
        ghost.app().get('/ghost/login/', admin.login);
        ghost.app().get('/ghost/signup/', admin.signup);
        ghost.app().post('/ghost/login/', admin.auth);
        ghost.app().post('/ghost/signup/', admin.doRegister);
        ghost.app().get('/ghost/editor/:id', auth, admin.editor);
        ghost.app().get('/ghost/editor', auth, admin.editor);
        ghost.app().get('/ghost/content', auth, admin.content);
        ghost.app().get('/ghost/settings*', auth, admin.settings);
        ghost.app().get('/ghost/debug', auth, admin.debug.index);
        ghost.app().get('/ghost/debug/db/export/', auth, admin.debug['export']);
        ghost.app().post('/ghost/debug/db/import/', auth, admin.debug.import);
        ghost.app().get('/ghost/debug/db/reset/', auth, admin.debug.reset);
        ghost.app().get(/^\/(ghost$|(ghost-admin|admin|wp-admin|dashboard|login)\/?)/, auth, function (req, res) {
            res.redirect('/ghost/');
        });
        ghost.app().get('/ghost/', auth, admin.index);

        /**
         * Frontend routes..
         * @todo dynamic routing, homepage generator, filters ETC ETC
         */
        ghost.app().get('/:slug', frontend.single);
        ghost.app().get('/', frontend.homepage);

        ghost.app().listen(3333, function () {
            console.log("Express server listening on port " + 3333);

            // Let everyone know we have finished loading
            loading.resolve();
        });

    }, errors.logAndThrowError);
}());
