function DomainEvent(name, aggregateId, data) {
  this.name = name;
  this.aggregateId = aggregateId;
  this.data = data;
  this.createdAt = new Date();
}

DomainEvent.fromJSON = function fromJSON(json) {
  var evt = new DomainEvent();
  if (typeof json === 'string') {
    json = JSON.parse(json);
  }
  merge(evt, json);
  evt.createdAt = new Date(json.createdAt);
  return evt;
};

function merge(obj, data) {
  Object.keys(data).forEach(function(key) {
    obj[key] = data[key];
  });
}
module.exports = DomainEvent;
