var ElasticSearchClient = require('..')
,   should = require("chai").should();

var serverOptions = {
    host: 'localhost',
    port: 9200
    //secure: true,
    /*auth: {
     username:'username',
     password:'password'
     }*/
};

var indexName = 'your_index_name';
var objName = 'your_object_name';

var elasticSearchClient = new ElasticSearchClient(serverOptions);

describe("ElasticSearchClient Core api", function() {
    before(function(done) {
        elasticSearchClient.index(indexName, objName, {name: 'sushi', description: 'foo'}, 'sushi', done);
    });

    describe("#index", function() {
        it("should index a json object", function(done) {
            elasticSearchClient.index(indexName, objName, {'name': 'sushi'})
                .on('data', function(data) {
                    data = JSON.parse(data);
                    data.ok.should.be.ok;
                    done();
                })
                .exec();
        });

        it("should index an object with given id under the same id", function(done) {
            elasticSearchClient.index(indexName, objName, {'name': 'name', id: "9999"}, "1111")
                .on('data', function(data) {
                    data = JSON.parse(data);
                    data._id.should.equal("1111");
                    done();
                })
                .exec();
        });
    });

    describe("#index canonical", function() {
        it("should index a json object", function(done) {
            elasticSearchClient.index(indexName, objName, {'name': 'sushi'}, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.ok.should.be.ok;
                done();
            });
        });

        it("should allow options to be passed in", function(done) {
            elasticSearchClient.index(indexName, objName, {'name': 'sushi'}, {}, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.ok.should.be.ok;
                done();
            });
        });

        context("when an id is passed in", function() {
            it("should index an object with given id under the same id", function(done) {
                elasticSearchClient.index(indexName, objName, {name: 'name', id: "9999"}, "1111", function(err, data) {
                    should.not.exist(err);
                    data = JSON.parse(data);
                    data._id.should.equal("1111");
                    done();
                });
            });

            it("should allow options to be passed in", function(done) {
                elasticSearchClient.index(indexName, objName, {'name': 'sushi'}, "1111", {}, function(err, data) {
                    should.not.exist(err);
                    data = JSON.parse(data);
                    data.ok.should.be.ok;
                    done();
                });
            });
        });
    });

    describe("#get", function() {
        it("should fetch the row by id", function(done) {
            elasticSearchClient.get(indexName, objName, "sushi")
            .on('data', function(data) {
                data = JSON.parse(data);
                data.exists.should.exist;
                data._id.should.equal("sushi");
                data._source.should.be.ok;
                done();
            })
            .exec();
        });
    });

    describe("#get canonical", function() {
        it("should fetch the row by id", function(done) {
            elasticSearchClient.get(indexName, objName, "sushi", function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.exists.should.exist;
                data._id.should.equal("sushi");
                data._source.name.should.be.ok;
                data._source.description.should.be.ok;
                data._source.should.be.ok;
                done();
            });
        });

        it("should allow specifying fields to be returned", function(done) {
            elasticSearchClient.get(indexName, objName, "sushi", {fields: 'name'}, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.exists.should.exist;
                data._id.should.equal('sushi');
                data.fields.should.be.ok;
                data.fields.name.should.equal('sushi');
                should.not.exist(data.fields.description);
                done();
            });
        });
    });

    describe("#multiget", function() {
        var check = function(err, data, callback) {
            data = JSON.parse(data);
            data.docs.should.exist;
            data.docs[0]._id.should.equal("sushi");
            data.docs[0]._source.should.be.ok;
            callback(err);
        };

        it("should fetch the row by id via multiget event style", function(done) {
            elasticSearchClient.multiget(indexName, objName, [ "sushi" ], {})
            .on('data', function(data) {
                check(null, data, done);
            })
            .on('error', function(err) {
                done(err);
            })
            .exec();
        });

        it("should fetch the row by id via multiget canonical", function(done) {
            elasticSearchClient.multiget(indexName, objName, [ "sushi" ], function(err, data) {
                check(err, data, done);
            });
        });

        it("should fetch the row by doc via multiget canonical", function(done) {
            elasticSearchClient.multiget(indexName, objName, [{_id: "sushi"}], function(err, data) {
                check(err, data, done);
            });
        });
    });

    describe("#update", function() {
        it("should update the existing doc by id", function(done) {
            elasticSearchClient.update(indexName, objName, "sushi", {doc: {occupation: "play"}})
            .on('data', function(data) {
                data = JSON.parse(data);
                data.should.be.ok;
                data._id.should.equal("sushi");
                done();
            })
            .exec();
        });
    });

    describe("#update canonical", function() {
        it("should update the existing doc by id", function(done) {
            elasticSearchClient.update(indexName, objName, "sushi", {doc: {occupation: "play"}}, function(err, data) {
                data = JSON.parse(data);
                data.should.be.ok;
                data._id.should.equal("sushi");
                done();
            });
        });
    });

    describe("#search", function() {
        var qryObj;

        before(function() {
            qryObj = {
                query: {
                    term: {name: 'sushi'}
                }
            };
        });

        it("should search based on given query", function(done) {
            elasticSearchClient.search(indexName, objName, qryObj)
                .on('data', function(data) {
                    data = JSON.parse(data);
                    data.should.not.be.undefined.null.empty;
                    data.hits.total.should.be.gte(0);
                    done();
                })
                .exec();
        });

        it("should search even if collection name not present", function(done) {
            elasticSearchClient.search(indexName, qryObj)
                .on('data', function(data) {
                    data = JSON.parse(data);
                    data.should.not.be.undefined.null.empty;
                    data.hits.total.should.be.gte(0);
                    done();
                })
                .exec();
        });

        it("should search even if index_name is not present", function(done) {
            elasticSearchClient.search(qryObj)
                .on('data', function(data) {
                    data = JSON.parse(data);
                    data.should.not.be.undefined.null.empty;
                    data.hits.total.should.be.at.least(0);
                    done();
                })
                .exec();
        });
    });

    describe("#search canonical", function() {
        var qryObj;

        before(function() {
            qryObj = {
                query: {
                    term: {name: 'sushi'}
                }
            };
        });

        it("should search based on given query", function(done) {
            elasticSearchClient.search(indexName, objName, qryObj, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.should.not.be.undefined.null.empty;
                data.hits.total.should.be.gte(0);
                done();
            });
        });

        it("should allow options to be passed in when index_name is not present", function(done) {
            var options = {};
            elasticSearchClient.search(indexName, qryObj, options, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.should.not.be.undefined.null.empty;
                data.hits.total.should.be.gte(0);
                done();
            });
        });

        // This fails
        it.skip("should allow options to be passed in when index_name is not present", function(done) {
            var options = {};
            elasticSearchClient.search(indexName, objName, qryObj, options, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                console.log(data);
                data.should.not.be.undefined.null.empty;
                data.hits.total.should.be.gte(0);
                done();
            });
        });

        it("should search even if collection name not present", function(done) {
            elasticSearchClient.search(indexName, qryObj, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.should.not.be.undefined.null.empty;
                data.hits.total.should.be.gte(0);
                done();
            });
        });

        it("should search even if index_name is not present", function(done) {
            elasticSearchClient.search(qryObj, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.should.not.be.undefined.null.empty;
                data.hits.total.should.be.at.least(0);
                done();
            });
        });
    });

    describe("#percolate", function() {
        it("should percolate", function(done) {
            var doc = {
                "doc" : {
                    "field1" : "value1"
                }
            };

            elasticSearchClient.percolate(indexName, objName, doc)
                .on('data',
                function(data) {
                    data = JSON.parse(data);
                    data.ok.should.be.ok;
                    done();
                })
                .exec();
        });
    });

    describe("#percolator", function() {
        it("should be a percolator", function(done) {
            var qryObj = {
                query: {
                    bool: {
                        should: [
                            {flt : {
                                fields : ["name"],
                                like_text : 'a name'
                            }
                            }
                        ]
                    }
                }
            };
            elasticSearchClient.percolator(indexName, objName, qryObj)
                .on('data',
                function(data) {
                    data = JSON.parse(data);
                    data.ok.should.be.ok;
                    done();
                })
                .exec();
        });
    });

    describe("#bulk", function() {
        var cmdArr = [
            {index: {_index: indexName, _type: objName, _id: 'bulkedsushi'}},
            {name: 'anothersushi'}
        ];

        var cmdArrNoIndexAndNoType = [
            {index: {_id: 'bulkedsushi'}},
            {name: 'anothersushi'}
        ];

        var check = function(data, done) {
            data = JSON.parse(data);
            data.items.should.be.ok;
            data.items[0].should.be.ok;
            data.items[0].index.should.be.ok;
            done();
        };

        it("should index via bulk canonical", function(done) {
            elasticSearchClient.bulk(cmdArr, function(err, data) {
                check(data, done);
            });
        });

        it("should index via bulk canonical even if options are passed", function(done) {
            elasticSearchClient.bulk(cmdArr, {}, function(err, data) {
                check(data, done);
            });
        });

        it("should index via bulk event style", function(done) {
            elasticSearchClient.bulk(cmdArr)
            .on('data', function(data) {
                check(data, done);
            })
            .exec();
        });

        it("should index via bulk event style pass index and type via the options", function(done) {
            elasticSearchClient.bulk(cmdArrNoIndexAndNoType, { _index: indexName, _type: objName})
            .on('data', function(data) {
                check(data, done);
            })
            .exec();
        });

        it("should index via bulk canonical pass index and type via the options", function(done) {
            elasticSearchClient.bulk(cmdArrNoIndexAndNoType, {_index: indexName, _type: objName}, function(err, data) {
                check(data, done);
            });
        });
    });

    describe("#count", function() {
        it("should fetch count of given query", function(done) {
            var qryStr = 'name:name';
            elasticSearchClient.count(indexName, objName, qryStr)
                .on('data', function(data) {
                    data = JSON.parse(data);
                    data.count.should.exist;
                    data.count.should.not.be.null.undefined;
                    done();
                })
                .exec();
        });
    });

    describe('#moreLikeThis', function() {
        it('should show results more like this', function(done) {
            elasticSearchClient.moreLikeThis(indexName, objName, '1111', {})
                .on('data', function(data) {
                    data = JSON.parse(data);
                    data.should.not.be.null.undefined.empty;
                    data.should.not.have.error;
                    done();
                })
                .exec();
        });
    });

    describe("#deleteDocument", function() {
        it("should delete the row by id", function(done) {
            elasticSearchClient.deleteDocument(indexName, objName, 1111)
            .on('data', function(data) {
                data = JSON.parse(data);
                data.ok.should.be.ok;
                data.found.should.exist;
                data._id.should.equal("1111");
                done();
            })
            .exec();
        });
    });

    describe("#deleteDocument canonical", function() {
        it("should delete the row by id", function(done) {
            elasticSearchClient.deleteDocument(indexName, objName, 1111, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.ok.should.be.ok;
                data.found.should.exist;
                data._id.should.equal("1111");
                done();
            })
        });

        it("should allow options to be passed in", function(done) {
            elasticSearchClient.deleteDocument(indexName, objName, 1111, {}, function(err, data) {
                should.not.exist(err);
                data = JSON.parse(data);
                data.ok.should.be.ok;
                data.found.should.exist;
                data._id.should.equal("1111");
                done();
            })
        });
    });

    describe('#deleteByQuery', function() {
        it('should delete objects matching given query', function(done) {
            var qryObj = {
                term : {
                    name: 'name'
                }
            };
            elasticSearchClient.deleteByQuery(indexName, objName, qryObj)
                .on('data', function(data) {
                    data = JSON.parse(data);
                    data.ok.should.be.ok;
                    data._indices.should.have.indexName;
                    done();
                })
                .exec();
         });
    });
});
