
var expect = require('chai').expect,
  Scatter = require('../lib');

describe('Scatter Complex wiring',function() {
  
  describe("Loop  in factories", function() {
    var scatter = new Scatter({
      initializeTimeout: 200,
      instatiateTimeout: 200
    });
    scatter.addRoots(__dirname + '/03-complexWiring/loopFactories');

    it('should cause deadlock exception', function(done) {
      scatter.load('svc!trigger_bootstrap').then(function(svc) {
        return svc.sequence().then(function(){
          done(new Error("No exception thrown"));
        })
      }).otherwise(function(err) {
        expect(err).to.match(/deadlock/);
        done();
      }).otherwise(done);
    });
  });
  
  
  describe("Loop in onInit", function() {
    var scatter = null;
    
    beforeEach(function() {
      scatter = new Scatter({
        initializeTimeout: 200,
        instatiateTimeout: 200
      });
      scatter.addRoots(__dirname + '/03-complexWiring/loopOnInit');
    });

    it('Load module should cause deadlock', function(done) {
      scatter.load('Module1').then(function() {
        done(new Error("No exception thrown"));
      }).otherwise(function(err) {
        expect(err).to.match(/deadlock/);
        done();
      }).otherwise(done);
    });
    
    it('Svc invocation should cause deadlock', function(done) {
      scatter.load('svc!svc').then(function(svc) {
        return svc.sequence().then(function() {
          done(new Error("No exception thrown"));
        });
      }).otherwise(function(err) {
        expect(err).to.match(/deadlock/);
        done();
      }).otherwise(done);
    });
  });


  describe("Mixed loop factory/inject 1 (race condition)", function() {
    var scatter = new Scatter();
    scatter.addRoots(__dirname + '/03-complexWiring/mixedLoop1');

    it('should NOT cause deadlock', function(done) {
      scatter.load('svc!trigger_bootstrap').then(function(svc) {
        return svc.sequence().then(function(results) {
          expect(results).to.have.length(2);
          expect(results).to.contain(1);
          expect(results).to.contain(2);
          done();
        });
      }).otherwise(done);
    });
  });


  describe("Mixed loop factory/inject 2 (race condition)", function() {
    var scatter = new Scatter();
    scatter.addRoots(__dirname + '/03-complexWiring/mixedLoop2');

    it('should NOT cause deadlock', function(done) {
      scatter.load('svc!trigger_bootstrap').then(function(svc) {
        return svc.sequence().then(function(results) {
          expect(results).to.have.length(2);
          expect(results).to.contain("1mod2");
          expect(results).to.contain("2mod1");
          done();
        })
      }).otherwise(done);
    });
  });


  

  describe("Branched loop with 1 deadlock", function() {
    var scatter = new Scatter({
      initializeTimeout: 200,
      instatiateTimeout: 200
    });
    scatter.addRoots(__dirname + '/03-complexWiring/longLoopDeadlock');

    it('should cause deadlock exception', function(done) {
      scatter.load('A').then(function(dep) {
        done(new Error("No exception thrown"));
      }).otherwise(function(err) {
        expect(err).to.match(/deadlock/);
        done();
      }).otherwise(done);
    });
  });


  describe("Branched loop with no deadlocks", function() {
    var scatter = new Scatter();
    scatter.addRoots(__dirname + '/03-complexWiring/longLoop');

    it('should not cause exception or locks', function(done) {
      scatter.load('A').then(function(dep) {
        done();
      }).otherwise(done);
    });
  });

  describe("bootstrapAll()", function() {
    var scatter = new Scatter({
      initializeTimeout: 200,
      instatiateTimeout: 200
    });
    scatter.addRoots(__dirname + '/03-complexWiring/loopOnInit');

    it('should find deadlocks in initialization', function(done) {
      scatter.bootstrapAll().then(function() {
        done(new Error("No exception thrown"));
      }).otherwise(function(err) {
        //expect(results).to.have.length(2);
        expect(err).to.match(/deadlock/);
        done();
      });
    });
  });


  describe("bootstrapAll()", function() {
    var scatter = new Scatter({
      initializeTimeout: 200,
      instatiateTimeout: 200
    });
    scatter.addRoots(__dirname + '/03-complexWiring/loopFactories');

    it('should find deadlocks in instantiation', function(done) {
      scatter.bootstrapAll().then(function() {
        done(new Error("No exception thrown"));
      }).otherwise(function(err) {
        //expect(results).to.have.length(2);
        expect(err).to.match(/deadlock/);
        done();
      });
    });
  });

});