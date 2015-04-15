import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import 'ghost/utils/link-view';
import 'ghost/utils/text-field';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
    modulePrefix: config.modulePrefix,
    podModulePrefix: config.podModulePrefix,
    Resolver: Resolver,
    ready: function () {
        var language = navigator.language || navigator.browserLanguage;
        this.intl.set('locales', ['en']);

        this.intl.addMessages('en', {
            "slogan": "run-time value"

        })
    }
});

loadInitializers(App, config.modulePrefix);

export default App;
