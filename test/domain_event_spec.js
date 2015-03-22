
var DomainEvent = require('../domain_event');
var expect = require('expect.js');

describe('DomainEvent', function() {
  // describe('#toJSON', function() {
  //   it('returns a complete JSON representation for storing somewhere', function() {
  //     // TODO: stub Time
  //     var evt = new DomainEvent('MyEvent', 3, { foo: 'bar', answer: 42 });
  //     var json = evt.toJSON();
  //     expect(JSON.parse(json)).to.equal({
  //       name: 'MyEvent',
  //       aggregateId: 3,
  //       data: { foo: 'bar', answer: 42 },
  //       createdAt: now
  //     });
  //   });
  // });

  describe('#fromJSON', function() {
    it('returns a DomainEvent instance with everything set', function() {
      var json = '{"name":"MyEvent","aggregateId":3,"data":{"foo":"bar","answer":42},"createdAt":"2015-01-23T18:23:26.164Z"}';
      var evt = DomainEvent.fromJSON(json);

      expect(evt.name).to.eql('MyEvent');
      expect(evt.aggregateId).to.eql(3);
      expect(evt.createdAt).to.eql(new Date('2015-01-23T18:23:26.164Z'));
      expect(evt.data.foo).to.eql('bar');
      expect(evt.data.answer).to.eql(42);
    });
  });
});
