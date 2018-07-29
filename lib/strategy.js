/**
 * Module dependencies.
 */
const util = require('util');
const OAuth2Strategy = require('passport-oauth2');
const debug = require('debug')('passport-polar');
const querystring = require('querystring');

/**
 * `Strategy` constructor.
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy (options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://flow.polar.com/oauth2/authorization';
  options.tokenURL = options.tokenURL || 'https://polarremote.com/v2/oauth2/token';
  options.customHeaders = options.customHeaders || {};

  const bearerToken = Buffer.from(
    options.clientID + ':' + options.clientSecret,
    'utf-8'
  ).toString('base64');
  options.customHeaders.Authorization = 'Basic ' + bearerToken;
  options.customHeaders.Accept = 'application/json;charset=UTF-8';

  debug('Calling super with options: %j', options);
  OAuth2Strategy.call(this, options, verify);
  this._oauth2.getOAuthAccessToken = function (code, params, callback) {
    debug('Ovveriden getOAuthAccessToken is invoked with code (%s) and params (%j)', code, params);
    /* eslint-disable-next-line no-redeclare */
    var params = params || {};
    var codeParam = (params.grant_type === 'refresh_token') ? 'refresh_token' : 'code';
    params[codeParam] = code;
    /* eslint-disable-next-line camelcase */
    var post_data = querystring.stringify(params);
    /* eslint-disable-next-line camelcase */
    var post_headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    /* eslint-disable-next-line camelcase */
    this._request('POST', this._getAccessTokenUrl(), post_headers, post_data, null, function (error, data, response) {
      if (error) callback(error);
      else {
        var results;
        try {
          // As of http://tools.ietf.org/html/draft-ietf-oauth-v2-07
          // responses should be in JSON
          results = JSON.parse(data);
        } catch (e) {
          // .... However both Facebook + Github currently use rev05 of the spec
          // and neither seem to specify a content-type correctly in their response headers :(
          // clients of these services will suffer a *minor* performance cost of the exception
          // being thrown
          results = querystring.parse(data);
        }
        /* eslint-disable-next-line camelcase */
        var access_token = results['access_token'];
        /* eslint-disable-next-line camelcase */
        var refresh_token = results['refresh_token'];
        delete results['refresh_token'];
        /* eslint-disable-next-line camelcase */
        callback(null, access_token, refresh_token, results); // callback results =-=
      }
    });
  };
  this.name = 'polar';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
