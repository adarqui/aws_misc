/*
 * node create_and_tag.js ami-XXX some.host.name c1.xlarge
 *
 *  simple script to create an ec2 instance & then subsequently tag it
 */
var deps = {
    aws     : require('aws-sdk'),
}

var conf = {
    ec2     : {},
    creds   : './creds.json'
}

conf.creds = process.env['CREDS'] ? process.env['CREDS'] : './creds.json';
deps.aws.config.loadFromPath(conf.creds);

conf.ec2 = new deps.aws.EC2();

conf.ec2.runInstances({
	ImageId : process.argv[2],
	MinCount : 1,
	MaxCount : 1,
	InstanceType : process.argv[4],
}, function(err,data) {
	console.log("runInstances:", err, data)
	conf.ec2.createTags({
	    Resources : [
		data.Instances[0].InstanceId,
	    ],
	    Tags :[
		{ Key:  'Name',  Value : process.argv[3]  }
	    ]
	}, function(err,data) {
	    console.log("Result of createTags:",err,data)
	    process.exit(0);
	})
})
