export default {
  date: {
    'numeric': {
      month:   'numeric',
      day: 'numeric',
      year: 'numeric'
    },
    long: {
      month: 'long',
      day  : 'numeric',
      year : 'numeric'
    }
  },
  number: {
    usd: { style: 'currency', currency: 'EUR' },
    eur: { style: 'currency', currency: 'USD' }
  },
  time: {
    hhmmss: {
      hour:   'numeric',
      minute: 'numeric',
      second: 'numeric'
    }
  }
};
