var localesMyAppSupports = [
        'en'
    ],
    _               = require('lodash'),
    //TODO: fetch this dynamically based on overall blog settings (`key = "defaultLang"` in the `settings` table
    currentLocale   = 'en',
    fs              = require('fs'),
    MessageFormat   = require('intl-messageformat'),
    chalk           = require('chalk'),
    I18n;


I18n = {

    t: function t (path, context) {

        var string = I18n.getString(path),
            msg;

        // If the given path returns an array (as in the case with emails), then loop through them and return an array
        // of translated/formatted strings. Otherwise, just return the normal translated/formatted string.
        if (_.isArray(string)) {
            msg = [];
            string.forEach(function (s) {
                var m = new MessageFormat(s, currentLocale);

                msg.push(m.format(context));
            });
        } else {
            msg = new MessageFormat(string, currentLocale);
            msg = msg.format(context);
        }

        return msg;
    },

    /**
     * Parse JSON file for matching locale, returns string giving path.
     *
     * @param path {string} Path with in JSON file to desired string (ie: "errors.init.jsNotBuilt")
     * @returns {string}
     */
    getString: function getString (path) {

        // no path? no string
        if (_.isEmpty(path) || !_.isString(path)) {
            chalk.yellow('i18n:t() - received an empty path.');
            return '';
        }

        // read and file for current locale
        var blos = fs.readFileSync(__dirname + '/translations/' + currentLocale + '.json'),
            matchingString = JSON.parse(blos);

        path = path.split('.');
        path.forEach(function (key) {
            // reassign matching object, or set to an empty string if there is no match
            //TODO: show warning if no matching string is found...
            matchingString = matchingString[key] || '';
        });

        /*if (_.isArray(matchingString)) {
         matchingString = matchingString.join(' ');
         }*/

        return matchingString;
    },

    // Polyfill node.js if it does not have Intl support or support for a particular locale
    init: function init () {
        if (global.Intl) {
            // Determine if the built-in `Intl` has the locale data we need.
            var hasBuiltInLocaleData = localesMyAppSupports.every(function (locale) {
                return Intl.NumberFormat.supportedLocalesOf(locale)[0] === locale &&
                    Intl.DateTimeFormat.supportedLocalesOf(locale)[0] === locale;
            });

            if (!hasBuiltInLocaleData) {
                // `Intl` exists, but it doesn't have the data we need, so load the
                // polyfill and replace the constructors with need with the polyfill's.
                require('intl');
                Intl.NumberFormat   = IntlPolyfill.NumberFormat;
                Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
            }
        } else {
            // No `Intl`, so use and load the polyfill.
            global.Intl = require('intl');
        }
    }
};

module.exports = I18n;
