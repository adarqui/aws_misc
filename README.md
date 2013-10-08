a few miscellaneous aws (amazon web services) scripts.

aws_misc.js

		a small set of aws functons I needed for some other program. Turned it into a small library.


create_and_tag.js

		launches an ec2 instance based on an ami, allowing you to specify the instance type, zone, and a tag that will be set once it is created.

		run: node create_and_tag.js ami-XXX some.host.name c1.xlarge


list.js

		simply list the ec2 instances associated with your key/secret.

		run: node list

-- {}
