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
        //TODO: need to figure out how to set this dynamically based on blog setting
        this.intl.set('locales', ['es', 'hu-HU', 'en']);

    }
});

loadInitializers(App, config.modulePrefix);

export default App;
