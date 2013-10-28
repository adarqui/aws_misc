/*
 * list aws servers
 */
var deps = {
    aws : require('aws-sdk'),
    awsm : require('./aws_misc.js'),
}

var conf = {
    ec2 : {},
}

awsm = new deps.awsm();

/*
conf.ec2 = new deps.aws.EC2();
*/

var match_string = process.argv[2]
var re = new RegExp(match_string)
var cbx = function(err,data) {
    for(var v in data.dns) {
        var re2 = re.exec(v)
        if(re2) {
            console.log(v, data.dns[v].prvIP, data.dns[v].instanceId)
        }
    }
}

awsm.i.list({
    cb : function(err, data) {
        data.config = {}
        data.ip = {}
        data.instance = {}

        for(var v in data.dns) {
        /*
         * This may seem like overkill, and it probably is, but we just need quick hash references to a bunch of data depending on the request
         */
            data.config[data.dns[v].tag] = { data: data.dns[v].self }
            data.ip[data.dns[v].prvIP] = { data : data.dns[v].self }
            data.instance[data.dns[v].instanceId] = { data : data.dns[v].self }
        }

        /* Run the callback */
        cbx(err,data)
    },
    fill : [ 'dns' ]
})
