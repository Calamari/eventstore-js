var pg = require('pg');
var format = require('pg-format');

var DomainEvent = require('../domain_event');

var INSERT_QUERY_START  = 'INSERT INTO %I (name, aggregate_id, data, created_at) VALUES ';
var INSERT_QUERY_VALUES = '(%L, %L, %L::json, %L)';
var SELECT_ALL_QUERY    = 'SELECT * FROM %I ORDER BY id ASC';
var SELECT_ONE_QUERY    = 'SELECT * FROM %I WHERE aggregate_id=%L';

/**
 * Pretty useless except for testing purposes and trying out things
 * Use as interface reference
 */
function EventPostgresStore(config) {
  var connectionString = [
    "postgres://",
    (config.username || 'root'),
    ":",
    (config.password || ''),
    "@",
    (config.host || 'localhost'),
    "/",
    config.database
  ].join('');
  var tableName = config.tableName || 'domain_events';

  function doQuery(sql, cb) {
    pg.connect(connectionString, function(err, client, done) {
      if (err) {
        return cb(err);
      }
      client.query(sql, function(err, result) {
        done();
        cb(err, result);
      });
    });
  }

  function resultToEvents(result) {
    if (result) {
      return result.rows.map(function(row) {
        var evt = new DomainEvent(row.name, row.aggregate_id, row.data);
        evt.createdAt = new Date(row.created_at);
        return evt;
      });
    }
  }

  return {
    all: function all(cb) {
      var sql = format(SELECT_ALL_QUERY, tableName);

      doQuery(sql, function(err, result) {
        cb(err, resultToEvents(result));
      });
    },
    push: function push(event, cb) {
      var sql = format(INSERT_QUERY_START + INSERT_QUERY_VALUES,
        tableName,
        event.name,
        event.aggregateId,
        event.data,
        event.createdAt.toUTCString()
      );

      doQuery(sql, cb);
    },
    pushAll: function pushAll(eventsArray, cb) {
      var sqlStart  = format(INSERT_QUERY_START, tableName),
          sqlValues = [];

      eventsArray.forEach(function(event) {
        sqlValues.push(format(INSERT_QUERY_VALUES,
          event.name,
          event.aggregateId,
          event.data,
          event.createdAt.toUTCString()
        ));
      });

      doQuery(sqlStart + sqlValues.join(', '), cb);
    },
    getOfId: function getOfId(aggregateId, cb) {
      var sql = format(SELECT_ONE_QUERY, tableName, aggregateId);

      doQuery(sql, function(err, result) {
        cb(err, resultToEvents(result));
      });
    }
  };
}

module.exports =  EventPostgresStore;
