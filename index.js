// TODO: DB or Redis Store
// TODO: Replay events method for single domain

module.exports = {
  App: require('./application'),
  DomainEvent: require('./domain_event'),
  eventStores: {
    Memory: require('./event_stores/memory'),
    Postgres: require('./event_stores/postgres')
  },
  eventDistributors: {
    Simple: require('./event_distributors/simple'),
    Redis: require('./event_distributors/redis')
  }
};
