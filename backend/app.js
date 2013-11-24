var restify = require('restify');
var mongojs = require("mongojs");

var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';

var db_name = process.env.OPENSHIFT_APP_NAME || "localjobs";

var connection_string = '127.0.0.1:27017/' + db_name;
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

var db = mongojs(connection_string, [db_name]);
var jobs = db.collection("jobs");


var server = restify.createServer({
	name : "localjobs"
});

server.pre(restify.pre.userAgentConnection());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.fullResponse());
server.use(restify.bodyParser());
server.use(restify.CORS());


function findAllJobs(req, res , next){
	res.setHeader('Access-Control-Allow-Origin','*');
	jobs.find().limit(20).sort({postedOn : -1} , function(err , success){
		console.log('Response success '+success);
		console.log('Response error '+err);
		if(success){
			res.send(200 , success);
			return next();
		}else{
			return next(err);
		}
		
	});
	
}

function findJob(req, res , next){
	res.setHeader('Access-Control-Allow-Origin','*');
	jobs.findOne({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
		console.log('Response success '+success);
		console.log('Response error '+err);
		if(success){
			res.send(200 , success);
			return next();
		}
		return next(err);
	})
}

function postNewJob(req , res , next){
	var job = {};
	job.title = req.params.title;
	job.description = req.params.description;
	job.location = req.params.location;
	job.postedOn = new Date();

	res.setHeader('Access-Control-Allow-Origin','*');
	
	jobs.save(job , function(err , success){
		console.log('Response success '+success);
		console.log('Response error '+err);
		if(success){
            res.send(201 , job);
			return next();
        }else{
			return next(err);
       	}
	});
}

function deleteJob(req , res , next){
	res.setHeader('Access-Control-Allow-Origin','*');
	jobs.remove({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
		console.log('Response success '+success);
		console.log('Response error '+err);
		if(success){
			res.send(204);
			return next();		
		} else{
			return next(err);
		}
	})
	
}

var PATH = '/jobs'

server.get({path : PATH , version : '0.0.1'} , findAllJobs);
server.get({path : PATH +'/:jobId' , version : '0.0.1'} , findJob);
server.post({path : PATH , version: '0.0.1'} ,postNewJob);
server.del({path : PATH +'/:jobId' , version: '0.0.1'} ,deleteJob);


server.listen(port ,ip_addr, function(){
	console.log('%s listening at %s ', server.name , server.url);
})