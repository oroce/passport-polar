/* global describe, it, expect, before */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const PolarStrategy = require('../lib/strategy');

describe('Strategy', function () {
  describe('constructed', function () {
    var strategy = new PolarStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    },
    function () { });

    it('should be named polar', function () {
      expect(strategy.name).to.equal('polar');
    });
  });

  describe('constructed with undefined options', function () {
    it('should throw', function () {
      expect(function () {
        const strategy = new PolarStrategy(undefined, function () { });
        expect(strategy).to.exist;
      }).to.throw(Error);
    });
  });

  describe('failure caused by user denying request', function () {
    var strategy = new PolarStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function () { });

    var info;

    before(function (done) {
      chai.passport.use(strategy)
        .fail(function (i) {
          info = i;
          done();
        })
        .req(function (req) {
          req.query = {};
          req.query.error = 'access_denied';
          req.query.error_code = '200';
          req.query.error_description = 'Permissions error';
          req.query.error_reason = 'user_denied';
        })
        .authenticate();
    });

    it('should fail with info', function () {
      expect(info).to.not.be.undefined;
      expect(info.message).to.equal('Permissions error');
    });
  });
});
