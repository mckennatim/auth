var superagent = require('superagent')
var expect = require('expect.js')
var _ = require('underscore')

var httpLoc = 'http://10.0.1.24:3030/'
describe('superagent:', function(){
  it('POSTs user to /api/authenticate', function(done){
    var user = {user: 'tim', email: 'mckenna.tim@gmail.com', apikey: '1234567'}
    superagent.post(httpLoc+'api/authenticate/')
      .send(user)
      .end(function(e,res){
        console.log(res.body);
        expect(res.body.message).to.be('Authenticated')
        done()
      })    
  })
  it('GETs user to /api/account', function(done){
    var user = {user: 'tim', email: 'mckenna.tim@gmail.com', apikey: '123467'}
    superagent.get(httpLoc+'api/account/')
      .send(user)
      .end(function(e,res){
        console.log(res.body.name);
        expect(res.body.name).to.be(user.user)
        done()
      })    
  })
 })
