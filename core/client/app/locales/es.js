import Locale from 'ember-intl/models/locale';

export default Locale.extend({
  locale: 'es',
  messages: {
    greeting: 'hola!',
    num: 99,
    product: {
      info: '{product} va a costar {price, number USD} si es ordenado antes del {deadline, date, time}'
    }
  }
});
